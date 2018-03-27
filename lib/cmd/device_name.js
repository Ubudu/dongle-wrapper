/*jslint node: true */
'use strict';

/**
 * @file cmd/device_name.js
 * 
 * Command for executing and parsing output from "device_name"
 * 
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var UBDongleError = require('../ub_dongle_error');
var debug = require('debug')('ub_dongle:lib:cmd:device_name');

/**
 *
 */
function UBDongleCmd_deviceName(name)
{
  this.params = UBDongleCmd_deviceName.data();
  this.params.name = name;
}

/**
 * Return a empty object with command parameters
 */
UBDongleCmd_deviceName.data = function()
{
  return new UBDongleDeviceNameData();
};

/**
 *
 */
UBDongleCmd_deviceName.prototype.cmd = function()
{
  var c = 'device_name:';
  if( this.params.name ){
    c += '=';
    c += Buffer.from(this.params.name, 'ascii').toString('hex');
  }
  debug('c => ' , c);
  return c;
};

/**
 *
 */
UBDongleCmd_deviceName.prototype.parse = function(dataBuffer)
{
  debug('parse', dataBuffer);
  var regex = /device_name\=([0-9a-f]*)$/gi;
  var results = regex.exec(dataBuffer.trim());

  //first item in array is full string to be matched, second ones are the actual data from groups
  if( results && results.length >= 2 ){
    var data = UBDongleCmd_deviceName.data();
    data.name = Buffer.from(results[1], 'hex').toString('ascii');

    return data;
  }else{
    //TMP workaround for dbg message
    if( dataBuffer.indexOf('device_name') > -1 ){
      return null;
    }else{
      var errorCode = -1;
      var message = 'Unsupported response: ' + dataBuffer.trim();
      throw(new UBDongleError(errorCode, message));
    }
  }

  return null;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////
function UBDongleDeviceNameData(){
  this.name = null;
}

module.exports = UBDongleCmd_deviceName;
