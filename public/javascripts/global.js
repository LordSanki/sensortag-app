
function scanForDevices(tableID) {
  var tableCode = '';
  $.get('/start_scan');
  $('#scanButton').html('Scanning..');
  $('#'+tableID).html('');
  setTimeout(function(){
    $.get('/stop_scan');
    $.getJSON('/get_device_list', function(data) {
      tableCode = '';
      for(index=0; index<data.length; index++){
        tableCode += '<div class=row><button class=btn style="margin-top:3px;margin=bottom:3px;"id=';
        tableCode += data[index].uuid+' onclick=connectDevice(this.id)>';
        tableCode += data[index].uuid.toUpperCase();
        tableCode += '</button></div>';
      }
      //$('#'+tableID+' tbody > tr').remove();
      $('#'+tableID).html(tableCode);
    });
    $('#scanButton').html('Start Scan');
  },3000);
};

function connectDevice(id) {
  var socket = io();
  socket.emit('start', {uuid: id});
  socket.on('update', function(data) {
    displayDeviceStream(data);
  });
};

function displayDeviceStream(data) {
  $('#aTempLabel').html('<p>'+data.atemp+'</p>');
  $('#oTempLabel').html('<p>'+data.otemp+'</p>');
  $('#pressureLabel').html('<p>'+data.pressure+'</p>');
  $('#humidityLabel').html('<p>'+data.humidity+'</p>');
  $('#luxLabel').html('<p>'+data.lux+'</p>');
  $('#gyroLabel').html('<p>'+data.gyro+'</p>');
  $('#accelLabel').html('<p>'+data.accel+'</p>');
  $('#magLabel').html('<p>'+data.magnet+'</p>');
};


