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

var debug = require('debug')('ub_dongle:lib:cmd:adv');

/**
 *
 */
function UBDongleCmd_adv(enabled)
{
  this.enabled = enabled;
}

/**
 * Return a empty object with command parameters
 */
UBDongleCmd_adv.data = function()
{
  return null;
};

/**
 *
 */
UBDongleCmd_adv.prototype.cmd = function()
{
  var c = 'adv';
  if( this.enabled !== null ){
    c += '=' + zpad(Number(this.enabled).toString(16), 2);
  }
  return c;
};

/**
 *
 */
UBDongleCmd_adv.prototype.parse = function(dataBuffer)
{
  var regex = /^adv=([0-9]{2})$/gi;
  var results = regex.exec(dataBuffer.trim());

  // //first item in array is full string to be matched, second ones are the actual data from groups
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

module.exports = UBDongleCmd_adv;
