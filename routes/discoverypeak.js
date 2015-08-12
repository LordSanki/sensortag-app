var jsonfile = require('jsonfile');
jsonfile.spaces = 4;
var util = require('util');
var request = require('request');

var make_request = function(url, method, data, token, callback){
  var req = {
    "url": url,
    "proxy": null,
    "method": method,
    "json": true,
    "followAllRedirects": true,
    "strictSSL": false,
    "body": data || {},
    "headers": {}
  }
  if (process.env.PROXY) {
    // logger.debug("Proxy: %s", process.env.PROXY);
    req.proxy = process.env.PROXY;
    req.strictSSL = false;
  }
  if (token) req.headers = { "Authorization": "Bearer " + token };
  request(req, function (error, response, body) {
    var data = null;
    if(error) {console.log("Error with %s\n %s",url,error);}
    else {
      error = body;
      if(response.statusCode == 200 || response.statusCode == 201) {
        data = body;
        error = null;
      }
      if(response.statusCode == 204) {
        data = { status: "Done" };
        error = null;
      }
    }
    callback(error, data);
  });
}

function DiscoveryPeakCloud (configfile) {
  var obj = this;
  if(!configfile){ obj.configfile = 'config/DiscoveryPeakCloud.json'; }
  else { obj.configfile = configfile; }

  obj.config = jsonfile.readFileSync(obj.configfile);
  if(!obj.config.base_url){
    obj.config.base_url = 'https://dashboard.us.enableiot.com/v1/api/';
    jsonfile.writeFileSync(obj.configfile, obj.config);
  }
  if(!obj.config.accounts){
    obj.config.accounts = {};
    jsonfile.writeFileSync(obj.configfile, obj.config);
  }
  obj.user_token = '';
  obj.account_id = '';
  obj.base_url = 'https://dashboard.us.enableiot.com/v1/api/';
}

DiscoveryPeakCloud.prototype.create_device = function(device, callback) {
  var obj = this;
  var config = obj.config.accounts[obj.account_id];
  var device_id = device+obj.account_id;
  var url = util.format("%s/accounts/%s/devices", obj.base_url, obj.account_id);
  var dev = {
    "deviceId": device_id,
    "gatewayId": "gateway-10",
    "name": "device-10",
    "tags":["US","AZ"],
    "loc":[0,0,0],
    "attributes":{
      "manufacturer":"Intel",
      "platform":"x86",
      "os":"Linux"
    }
  };
  make_request(url, "POST", dev, obj.user_token, function(err, data){
    if(data){
      config.devices[device] = {
        "device_id": device,
        "device_token": "",
        "components":{}
      };
      jsonfile.writeFileSync(obj.configfile, obj.config);
    }
    callback(err);
  });
}

DiscoveryPeakCloud.prototype.activate = function(device, callback) {
  var obj = this;
  var config = obj.config.accounts[obj.account_id];
  var device_id = device+obj.account_id;
  var url = util.format("%s/accounts/%s/activationcode/refresh", 
                                obj.base_url, obj.account_id);
  make_request(url, "PUT", null, obj.user_token, function(err, data){
    if (err) { return callback(err); }
    if (data) {
      //debug(data);
      var url = util.format("%s/accounts/%s/devices/%s/activation",
                              obj.base_url, obj.account_id, device_id);
      var code = { "activationCode": data.activationCode };
      make_request(url, "PUT", code, obj.user_token, function(err, data){
        //debug(data);
        if (err) { return callback(err); }
        if(data) { config.devices[device].device_token = data.deviceToken; }
        jsonfile.writeFileSync(obj.configfile, obj.config);
        return callback(null);
      });
    }
  });
}

DiscoveryPeakCloud.prototype.create_component = function(device, component, callback) {
  var obj = this;
  var config = obj.config.accounts[obj.account_id];
  var device_id = device+obj.account_id;
  var device = config.devices[device];
  var url = util.format("%s/accounts/%s/devices/%s/components",
      obj.base_url, obj.account_id, device_id);
  var component_id = component.name + device_id;
  var packet = {
    "cid": component_id,
    "name": component.name,
    "type": component.type
  }
  device.components[component.name] = packet;
  make_request(url, "POST", packet, device.device_token, function(err,data){
    if( (err === null) && (data.cid == packet.cid) ){
       jsonfile.writeFileSync(obj.configfile, obj.config);
       callback(null);
    }
    else {
      callback(err);
    }
  });
}

DiscoveryPeakCloud.prototype.send_data = function(device, data, callback){
  var obj = this;
  var config = obj.config.accounts[obj.account_id];
  var device_id = device + obj.account_id;
  if (!callback){
    callback = function(err){ if (err) throw err; }
  }
  if(!(device in config.devices)) {
    return callback({status: "Error"});
  }
  device = config.devices[device];
  var url = util.format("%s/data/%s", obj.base_url, device_id);
  var observation =  {
    "on": (new Date).getTime(),
    "accountId": obj.account_id,
    "data": data
  }
  make_request(url, "POST", observation, device.device_token, function(err, data){
    callback(err); });
}

DiscoveryPeakCloud.prototype.create_data_packet = function(device, component, data) {
  var obj = this;
  var config = obj.config.accounts[obj.account_id];
  if(!(device in config.devices)) return {};
  var device_id = device + obj.account_id;
  var device = config.devices[device];
  if(!(component in device.components)) return {};
  var component_id = device.components[component].cid;
  var obj =  { "on":(new Date).getTime(),
            "componentId": component_id,
            "loc":[0,0],
            "value": data };
  return obj;
}

DiscoveryPeakCloud.prototype.get_user_token = function(username, password, callback){
  var obj = this;
  var url = util.format("%s/auth/token", obj.base_url);
  var data = {
    "username": username,
    "password": password
  };
  make_request(url, "POST", data, null, function(err, resp){
    if( err === null && resp != null){
      obj.user_token = resp.token;
    }
    //debug("user Token: %s",obj.user_token);
    callback(err);
  });
}

DiscoveryPeakCloud.prototype.get_account_id = function(callback){
  var obj = this;
  var url = util.format("%s/auth/tokenInfo", obj.base_url);
  make_request(url, "GET", null, obj.user_token, function(err, data) {
    if( !(err) && data){
      var user_id = data.payload.sub;
      var url = util.format("%s/users/%s", obj.base_url, user_id);
      make_request(url, "GET", null, obj.user_token, function(err, data) {
        if( !(err) && data){
          var accounts = Object.keys(data.accounts);
          if(accounts.length > 0){
            if(accounts[0] in obj.config.accounts){
              obj.account_id = accounts[0]
            }
            else{
              obj.config.accounts[accounts[0]] = { id: String(accounts[0]),
                "devices":{}};
              obj.account_id = accounts[0];
            }
            jsonfile.writeFileSync(obj.configfile, obj.config);
          }
          callback(err);
        }
      });
    }
    else{
      callback(err);
    }
  });
}

DiscoveryPeakCloud.prototype.get_user_info = function(callback){
  var obj = this;
  var url = util.format("%s/accounts/%s", obj.base_url, obj.account_id);
  make_request(url, "GET", null, obj.user_token, function(err, data) {
    if( !(err) && data){
      data.id = '';
      callback(data);
    }
    else{
      callback({});
    }
  });
}

DiscoveryPeakCloud.prototype.setup_new_account = function(auth, callback) {
  var obj =  this;
//  obj.config = {account_id: '', base_url:'https://dashboard.us.enableiot.com/v1/api'};
  obj.get_user_token(auth.username, auth.password, function(err) {
  obj.get_account_id(callback);
  });
}

module.exports = DiscoveryPeakCloud;

