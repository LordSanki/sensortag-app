/*
 * Code for setting up socket communication
 * and sending sensor data
 * */

var client_list = {};
var device_list = {};
var tmp_device_list = {};
var timer_obj = '';
var SensorTag = require('sensortag');
var Device = require('./device.js');

var add_device = function(sensorTag){
  tmp_device_list[sensorTag.uuid] = {uuid: sensorTag.uuid};
};

exports.index = function(req, res){
  res.render('index', { title: 'SensorTag' });
}

exports.start_scan = function(req, res){
  tmp_device_list = {};
  for( x in device_list){
    if(device_list[x].stat == 'Connected'){
      tmp_device_list[x] = device_list[x];
    }
  }

  for( x in tmp_device_list){
    device_list[x] = tmp_device_list[x];
  }
  SensorTag.discoverAll(add_device);
  setTimeout(function() {
    SensorTag.stopDiscoverAll(add_device);
  }, 3000);
  res.end('Scan Started');
};

exports.stop_scan = function(req, res){
  SensorTag.stopDiscoverAll(add_device);
  res.end('Scan Stopped');
};

exports.get_device_list = function(req, res){
  var json = [];
  for(x in tmp_device_list){
    json.push({uuid:tmp_device_list[x].uuid});
  }
  res.json(json);
};

exports.setup_sockets = function(io){
  // Server Side Socket Code
  io.on('connection', function (socket) {
    if(!(socket.id in client_list)){
      //socket.emit('status', { message: 'connected to device' });
      socket.on('start', function (data) {
        client_list[socket.id] = {device: data.uuid, socket: socket};
        if(!(data.uuid in device_list)){
          device_list[data.uuid] = new Device(data.uuid);
          device_list[data.uuid].connect();
        }
        start_timer();
      });
      socket.on('disconnect', function(){
        delete client_list[socket.id];
        var count = 0;
        for (x in client_list){ count++; }
        if(count == 0){ stop_timer(); }
      });
    }
  });
};

function start_timer() {
  if(timer_obj == ''){
    timer_obj = setInterval(function(){
      for(client_id in client_list){
        var device_id = client_list[client_id].device;
        if( device_id in device_list){
          var device = device_list[device_id];
          var gyro = "X:"+device.gyroX+" Y:"+device.gyroY+" Z:"+device.gyroZ;
          var accel = "X:"+device.accelX+" Y:"+device.accelY+" Z:"+device.accelZ;
          var magnet = "X:"+device.magnetX+" Y:"+device.magnetY+" Z:"+device.magnetZ;
          client_list[client_id].socket.emit('update', {
            atemp: device.atemp, otemp: device.otemp
            ,pressure: device.pressure, humidity: device.humidity
            ,lux: device.lux, gyro: gyro, accel: accel
            ,magnet: magnet});
        }
      }
    }, 1000);
  }
};

function stop_timer() {
  if(timer_obj != ''){
    clearInterval(timer_obj);
    timer_obj = '';
  }
};



