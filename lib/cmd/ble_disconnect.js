/*jslint node: true */
'use strict';

/**
 * @file cmd/ble_disconnect.js
 * 
 * Command for executing and parsing output from "ble_disconnect"
 * 
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var zpad = require('zpad');
var debug = require('debug')('ub_dongle:lib:cmd:ble_disconnect');

/**
 *
 */
function UBDongleCmd_bleDisconnect(connectionId)
{
  this.connectionId = connectionId;
}

/**
 * Return a empty object with command parameters or null if not supported
 */
UBDongleCmd_bleDisconnect.data = function()
{
  return null;
};

/**
 *
 */
UBDongleCmd_bleDisconnect.prototype.cmd = function()
{
  var c = 'ble_disconnect';
  if( this.connectionId !== null && this.connectionId !== undefined ){
    c += ':';
    c += zpad(this.connectionId,2); 
  }

  return c;
};

/**
 *
 */
UBDongleCmd_bleDisconnect.prototype.parse = function(dataBuffer)
{
  debug('parse', dataBuffer);
  //currently no response
  if( dataBuffer.match(/^OK\r\n/gm) ){
    return true;
  }
  return null;
};


module.exports = UBDongleCmd_bleDisconnect;
