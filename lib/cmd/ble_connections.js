/*jslint node: true */
'use strict';

/**
 * @file cmd/ble_connections.js
 * 
 * Command for executing and parsing output from "ble_connections"
 * 
 */

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('ub_dongle:lib:cmd:ble_connections');

/**
 *
 */
function UBDongleCmd_bleConnections()
{
}

/**
 * Return a empty object with command parameters or null if not supported
 */
UBDongleCmd_bleConnections.data = function()
{
  return null;
};

/**
 *
 */
UBDongleCmd_bleConnections.prototype.cmd = function()
{
    return 'ble_connections';
};

/**
 *
 */
UBDongleCmd_bleConnections.prototype.parse = function(dataBuffer)
{
  if( dataBuffer.match(/^END\r\n/gm) ){
    var lines = dataBuffer.split('\r\n');
    var connections = lines.reduce((all, el) => {
      var tmp = el.trim().split(':');
      if( tmp.length >= 5 ){
        var connectionId = parseInt(tmp[0]);

        all[connectionId] = {
          connectionId: connectionId,
          connectionHandle: parseInt(tmp[1]),
          isConnected: parseInt(tmp[2]),
          nusNotoficationsEnabled: parseInt(tmp[3]),
          mac: tmp[4]
        };
    }
      return all;
    }, []);

    return connections;

  }
  return null;
};


module.exports = UBDongleCmd_bleConnections;
