
/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/start_scan', routes.start_scan);
app.get('/stop_scan', routes.stop_scan);
app.get('/get_device_list', routes.get_device_list);
app.get('/cloud_config', routes.cloud_config);
app.post('/cloud_token', routes.cloud_token);
app.get('/cloud_devices', routes.get_cloud_devices);
app.post('/cloud_devices', routes.post_cloud_devices);

//var socket_obj = require('./modules/socket_stream/socket_stream.js');

routes.setup_sockets(
  require('socket.io').listen(
    app.listen(3000, function(){
      var date = new Date();
      console.log("127.0.0.1:%d", app.address().port);
      console.log(date.getHours()+":"+date.getMinutes()+"@"+date.getDate()+"/"+date.getMonth());
    })
  )
);

