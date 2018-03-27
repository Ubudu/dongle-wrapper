/*jslint node: true */
'use strict';

/**
 * @file cmd/restore_defaults.js
 * 
 * Command for executing "restore_defaults" command
 * 
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('ub_dongle:lib:cmd:restore_defaults');

/**
 *
 */
function UBDongleCmd_restoreDefaults()
{
}

/**
 * Return a empty object with command parameters or null if not supported
 */
UBDongleCmd_restoreDefaults.data = function()
{
  return null;
};

/**
 *
 */
UBDongleCmd_restoreDefaults.prototype.cmd = function()
{
    return 'restore_defaults';
};

/**
 *
 */
UBDongleCmd_restoreDefaults.prototype.parse = function(dataBuffer)
{
  //currently no response
  if( dataBuffer.match(/^OK\r\n/gm) ){
    return true;
  }
  return null;
};


module.exports = UBDongleCmd_restoreDefaults;
