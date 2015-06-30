/*
 * Code for setting up socket communication
 * and sending sensor data
 * */
exports.setup = function(io){
  
  var SensorTag = require('sensortag');
  var atemp='',otemp='',pressure='',humidity='',lux='',gyro='',accel='',magnet='';
  var timerObj;
  // Server Side Socket Code
  io.on('connection', function (socket) {
    console.log('Client connected');
    socket.emit('status', { message: 'connected to device' });

    socket.on('start', function (data) {
      SensorTag.discoverByUuid(data.uuid, function(sensorTag){
        sensorTag.connectAndSetUp(function(error){
          // Setup Temprature
          sensorTag.enableIrTemperature(function(error){
            sensorTag.setIrTemperaturePeriod(1000,function(error){
            });
            sensorTag.notifyIrTemperature(function(error){
            });
            sensorTag.on('irTemperatureChange', function(oTemp, aTemp){
              atemp = aTemp.toFixed(1); otemp = oTemp.toFixed(1);
            });
          });
          // Setup Pressure
          sensorTag.enableBarometricPressure(function(error){
            sensorTag.setBarometricPressurePeriod(1000,function(error){
            });
            sensorTag.notifyBarometricPressure(function(error){
            });
            sensorTag.on('barometricPressureChange', function(data){
              pressure = data.toFixed(1);
            });
          });
          // Setup Humidity
          sensorTag.enableHumidity(function(error){
            sensorTag.setHumidityPeriod(1000,function(error){
            });
            sensorTag.notifyHumidity(function(error){
            });
            sensorTag.on('humidityChange', function(temp, data){
              humidity = data.toFixed(1);
            });
          });
          // Setup Lux
          sensorTag.enableLuxometer(function(error){
            sensorTag.setLuxometerPeriod(1000,function(error){
            });
            sensorTag.notifyLuxometer(function(error){
            });
            sensorTag.on('luxometerChange', function(data){
              lux = data.toFixed(1);
            });
          });
          // Setup Gyro
          sensorTag.enableGyroscope(function(error){
            sensorTag.setGyroscopePeriod(1000,function(error){
            });
            sensorTag.notifyGyroscope(function(error){
            });
            sensorTag.on('gyroscopeChange', function(x,y,z){
              gyro = 'x='+x.toFixed(1)+' y='+y.toFixed(1)+' z='+z.toFixed(1);
            });
          });
          // Setup Accel
          sensorTag.enableAccelerometer(function(error){
            sensorTag.setAccelerometerPeriod(1000,function(error){
            });
            sensorTag.notifyAccelerometer(function(error){
            });
            sensorTag.on('accelerometerChange', function(x,y,z){
              accel = 'x='+x.toFixed(1)+' y='+y.toFixed(1)+' z='+z.toFixed(1);
            });
          });
          // Setup Magnet
          sensorTag.enableMagnetometer(function(error){
            sensorTag.setMagnetometerPeriod(1000,function(error){
            });
            sensorTag.notifyMagnetometer(function(error){
            });
            sensorTag.on('magnetometerChange', function(x,y,z){
              magnet = 'x='+x.toFixed(1)+' y='+y.toFixed(1)+' z='+z.toFixed(1);
            });
          });
        });
      });
      timerObj = setInterval(function(){
            socket.emit('update', {
              atemp: atemp, otemp: otemp
              ,pressure: pressure, humidity: humidity
              ,lux: lux, gyro: gyro, accel: accel
              ,magnet: magnet})
            }, 1000);
    });
  });
}


