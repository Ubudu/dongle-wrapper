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

var debug = require('debug')('ub_dongle:lib:cmd:adv_payload');

/**
 *
 */
function UBDongleCmd_advPayload(bankId, payload)
{
  this.params = UBDongleCmd_advPayload.data();
  this.params.bankId = bankId;
  this.params.payload = payload;
}

/**
 * Return a empty object with command parameters
 */
UBDongleCmd_advPayload.data = function()
{
  return new UBDongleAdvPayload();
};

/**
 *
 */
UBDongleCmd_advPayload.prototype.cmd = function()
{
  var c = 'adv_payload:';
  c += zpad(this.params.bankId.toString(16),2);
  if( this.params.payload ){
    c += '=';
    c += this.params.payload;
  }
  return c;
};

/**
 *
 */
UBDongleCmd_advPayload.prototype.parse = function(dataBuffer)
{
  var regex = /^adv_payload:([0-9]{2})\=([0-9a-f]*)$/gi;
  var results = regex.exec(dataBuffer.trim());

  //first item in array is full string to be matched, second ones are the actual data from groups
  if( results && results.length >= 3 ){
    var data = UBDongleCmd_advPayload.data();
    data.bankId = parseInt(results[1], 16);
    data.advPayload = results[2];
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
function UBDongleAdvPayload(){
  this.bankId = null;
  this.advPayload = null;
}

module.exports = UBDongleCmd_advPayload;
