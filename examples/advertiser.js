var UBDongle = require('../')
var path = require('path')
var async = require('async')

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

    setup(dongle, (err) => {
      if( !err ){
        console.log('Advertising started.')
      }else{
        console.log('Error', err)
      }
    })
}); 

/**
 * Setup advertisements on the device
 */
function setup(dongle, callback)
{
  // Set advertising payload to iBeacon
  async.waterfall([
    (done) => {
      // iBeacon advertising payload
      //  UUID = f2a74fc4762544db9b08cb7e130b2029
      //  major = 0002
      //  minor = 0001
      var payload = '4c000215f2a74fc4762544db9b08cb7e130b202900010001c5'
      dongle.advPayload(0, payload, (err) => {
        done(err)
      })
    },
    // Set advertising parameters
    (done) => {
      var settings = dongle.advSettings_data()
      settings.bankId = 0
      settings.enabled = true
      settings.interval = 100
      settings.txPower = 7
      settings.duration = 0
      dongle.advSettings(0, settings, (err) => {
        done(err)
      })
    },
    // Start advertising
    (done) => {
      dongle.adv(true, (err) => {
        done(err)
      })
    }
  ], (error) => {
      callback(error)
    }
  )
}