function scanForDevices(tableID) {
  var tableCode = '';
  $.getJSON('/scan', function(data) {
/*    $.each(data, function() {
      tableCode += '<tr>';
      tableCode += '<td><p>'++'</p></td>';
      tableCode += '<td><p>'+this.uuid+'</p></td>';
      tableCode += '</tr>';
    });
    */
    tableCode += '<tr>';
    // change this into a flip switch and description
    tableCode += '<td><button type=button class=btn id='
    tableCode += data.uuid+' onclick=connectDevice(this.id)>'
    //tableCode += /*data.uuid+*/')>';
    tableCode += '('+data.name.toUpperCase()+')'+data.uuid.toUpperCase();
    tableCode += '</button></td>';
    tableCode += '</tr>';
    $('#'+tableID+' tbody > tr').remove();
    $('#'+tableID+' > tbody').append(tableCode);
  });
};

function connectDevice(id) {
  var socket = io();
  socket.on('status', function(data) {
    $('#messageLabel').html('<p>Connected to '+id.toUpperCase()+'</p>');
  });
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


