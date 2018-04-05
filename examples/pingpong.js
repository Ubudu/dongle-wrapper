var UBDongle = require('../')
var path = require('path')

if (process.argv.length < 3) {
  console.log('Usage: node', path.basename(process.argv[1]), 'serialPort');
  process.exit(1);
}

var options = {
  serialPort: process.argv[2],
  baudRate: 115200
};
var dongle = new UBDongle('uart', options);

dongle.on('ready', function (err, dongle) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('Listening on', process.argv[2]);

  dongle.on('ble_uart_rx', function (data) {

    console.log('received', data);
    let connectionId = data.connectionId;

    // PING
    if (data.payload === 'PING') {
      dongle.bleUartTx(connectionId, 'PONG', function(err, result){
        if (!err) {
          console.log(result)
        } else {
          console.log('Error', err)
        }
      });
    }

  });

});
