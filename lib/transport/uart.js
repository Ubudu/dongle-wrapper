/*jslint node: true */
'use strict';

/**
 * @file transport/uart.js
 * 
 * Provides nrf_dongle messaging over UART 
 * 
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;

var debug = require('debug')('ub_dongle:lib:transport:uart');
var async = require('async');

util.inherits(UBDongleTransportUART, EventEmitter);


/**
 *
 */
function UBDongleTransportUART(options)
{ 
  var self = this;
  var portOptions = {
    baudRate: options.baudRate,
    autoOpen: false//options.autoOpen
  };

  this.serialPortPath = options.serialPort;
  this.port = new SerialPort(options.serialPort, portOptions);
  this.parser = new Readline({ delimiter: '\r\n' });
  this.port.pipe(this.parser);
  this.parser.on('data', self._parseIncomingData.bind(this));

  //debug('UBDongleTransportUART', options);
  this.port.open( (err) => {
    // debug('port open', self.serialPort, 'err: ', err);
    self.port.write('\r\n', 'ascii', function(){
      self.emit('ready', err, self);
    });
  });
}

/**
 * Static function for discovery of connected USB devices
 */
UBDongleTransportUART.discoverDevices = function(options, callback)
{
  SerialPort.list( (err, ports) => {
    callback(err, ports);
  });
};

/**
 * Close and free serial port
 *
 * @param   Function  callback    function(error, data){}
 */
UBDongleTransportUART.prototype.close = function(callback)
{
  this.parser.removeAllListeners('data');
  this.port.removeAllListeners('data');
  this.port.removeAllListeners('open');
  this.port.close( (error) => {
    callback(error);
  });
};


/**
 * Add '\r\n' to command and execute it + determine if executed correctly
 * @param   Object      cmd             Command object to execute
 * @return  Promise                     Promise which resolves if parsing was successful
 */
UBDongleTransportUART.prototype.executeCommand = function(cmd)
{
  var self = this;
  var promise = new Promise(function(resolve, reject){
    debug('_executeCommand@', self.port.path, '>>: ', cmd.cmd());
    var dataBuffer = '';

    var dataHandler = (data) => {
      dataBuffer += data + "\r\n";
      try{
        var parsedData = cmd.parse(dataBuffer);
        if( parsedData !== null && parsedData !== undefined ){
          self.parser.removeListener('data', dataHandler);
          resolve(parsedData);
        }
      }catch(err){
        self.parser.removeListener('data', dataHandler);
        reject(err);
      }
    };

    self.parser.on('data', dataHandler);
    self.port.write(cmd.cmd()+"\r\n");

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
UBDongleTransportUART.prototype._parseIncomingData = function(data)
{
  this.emit('data-rx', data);
};

module.exports = UBDongleTransportUART;
