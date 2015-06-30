
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'SensorTag' });
}
  
exports.scan = function(req, res){
  var SensorTag = require('sensortag');
  SensorTag.discover(function(sensorTag){
    console.log("Discovered: "+ sensorTag);
    res.json({uuid:sensorTag.uuid, name:sensorTag.type});
  });
}

