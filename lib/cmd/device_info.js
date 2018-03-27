/*jslint node: true */
'use strict';

/**
 * @file cmd/ble_connections.js
 * 
 * Command for executing and parsing output from "info"
 * 
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('ub_dongle:lib:cmd:device_info');

/**
 *
 */
function UBDongleCmd_deviceInfo()
{
}

/**
 * Return a empty object with command parameters or null if not supported
 */
UBDongleCmd_deviceInfo.data = function()
{
  return null;
};


/**
 *
 */
UBDongleCmd_deviceInfo.prototype.cmd = function()
{
    return 'info';
};

/**
 *
 */
UBDongleCmd_deviceInfo.prototype.parse = function(dataBuffer)
{
  if( dataBuffer.match(/^END\r\n/gm) ){
  
    var lines = dataBuffer.split('\r\n');
    var deviceData = lines.reduce((all, el) => {
      var tmp = el.trim().split(':');
      if( tmp.length == 2 ){
        all[tmp[0].trim()] = tmp[1].trim();
      }
      return all;
    }, {});

    return deviceData;

  }
  return null;
};


module.exports = UBDongleCmd_deviceInfo;
