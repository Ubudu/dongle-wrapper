var UBDongle = require('../')
var path = require('path')

if( process.argv.length < 3 ){
  console.log('Usage: node', path.basename(process.argv[1]), 'serialPort');
  process.exit(1);
}

var options = {
  serialPort: process.argv[2],
  baudRate: 115200
};
var dongle = new UBDongle('uart', options);

dongle.on('ready', function(err, dongle){
    if( err ){
        console.log(err);
        process.exit(1);
    }

    dongle.deviceInfo( (err, info) => {
      if( !err ){
        console.log('Device info', info)
      }else{
        console.log('Error', err)
      }
      process.exit()
    })
}); 