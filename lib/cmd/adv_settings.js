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

var debug = require('debug')('ub_dongle:lib:cmd:adv_settings');

/**
 *
 */
function UBDongleCmd_advSettings(bankId, settings)
{
  var self = this;
  this.params = new UBDongleCmd_advSettings.data();
  this.params.bankId = bankId;
  this.params.settings = null;

  if( settings ){
    this.params.settings = {};
    Object.keys(settings).forEach((k) => {
      self.params.settings[k] = settings[k];
    });
  }else{
    this.params.settings = null;
  }
}

/**
 * Return a empty object with command parameters
 */
UBDongleCmd_advSettings.data = function()
{
  return new UBDongleAdvSettings();
};

/**
 *
 */
UBDongleCmd_advSettings.prototype.cmd = function()
{
  var c = 'adv_settings';
  c += ':';
  c += zpad(this.params.bankId.toString(16),2);

  debug(this.params);
  if( this.params.settings && Object.keys(this.params.settings).length > 0 ){
    c += '=';
    c += zpad(Number(this.params.settings.enabled).toString(16),2);
    c += ' ';
    c += zpad(Number(this.params.settings.connectable).toString(16),2);
    c += ' ';
    c += zpad(this.params.settings.interval.toString(16),4);
    c += ' ';
    c += zpad(this.params.settings.txPower.toString(16),2);
    c += ' ';
    c += zpad(this.params.settings.duration.toString(16),8);
  }
  return c;
};

/**
 *
 */
UBDongleCmd_advSettings.prototype.parse = function(dataBuffer)
{
  var regex = /^adv_settings:([0-9]{2})\=([0-9a-f]{2}) ([0-9a-f]{2}) ([0-9a-f]{4}) ([0-9a-f]{2}) ([0-9a-f]{4,8})$/gi;
  var results = regex.exec(dataBuffer.trim());

  //first item in array is full string to be matched, other six elements are the data
  if( results && results.length >= 7 ){
    var data = UBDongleCmd_advSettings.data();
    data.bankId = parseInt(results[1], 16);
    data.settings.enabled = parseInt(results[2], 16) == 1;
    data.settings.connectable = parseInt(results[3], 16) == 1;
    data.settings.interval = parseInt(results[4], 16);
    data.settings.txPower = parseInt(results[5], 16);
    data.settings.duration = parseInt(results[6], 16);
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
function UBDongleAdvSettings(){
  this.bankId = null;
  this.settings = {
    enabled: true,
    connectable: false,
    interval: 100,
    txPower: 7,
    duration: 0
  };
}

module.exports = UBDongleCmd_advSettings;
