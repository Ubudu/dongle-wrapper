/*jslint node: true */
'use strict';

/**
 * @file ub_dongle.js
 * 
 * Main class to interact with nrf_dongle over different transport
 *  eg. UART, MQTT.
 */


var util = require('util');
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('ub_dongle:lib');
var async = require('async');

util.inherits(UBDongle, EventEmitter);

//Transports
var UBDongleTransportUART = require('./transport/uart');
var UBDongleTransportMQTT = require('./transport/mqtt');

//Event parser
var UBDongleEventParser = require('./event/parser.js');

//Commands
var UBDongleCmd_deviceInfo = require('./cmd/device_info');
var UBDongleCmd_deviceName = require('./cmd/device_name');
var UBDongleCmd_timestamp = require('./cmd/timestamp');
var UBDongleCmd_restoreDefaults = require('./cmd/restore_defaults');
var UBDongleCmd_bleConnections = require('./cmd/ble_connections');
var UBDongleCmd_bleDisconnect = require('./cmd/ble_disconnect');

var UBDongleCmd_bleUartTx = require('./cmd/ble_uart_tx');

var UBDongleCmd_adv = require('./cmd/adv');
var UBDongleCmd_advPayload = require('./cmd/adv_payload');
var UBDongleCmd_advSettings = require('./cmd/adv_settings');

var UBDongleCmd_scan = require('./cmd/scan');

/**
 *
 */
function UBDongle(transport, options)
{
  var self = this;
  this.identifier = null;
  this.transport = null;
  this.eventParser = new UBDongleEventParser();

  if( transport == 'uart' ){
    this.transport = new UBDongleTransportUART(options);
    this.identifier = 'uart:' + options.serialPort;
    this.ttyName = options.serialPort.split('/').pop();
  }
  if( transport == 'mqtt' ){
    this.transport = new UBDongleTransportMQTT(options);
    this.identifier = 'mqtt:' + options.brokerUrl + ":" + options.deviceId;
    this.ttyName = options.deviceId;
  }

  if( this.transport ){
    this.transport.on('ready', (err) => {
      self.emit('ready', err, self);
    });
    //Capture all incoming data and extract events from it
    this.transport.on('data-rx', (data) => {
      // debug('data-rx', data);
      var evt = self.eventParser.parse(data);
      if( evt ){
        self.emit(evt.name, evt.data, this);
      }
    });
  }
}

/**
 *
 */
UBDongle.discoverDevices = function(transport, options, callback)
{
  if( transport == 'uart' ){
    this.devices = UBDongleTransportUART.discoverDevices(options, callback);
  }
  if( transport == 'mqtt' ){
    this.devices = UBDongleTransportMQTT.discoverDevices(options, callback);
  }

  return [];
};

/**
 *
 * @param   Function  callback    function(error, data){}
 */
UBDongle.prototype.close = function(callback)
{
  this.transport.removeAllListeners('ready');
  this.transport.removeAllListeners('data-rx');
  this.transport.close(callback);
};

/**
 * Get basic device information
 * 
 * @param   Function  callback    function(error, data){}
 */
UBDongle.prototype.deviceInfo = function(callback)
{
  var cmd = new UBDongleCmd_deviceInfo();
  var promise = this.transport.executeCommand(cmd);

  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });
};

/**
 * Get/set device name
 *
 * @param   String    name      Name of the device (as ascii)
 * @param   Function  callback  function(error, data){}
 */
UBDongle.prototype.deviceName = function(name, callback)
{
  var cmd = new UBDongleCmd_deviceName(name);
  var promise = this.transport.executeCommand(cmd);

  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });
};

/**
 *
 */
UBDongle.prototype.timestamp = function(settings, callback)
{
  var cmd = new UBDongleCmd_timestamp(settings);
  var promise = this.transport.executeCommand(cmd);
  
  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });
};

/**
 *
 */
UBDongle.prototype.timestamp_data = function()
{
  return UBDongleCmd_timestamp.data();
};

