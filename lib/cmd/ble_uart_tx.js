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

var UBDongleError = require('../ub_dongle_error');
var zpad = require('zpad');

var debug = require('debug')('ub_dongle:lib:cmd:ble_uart_tx');

/**
 *
 */
function UBDongleCmd_bleUartTx(connectionId, payload)
{
  this.connectionId = connectionId;
  this.payload = payload;
}

/**
 * Return a empty object with command parameters or null if not supported
 */
UBDongleCmd_bleUartTx.data = function()
{
  return null;
};

/**
 *
 */
UBDongleCmd_bleUartTx.prototype.cmd = function()
{
  var c = 'ble_uart_tx:';
  c += zpad(this.connectionId.toString(16));
  c += '=';
  c += new Buffer(this.payload).toString('hex');
  return c;
};

/**
 *
 */
UBDongleCmd_bleUartTx.prototype.parse = function(dataBuffer)
{
  debug('parse', dataBuffer);

  if( dataBuffer.match(/^Error\:/g) ){
    var chunks = dataBuffer.split(':');
    if( chunks.length >= 2 ){
      var errorCode = parseInt(chunks[1]);
      throw(new UBDongleError(errorCode, "Returned error code: " + errorCode));
    }
  }
  if( dataBuffer.match(/^OK/g) ){
    return true;
  }

  return null;
};


module.exports = UBDongleCmd_bleUartTx;
