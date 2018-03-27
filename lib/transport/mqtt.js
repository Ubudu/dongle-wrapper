/*jslint node: true */
'use strict';

/**
 * @file transport/mqtt.js
 * 
 * Provides nrf_dongle messaging over MQTT 
 * 
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var mqtt = require('mqtt')

var debug = require('debug')('ub_dongle:lib:transport:mqtt');
var async = require('async');

util.inherits(UBDongleTransportMQTT, EventEmitter);


/**
 *
 */
function UBDongleTransportMQTT(options)
{ 
  var self = this;

  this.brokerUrl = options.brokerUrl;
  this.deviceId = options.deviceId;
  if( this.brokerUrl.substr(0, 7) != 'mqtt://' ){
    this.brokerUrl = 'mqtt://' + this.brokerUrl;
  }

  this.mqtt = mqtt.connect(this.brokerUrl);
  this.mqtt.on('connect', () => {
    self.mqtt.subscribe(this.deviceId + '/serial/read');
    self.mqtt.on('message', self._parseIncomingData.bind(self));
    self.emit('ready', null, self);
  });
}

/**
 * Static function for discovering USB devices connected to specified gateway
 * 
 * @param   Object    options     MQTT options
 * @param   Function  callback    function(error, data){}
 */
UBDongleTransportMQTT.discoverDevices = function(options, callback)
{
  var self = this;
  debug('discoverDevices');
  var brokerUrl = options.brokerUrl;

  if( brokerUrl.substr(0, 7) != 'mqtt://' ){
    brokerUrl = 'mqtt://' + brokerUrl;
  }

  var conn = mqtt.connect(brokerUrl);
  conn.on('connect', () => {
    conn.subscribe('status/response');
    conn.on('message', (topic, data) => {
      if( topic === 'status/response' ){
        var devices = JSON.parse(data.toString('ascii'));
        conn.end();
        callback(null, devices);
      }
    });
    conn.publish('status/request','');
  });
};


/**
 * Close and free serial port
 *
 * @param   Function  callback    function(error, data){}
 */
UBDongleTransportMQTT.prototype.close = function(callback)
{
  debug('Closing', this.brokerUrl);
  this.mqtt.removeAllListeners('open');
  this.mqtt.removeAllListeners('message');
  this.mqtt.end();
  callback(null);
};


/**
 * Add '\r\n' to command and execute it + determine if executed correctly
 * @param   Object      cmd             Command object to execute
 * @return  Promise                     Promise which resolves if parsing was successful
 */
UBDongleTransportMQTT.prototype.executeCommand = function(cmd)
{
  debug('executeCommand', cmd);
  var self = this;
  var promise = new Promise(function(resolve, reject){
    var c = cmd.cmd() + '\r\n';
    var topic = self.deviceId + '/serial/write';
    debug('_executeCommand@', self.brokerUrl, '/' + topic + '>>: ', c);

    var dataBuffer = '';
    var dataHandler = (topic, data) => {
      if( topic === self.deviceId + '/serial/read' && data.length > 2 ){
        //MQTT currently returns '\n' as endline and parsers assume '\r\n'
        dataBuffer += Buffer.from(data).toString('ascii').replace('\n','\r\n');
        try{
          var parsedData = cmd.parse(dataBuffer);
          if( parsedData !== null && parsedData !== undefined ){
            self.mqtt.removeListener('message', dataHandler);
            resolve(parsedData);
          }
        }catch(err){
          self.mqtt.removeListener('message', dataHandler);
          reject(err);
        }
      }
    };
    self.mqtt.on('message', dataHandler);
    self.mqtt.publish(topic, c);
  });
  return promise;
};


////////////////////////////////////////////////////////////////////////////////
// Private functions
////////////////////////////////////////////////////////////////////////////////

/**
 * Function for parsing all incoming data and forwarding it 
 * for later processing, eg. logging or parsing events out of the stream
 * 
 * @param   String   data     Incoming data chung  
 */
UBDongleTransportMQTT.prototype._parseIncomingData = function(topic, message)
{
  var msgString = Buffer.from(message).toString('ascii');
  debug('_parseIncomingData', topic, msgString);
  this.emit('data-rx', msgString);
};

module.exports = UBDongleTransportMQTT;
