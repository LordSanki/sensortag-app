/*
 * Code for setting up socket communication
 * and sending sensor data
 * */

var client_list = [];
var device_list = [];
var tmp_device_list = [];
var timer_obj;

var scan_started = false;
var SensorTag = require('sensortag');

var add_device = function(sensorTag){
  tmp_device_list.push({uuid:sensorTag.uuid});
};

exports.index = function(req, res){
  res.render('index', { title: 'SensorTag' });
}

exports.start_scan = function(req, res){
  tmp_device_list = [];
  scan_started = true;
  tmp_device_list = device_list.slice(0);
  SensorTag.discoverAll(add_device);
  res.end();
};

exports.stop_scan = function(req, res){
  SensorTag.stopDiscoverAll(add_device);
  scan_started = false;
  res.end();
};

exports.get_device_list = function(req, res){
  res.json(tmp_device_list);
};

exports.setup_sockets = function(io){
  // Server Side Socket Code
  io.on('connection', function (socket) {
    if(find_device(client_list, socket.id) == -1){
      //socket.emit('status', { message: 'connected to device' });
      socket.on('start', function (data) {
        client_list.push({uuid: socket.id, device: -1, socket: ''});
        var index = find_device(device_list, data.uuid);
        if(index == -1){
          device_list.push(create_device(data));

          start_device(find_device(device_list, data.uuid));
          index = find_device(device_list, data.uuid);
        }
        var client_id = find_device(client_list, socket.id);
        client_list[client_id].device = index;
        client_list[client_id].socket = socket;
        start_timer();
      });
      socket.on('disconnect', function(){
        var client_id = find_device(client_list, socket.id);
        var f = client_list.splice(0, client_id);
        client_list = f.concat(client_list);
        if(client_list.length == 0){
          stop_timer();
        }
      });
    }
  });
};

function start_timer() {
  if(timer_obj === undefined){
    timer_obj = setInterval(function(){
      for(index = 0; index < client_list.length; index++){
        if(client_list[index].device > -1){
          var device = device_list[client_list[index].device];
          client_list[index].socket.emit('update', {
            atemp: device.atemp, otemp: device.otemp
            ,pressure: device.pressure, humidity: device.humidity
            ,lux: device.lux, gyro: device.gyro, accel: device.accel
            ,magnet: device.magnet});
        }
      }
    }, 1000);
  }
};

function stop_timer() {
  if(!(timer_obj === undefined)){
    cleatInterval(timer_obj);
    timer_obj = undefined;
  }
};

function find_device (list, uuid) {
  for(i=0; i<list.length; i++){
    if(list[i].uuid == uuid)
      return i;
  }
  return -1;
};

function create_device(data){
  return {uuid: data.uuid, atemp: '',
    otemp: '', pressure: '',humidity: '',
    lux: '', gyro: '', accel: '', magnet: ''
  }
};

function start_device (id) {
  SensorTag.discoverByUuid(String(device_list[id].uuid), function(sensorTag){
  //SensorTag.discoverByUuid(uuid, function(sensorTag){
    sensorTag.connectAndSetUp(function(error){
      var index = id;
      // Setup Temprature
      sensorTag.enableIrTemperature(function(error){
        sensorTag.setIrTemperaturePeriod(1000,function(error){
        });
        sensorTag.notifyIrTemperature(function(error){
        });
        sensorTag.on('irTemperatureChange', function(oTemp, aTemp){
          device_list[index].atemp = aTemp.toFixed(1); device_list[index].otemp = oTemp.toFixed(1);
        });
      });
      // Setup Pressure
      sensorTag.enableBarometricPressure(function(error){
        sensorTag.setBarometricPressurePeriod(1000,function(error){
        });
        sensorTag.notifyBarometricPressure(function(error){
        });
        sensorTag.on('barometricPressureChange', function(data){
          device_list[index].pressure = data.toFixed(1);
        });
      });
      // Setup Humidity
      sensorTag.enableHumidity(function(error){
        sensorTag.setHumidityPeriod(1000,function(error){
        });
        sensorTag.notifyHumidity(function(error){
        });
        sensorTag.on('humidityChange', function(temp, data){
          device_list[index].humidity = data.toFixed(1);
        });
      });
      // Setup Lux
      sensorTag.enableLuxometer(function(error){
        sensorTag.setLuxometerPeriod(1000,function(error){
        });
        sensorTag.notifyLuxometer(function(error){
        });
        sensorTag.on('luxometerChange', function(data){
          device_list[index].lux = data.toFixed(1);
        });
      });
      // Setup Gyro
      sensorTag.enableGyroscope(function(error){
        sensorTag.setGyroscopePeriod(1000,function(error){
        });
        sensorTag.notifyGyroscope(function(error){
        });
        sensorTag.on('gyroscopeChange', function(x,y,z){
          device_list[index].gyro = 'x='+x.toFixed(1)+' y='+y.toFixed(1)+' z='+z.toFixed(1);
        });
      });
      // Setup Accel
      sensorTag.enableAccelerometer(function(error){
        sensorTag.setAccelerometerPeriod(1000,function(error){
        });
        sensorTag.notifyAccelerometer(function(error){
        });
        sensorTag.on('accelerometerChange', function(x,y,z){
          device_list[index].accel = 'x='+x.toFixed(1)+' y='+y.toFixed(1)+' z='+z.toFixed(1);
        });
      });
      // Setup Magnet
      sensorTag.enableMagnetometer(function(error){
        sensorTag.setMagnetometerPeriod(1000,function(error){
        });
        sensorTag.notifyMagnetometer(function(error){
        });
        sensorTag.on('magnetometerChange', function(x,y,z){
          device_list[index].magnet = 'x='+x.toFixed(1)+' y='+y.toFixed(1)+' z='+z.toFixed(1);
        });
      });
    });
  });
};


