/*
 * Device class responsible for communication
 * with device
 * */

var SensorTag = require('sensortag');

function Device(uuid) {
  this.uuid = uuid;
  this.atemp = '';
  this.otemp = '';
  this.humidity = '';
  this.lux = '';
  this.pressure = '';
  this.gyroX = '';
  this.accelX = '';
  this.magnetX = '';
  this.gyroY = '';
  this.accelY = '';
  this.magnetY = '';
  this.gyroZ = '';
  this.accelZ = '';
  this.magnetZ = '';
  this.watchdog = '';
  this.stat = 'Init';
  this.sensorTag = '';
};

Device.prototype.timeout = function(){
  var obj = this;
  var date = new Date();
  if(this.stat != 'Timeout'){
    console.log("Timeout on: " + this.uuid + " Status: " + this.stat);
    console.log(date.getHours()+":"+date.getMinutes()+"@"+date.getDate()+"/"+date.getMonth());
  }
  this.stat = 'Timeout';
  this.sensorTag.disconnect( function(){
    obj.sensorTag = '';
    obj.connect();
  });
};


Device.prototype.callbackTemp = function(oTemp, aTemp){
  this.atemp = aTemp.toFixed(1); this.otemp = oTemp.toFixed(1);
  kick(this);
}

Device.prototype.callbackHumidity = function(temp, data){
  this.humidity = data.toFixed(1);
  kick(this);
}

Device.prototype.callbackPressure = function(data){
  this.pressure = data.toFixed(1);
  kick(this);
}

Device.prototype.callbackLux = function(data){
  this.lux = data.toFixed(1);
  kick(this);
}

Device.prototype.callbackGyro = function(x,y,z){
  this.gyroX = x.toFixed(5);
  this.gyroY = y.toFixed(5);
  this.gyroZ = z.toFixed(5);
  kick(this);
}

Device.prototype.callbackAccel = function(x,y,z){
  this.accelX = x.toFixed(5);
  this.accelY = y.toFixed(5);
  this.accelZ = z.toFixed(5);
  kick(this);
}

Device.prototype.callbackMagnet = function(x,y,z){
  this.magnetX = x.toFixed(5);
  this.magnetY = y.toFixed(5);
  this.magnetZ = z.toFixed(5);
  kick(this);
}


Device.prototype.callbackDiscover = function(sensorTag){
  var obj = this;
  obj.stat = 'Discovered';
  obj.sensorTag = sensorTag;
  obj.watchdog = setTimeout(function(){obj.timeout();}, 15000);
  sensorTag.connectAndSetUp( function(error){
    obj.stat = 'Connected';
    kick(obj);
    // Setup Temprature
    sensorTag.enableIrTemperature(function(error){
      sensorTag.setIrTemperaturePeriod(1000,function(error){ });
      sensorTag.notifyIrTemperature(function(error){ });
      sensorTag.on('irTemperatureChange', function(ot,at){ obj.callbackTemp(ot,at);});
    });
    // Setup Pressure
    sensorTag.enableBarometricPressure(function(error){
      sensorTag.setBarometricPressurePeriod(1000,function(error){ });
      sensorTag.notifyBarometricPressure(function(error){ });
      sensorTag.on('barometricPressureChange', function(d){obj.callbackPressure(d);});
    });
    // Setup Humidity
    sensorTag.enableHumidity(function(error){
      sensorTag.setHumidityPeriod(1000,function(error){ });
      sensorTag.notifyHumidity(function(error){ });
      sensorTag.on('humidityChange', function(tp,hu){obj.callbackHumidity(tp,hu);});
    });
    // Setup Lux
    sensorTag.enableLuxometer(function(error){
      sensorTag.setLuxometerPeriod(1000,function(error){ });
      sensorTag.notifyLuxometer(function(error){ });
      sensorTag.on('luxometerChange', function(d){obj.callbackLux(d);});
    });
    // Setup Gyro
    sensorTag.enableGyroscope(function(error){
      sensorTag.setGyroscopePeriod(1000,function(error){ });
      sensorTag.notifyGyroscope(function(error){ });
      sensorTag.on('gyroscopeChange', function(x,y,z){obj.callbackGyro(x,y,z);});
    });
    // Setup Accel
    sensorTag.enableAccelerometer(function(error){
      sensorTag.setAccelerometerPeriod(1000,function(error){ });
      sensorTag.notifyAccelerometer(function(error){ });
      sensorTag.on('accelerometerChange', function(x,y,z){obj.callbackAccel(x,y,z);});
    });
    // Setup Magnet
    sensorTag.enableMagnetometer(function(error){
      sensorTag.setMagnetometerPeriod(1000,function(error){ });
      sensorTag.notifyMagnetometer(function(error){ });
      sensorTag.on('magnetometerChange', function(x,y,z){obj.callbackMagnet(x,y,z);});
    });
  });
};

Device.prototype.disconnect = function(){
  if(this.sensorTag != ''){
    this.sensorTag.disconnect(function(){});
    this.sensorTag = '';
  }
}
Device.prototype.connect = function(){
  var obj = this;
  obj.stat = 'Discovering..'
  SensorTag.discoverByUuid(String(this.uuid), function(sensorTag){
    obj.callbackDiscover(sensorTag); });
};

function kick(device){
  if(device.watchdog != ''){
    clearTimeout(device.watchdog);
    device.watchdog = '';
  }
  var obj = device;
  device.watchdog = setTimeout(function(){obj.timeout();}, 5000);
};

module.exports = Device;


