/*jslint node: true */
'use strict';

/**
 * @file event/parser.js
 * 
 * Provides mechanism to extract events from incoming data stream 
 * and parses it into useable objects/strctures/data
 */

var debug = require('debug')('ub_dongle:lib:event:parser');


function UBDongleEventParser()
{

}

/**
 *
 */
UBDongleEventParser.prototype.parse = function(dataBuffer)
{
  var retVal = null;
  //Capture "connected" and "disconnected" events
  if( dataBuffer.match(/^@([dis]*)connected.*$/gm) ){
    retVal = this._parseConnectionEvent(dataBuffer);
  }
  //Capture "ble_uart_rx" events
  if( dataBuffer.match(/^@ble_uart_rx.*$/gm) ){
    retVal = this._parseBleUartRxEvent(dataBuffer);
  }
  if( dataBuffer.match(/^@scan/gi) ){
    retVal = this._parseScanResultEvent(dataBuffer);
  }
  return retVal;
};


////////////////////////////////////////////////////////////////////////////////
// Private functions
////////////////////////////////////////////////////////////////////////////////

/**
 * Extracts data from @connected/@disconnected (@connected:0:42eebe320557) event
 */
UBDongleEventParser.prototype._parseConnectionEvent = function(dataBuffer)
{
  var chunks = dataBuffer.trim().split(':');
  if( chunks.length === 3 ){
    var retVal = new UBDongleEvent();
    retVal.name = chunks[0].substr(1);    //remove @
    retVal.data = {
      connectionId: parseInt(chunks[1]),
      mac: chunks[2]
    };
    return retVal;
  }
  return null;
};

/**
 *
 */
UBDongleEventParser.prototype._parseBleUartRxEvent = function(dataBuffer)
{
  var chunks = dataBuffer.trim().split(':');
  if( chunks.length === 3 ){
    var retVal = new UBDongleEvent();
    retVal.name = chunks[0].substr(1);    //remove @
    retVal.data = {
      connectionId: parseInt(chunks[1]),
      payloadHex: chunks[2],
      payload: Buffer.from(chunks[2], 'hex').toString('ascii')
    };
    return retVal;
  }
  return null;
};

/**
 *
 */
UBDongleEventParser.prototype._parseScanResultEvent = function(dataBuffer)
{
  // debug('_parseScanResultEvent', dataBuffer);
  if( dataBuffer.substr(0,6) === '@scan:' ){
    var scanResultString = dataBuffer.substr(6);
    var chunks = scanResultString.split(',');
    // debug(scanResultString);

    var scanResult = new UBDongleScanResult();
    if( chunks.length >= 3 ){
      scanResult.scannerMac = chunks[0];
      scanResult.emitterMac = chunks[1];
      scanResult.rssi = parseInt(chunks[2]);
    }

    scanResult.payloadHex = null;
    if( chunks.length >= 6 ){
      scanResult.payloadHex = chunks[5].trim();
    }

    var retVal = new UBDongleEvent();
    retVal.name = 'scan';
    retVal.data = scanResult;

    return retVal;
  }
  return null;
};

////////////////////////////////////////////////////////////////////////////////
// Event class definition
////////////////////////////////////////////////////////////////////////////////

function UBDongleEvent()
{
  this.name = "";
  this.data = null;
}

function UBDongleScanResult()
{
  this.scannerMac = null;
  this.emitterMac = null;
  this.rssi = 0; 
  this.payloadHex = "";
}

module.exports = UBDongleEventParser;
