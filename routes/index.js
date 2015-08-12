/*
 * Code for setting up socket communication
 * and sending sensor data
 * */

var client_list = {};
var device_list = {};
var cloud_list = {};
var tmp_device_list = {};
var timer_obj = '';
var SensorTag = require('sensortag');
var Device = require('./device.js');
var DPeakAPI = require("./discoverypeak");
var cloud = new DPeakAPI();

function make_json_array(data){
  var json = [];
  for(x in data){
    json.push({id:String(data[x].id), cloud:data[x].cloud, gateway:data[x].gateway});
  }
  return json;
}

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
  res.json({Status:'Done'});
};

exports.stop_scan = function(req, res){
  SensorTag.stopDiscoverAll(add_device);
  res.json({Status:'Done'});
};

exports.cloud_config = function(req, res){
  cloud.get_user_info(function(data){
    res.json(data);
  });
}

exports.get_cloud_devices = function(req, res){
  res.json({devices: make_json_array(cloud_list)});
}

exports.post_cloud_devices = function(req, res){
  var dev_id = req.body.id;
  if(dev_id in cloud_list){
    if(req.body.cloud == 'true'){
      if(dev_id in cloud.config.accounts[cloud.account_id].devices){
        cloud_list[dev_id] = req.body;
        return res.json({devices: make_json_array(cloud_list)});
      }
      else{
        cloud.create_device(dev_id, function(err){
        
          if(err){return res.json({devices: make_json_array(cloud_list)});}
          else{
            cloud.activate(dev_id, function(err){
              if(err){return res.json({devices: make_json_array(cloud_list)});}
              else {
                cloud.create_component(dev_id, {name:'temp', type:'temperature.v1.0'}, function(err){
                  if(err){return res.json({devices: make_json_array(cloud_list)});}
                  else{
                    cloud_list[dev_id] = req.body;
                    return res.json({devices: make_json_array(cloud_list)});
                  }
                });
              }
            });
          }
        });
      }
    }
    else{
      cloud_list[req.body.id] = req.body;
      return res.json({devices: make_json_array(cloud_list)});
    }
  }
}


exports.cloud_token = function(req, res){
  cloud.setup_new_account(req.body, function(err){
//  cloud.setup_new_account(req.body.token, function(err){
    if(err){
      res.json({status:"Error"});
    }
    else {
      cloud.get_user_info(function(data){
        for(x in cloud.config.accounts[cloud.account_id].devices){
          if(x in device_list){
            cloud_list[x] = {id: x, cloud: 'false', gateway: 'true'};
          }
          else{
            cloud_list[x] = {id: x, cloud: 'false', gateway: 'false'};
          }
        }
        res.json(data);
      });
    }
  });
}

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
          cloud_list[data.uuid] = {id: data.uuid, cloud: 'false', gateway: 'true'};
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
          if(cloud_list[device_id].cloud == 'true'){
            var data = [];
            data.push( cloud.create_data_packet( device_id,
                             'temp', String(device.otemp)) );
            cloud.send_data(device_id, data, function(err){
                  if(err){console.log(err);}
                });
          }
          client_list[client_id].socket.emit('update', {
            atemp: device.atemp, otemp: device.otemp
            ,pressure: device.pressure, humidity: device.humidity
            ,lux: device.lux 
            ,gyro: [device.gyroX,device.gyroY,device.gyroZ]
            ,accel: [device.accelX,device.accelY,device.accelZ]
            ,magnet: [device.magnetX,device.magnetY,device.magnetZ]
            });
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



