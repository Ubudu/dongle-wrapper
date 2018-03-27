# ub\_dongle wrapper library

Node.js wrapper for UART protocol for communication with ub\_dongle.
Provides transport over UART or MQTT via Gateways.


## Usage example

The following example listens for incoming device events and reports them over UART.


```
var UBDongle = require('index.js');
var path = require('path');

if( process.argv.length < 3 ){
  console.log('Usage: node', path.basename(process.argv[1]), 'serialPort');
  process.exit(1);
}

var options = {
  serialPort: process.argv[process.argv[1]],
  baudRate: 115200
};
var dongle = new UBDongle('uart', options);

dongle.on('ready', function(err, dongle){
    if( err ){
        console.log(err);
        process.exit(1);
    }

    dongle.on('connected', function(data, dongle){
        console.log('Received UART event:', 'connected', data, dongle);
    });
    dongle.on('disconnected', function(data, dongle){
        console.log('Received UART event:', 'disconnected', data, dongle);
    });
    console.log('Dongle ready. Waiting for events.');

}); 

```
