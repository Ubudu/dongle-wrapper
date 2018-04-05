# ub\_dongle wrapper library

Node.js wrapper for UART protocol for communication with ub\_dongle.
Provides transport over UART or MQTT via Gateways.

## Usage examples

Basic examples for using the library are located in [examples](./examples) folder.

### How to test

`windows, windows 10`

1. make sure driver installed, install the [driver](http://www.ftdichip.com/Drivers/CDM/CDM21228_Setup.zip), if you have installed, please
hit windows log and r and then type `devmgmt.msc`, hit enter, you will see like this. You need remember the serial port number, in my case
it's `COM4`.
![](./dev.PNG)

2. open the command prompt and then clone this project
```
// make sure you have git windows installed
git clone https://github.com/Ubudu/dongle-wrapper && cd dongle-wrapper\examples
```

3. install application mobile `nRF connect` and then insert the dongle

4. show dongle info
```
node device-info.js COM4
```

5. test scan devices
```
node scanner COM4
```

6. test read data from mobile
```
// make sure you have connected the dongle on nRF connect, if it's ok then run this to listen on the serial port
node reader.js COM4

// and then you can write some hex data on `nRF connect`, it will show on command prompt
```

7. test send data to mobile
```
node sender.js COM4 connectionId yourMessage
```

8 test send data to all connections
```
node sendToAllConnection.js COM4 yourMessage
```

9. ping-pong test

1.
    ```
    node pingpong.js COM4
    ```

2.
    ```
    go to application nRF connect, send `PING` to the dongle
    ```

3.
    ```
    you will see `504f4e47` which is the hex of PONG on the application
    ```