/**
 * Restores dongle to default state
 *
 * @param   Function  callback    function(error, data){}
 */
UBDongle.prototype.restoreDefaults = function(callback)
{
  var cmd = new UBDongleCmd_restoreDefaults();
  var promise = this.transport.executeCommand(cmd);

  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });
};

/**
 * Get list of current BLE connections
 *
 * @param   Function  callback    function(error, data){}
 */
UBDongle.prototype.bleConnections = function(callback)
{
  var cmd = new UBDongleCmd_bleConnections();
  var promise = this.transport.executeCommand(cmd);

  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });
};

/**
 * Send data from UART to BLE (NUS)
 *
 * @param   Number    connectionId  
 * @param   String    payload       
 * @param   Function  callback      function(error, data){}
 */
UBDongle.prototype.bleUartTx = function(connectionId, payload, callback)
{
  var cmd = new UBDongleCmd_bleUartTx(connectionId, payload);
  var promise = this.transport.executeCommand(cmd);

  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });
};

/**
 * Terminate a BLE connection
 *
 * @param   Number    connectionId  
 * @param   Function  callback      function(error, data){}
 */
UBDongle.prototype.bleDisconnect = function(connectionId, callback)
{
  var cmd = new UBDongleCmd_bleDisconnect(connectionId);
  var promise = this.transport.executeCommand(cmd);

  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });  
};

/**
 * Get or set advertising enabled state. Enabling will start all 
 * allowed advertising banks. Disabling will stop all advertising
 * 
 * @param   Bool      enabled     true | false to start/stop. Pass null to read
 * @param   Function  callback   function(error, data){}
 */
UBDongle.prototype.adv = function(enabled, callback)
{
  var cmd = new UBDongleCmd_adv(enabled);
  var promise = this.transport.executeCommand(cmd);

  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });
};

/**
 * Get or set advertising data for specified bankId
 * 
 * @param   Number   bankId     Advertising bank identifier
 * @param   String   payload    Payload to set. Use null to read
 * @param   Function callback   function(error, data){}
 */
UBDongle.prototype.advPayload = function(bankId, payload, callback)
{
  var cmd = new UBDongleCmd_advPayload(bankId, payload);
  var promise = this.transport.executeCommand(cmd);

  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });
};

/**
 * Get advertising payload object
 */
UBDongle.prototype.advPayload_data = function()
{
  return UBDongleCmd_advPayload.data();
};

/**
 * Get or set advertising settings for specified bankId. To read
 * pass null for bankId - other param values won't be considered.
 * 
 * @param   Number   bankId       Advertising bank identifier
 * @param   Object   settings {
 *    Bool     enabled      Is the adv bank enabled to broadcast if advertising? 
 *    Bool     connectable  Should advertisings be connectable
 *    Number   interval     Advertising interval (milliseconds)
 *    Number   txPower      TXPower of advertising
 *    Number   duration     How long should advertisings last (if more than one bank enabled) in seconds
 * }
 * @param   Function callback     function(error, data){}
 */
UBDongle.prototype.advSettings = function(bankId, settings, callback)
{
  var cmd = new UBDongleCmd_advSettings(bankId, settings);
  var promise = this.transport.executeCommand(cmd);

  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });
};

/**
 * Get advertising settings object
 */
UBDongle.prototype.advSettings_data = function()
{
  return UBDongleCmd_advSettings.data();
};

/**
 * Get or set scanning enabled state. 
 * 
 * @param   Bool      enabled     true | false to start/stop. Pass null to read
 * @param   Function  callback   function(error, data){}
 */
UBDongle.prototype.scan = function(enabled, callback)
{
  var cmd = new UBDongleCmd_scan(enabled);
  var promise = this.transport.executeCommand(cmd);

  promise.then(function(result){
    callback(null, result);
  }, function(err){
    callback(err);
  });

};

module.exports = UBDongle;