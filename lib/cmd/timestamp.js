/*jslint node: true */
'use strict';

/**
 * @file cmd/timestamp.js
 * 
 * Command for executing and parsing output from "timestamp"
 * 
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var UBDongleError = require('../ub_dongle_error');
var zpad = require('zpad');

var debug = require('debug')('ub_dongle:lib:cmd:timestamp');

/**
 *
 */
function UBDongleCmd_timestamp(settings)
{
  this.params = null;
  if( settings ){
    this.params = UBDongleCmd_timestamp.data();
    this.params.enabled = settings.enabled;
    this.params.timestamp = settings.timestamp;
  }
}

/**
 * Return a empty object with command parameters
 */
UBDongleCmd_timestamp.data = function()
{
  return new UBDongleTimestampData();
};

/**
 *
 */
UBDongleCmd_timestamp.prototype.cmd = function()
{
  var c = 'timestamp';
  if( this.params ){
    c += '=';
    c += zpad(Number(this.params.enabled).toString(16),2);
    c += ' ';
    c += zpad(Number(this.params.timestamp).toString(16),8);
  }
  return c;
};

/**
 *
 */
UBDongleCmd_timestamp.prototype.parse = function(dataBuffer)
{
  var regex = /^timestamp=([0-9]{2}) ([0-9a-f]{6,8})$/gi;
  var results = regex.exec(dataBuffer.trim());

  //first item in array is full string to be matched, second ones are the actual data from groups
  if( results && results.length >= 3 ){
    var data = UBDongleCmd_timestamp.data();
    data.enabled = parseInt(results[1], 16) == 1 ? true : false;
    data.timestamp = parseInt(results[2], 16);
    return data;
  }else{
    var errorCode = -1;
    var message = 'Unsupported response: ' + dataBuffer.trim();
    throw(new UBDongleError(errorCode, message));
  }

  return null;
};

////////////////////////////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////////////////////////////
function UBDongleTimestampData(){
  this.enabled = false;
  this.timestamp = null;
}



module.exports = UBDongleCmd_timestamp;
