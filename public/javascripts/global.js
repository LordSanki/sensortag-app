var draw3d = '';
var tempChart = '';
var pressureChart = '';
var humidityChart = '';
var luxChart = '';

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
  $('#gyroXLabel').html('<p>'+data.gyro[0]+'</p>');
  $('#gyroYLabel').html('<p>'+data.gyro[1]+'</p>');
  $('#gyroZLabel').html('<p>'+data.gyro[2]+'</p>');
  $('#accelXLabel').html('<p>'+data.accel[0]+'</p>');
  $('#accelYLabel').html('<p>'+data.accel[1]+'</p>');
  $('#accelZLabel').html('<p>'+data.accel[2]+'</p>');
  $('#magXLabel').html('<p>'+data.magnet[0]+'</p>');
  $('#magYLabel').html('<p>'+data.magnet[1]+'</p>');
  $('#magZLabel').html('<p>'+data.magnet[2]+'</p>');
};

function plotLux() {
  if(luxChart == ''){
    luxChart = draw_chart('#luxChart',function(){
      return Number($('#luxLabel').text());},
      'Ambient Light','Lux');
  }
  else{
    clearInterval(luxChart);
    destroyChart('#luxChart');
    luxChart = '';
  }
}

function plotHumidity() {
  if(humidityChart == ''){
    humidityChart = draw_chart('#humidityChart',function(){
      return Number($('#humidityLabel').text());},
      'Humidity','%');
  }
  else{
    clearInterval(humidityChart);
    destroyChart('#humidityChart');
    humidityChart = '';
  }
}

function plotPressure() {
  if(pressureChart == ''){
    pressureChart = draw_chart('#pressureChart',function(){
      return Number($('#pressureLabel').text());},
      'Atmospheric Pressure','hPa');
  }
  else{
    clearInterval(pressureChart);
    pressureChart = '';
    destroyChart('#pressureChart');
  }
}

function plotTemp() {
  if(tempChart == ''){
    tempChart = [];
/*    tempChart.push(draw_chart('#atempChart',function(){
      return Number($('#aTempLabel').text());},
      'Ambient Temperature','Celsius'));*/
    tempChart.push(draw_chart('#otempChart',function(){
      return Number($('#oTempLabel').text());},
      'Object Temperature','Celsius'));
  }
  else
  {
    clearInterval(tempChart[0]);
    //clearInterval(tempChart[1]);
    //destroyChart('#atempChart');
    destroyChart('#otempChart');
    tempChart = '';
  }
}

function plotOrient() {
  if(draw3d == '') {
    draw3d = new Draw3D('orientChart');
    draw3d.init();
    draw3d.animate();
    draw3d.render();
    draw3d.setCallback(function() {
      if($('#accelXLabel').text() != '') { 
        return [Number($('#accelXLabel').text()),
      Number($('#accelYLabel').text()),
      Number($('#accelZLabel').text()),
      Number($('#magXLabel').text()),
      Number($('#magYLabel').text()),
      Number($('#magZLabel').text())
      ]; }
      else { return [0,0,0]; }
    });
  }
  else {
    draw3d.close();
    draw3d = '';
    $('#orientChart').html('');
  }
}


