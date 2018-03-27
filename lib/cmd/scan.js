/*jslint node: true */
'use strict';

/**
 * @file cmd/adv_payload.js
 * 
 * Command for executing and parsing output from "adv_payload"
 * 
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var UBDongleError = require('../ub_dongle_error');
var zpad = require('zpad');

var debug = require('debug')('ub_dongle:lib:cmd:scan');

/**
 *
 */
function UBDongleCmd_scan(enabled)
{
  this.enabled = enabled;
}

/**
 * Return a empty object with command parameters
 */
UBDongleCmd_scan.data = function()
{
  return null;
};

/**
 *
 */
UBDongleCmd_scan.prototype.cmd = function()
{
  var c = 'scan';
  if( this.enabled !== null ){
    c += '=' + zpad(Number(this.enabled).toString(16), 2);
  }
  return c;
};

/**
 *
 */
UBDongleCmd_scan.prototype.parse = function(dataBuffer)
{
  var regex = /^scan=([0-9]{2})$/gi;
  var results = regex.exec(dataBuffer.trim());

  debug('results', results);
  // // //first item in array is full string to be matched, second ones are the actual data from groups
  if( results && results.length >= 2 ){
    var enabled = parseInt(results[1], 16) == 1;
    return enabled;
  }else{
    var errorCode = -1;
    var message = 'Unsupported response: ' + dataBuffer.trim();
    throw(new UBDongleError(errorCode, message));
  }

  return null;
};

module.exports = UBDongleCmd_scan;
