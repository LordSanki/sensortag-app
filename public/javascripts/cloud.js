var acc_name  = '';
function getCloudConfig(conf){
  //$.get('/cloud_config', function(conf){
  if(conf.name){
    acc_name = conf.name;
    $.get('/cloud_devices', getCloudDevices);
  }
  else{
    var html = '<div class="box-5p">';
    html += '<div class="text">Not Connected to the Cloud</div>';
    html += '<form id="cloud_login" action="/">';
    html += '<p>Email:</p>';
    html += '<input type="text" name="username">';
    html += '<p>Password:</p>';
    html += '<input type="password" name="password">';
    html += '<button type="submit" class="btn" name="submit">Login</button>';
    html += '</form>';
    html += '</div>';
    html += '<script>$("#cloud_login").submit(function(event){event.preventDefault(); cloud_login(this);});</script>';
    $('#cloud').html(html);
  }
}

function cloud_login(obj) {
  var jqobj = $(obj).serializeArray();
  var json = JSON.stringify(jqobj);//{'username': jqobj.0.value, 'password': jqobj.1.value};
  var json = JSON.parse(json);
  $.post('/cloud_token',json,function(d){
    getCloudConfig(d);
  });
}


function getCloudDevices(data){
  var html = '<div class="box-5p">';
  html += '<div class="row"><div class="col-sm-2"><p>Account Name:</p></div>';
  html += '<div class="col-sm-4"><p>'+acc_name+'</p></div></div>';

  html += '<table>';
  html += '<tr><th>Device ID</th><th>Status</th><th>Action</th></tr>';

  for(x in data.devices){
    var id = String(data.devices[x].id);
    html += '<tr>';
    html += '<td>'+id.toUpperCase()+'</td>';
    if(data.devices[x].cloud == 'true'){
      html += '<td>Connected to Cloud</td>';
      html += '<td><button class="btn" id="'+id+'" onclick="cloudDeviceDisconnect(this.id)">Disconnect</button></td>';
    }
    else{
      if(data.devices[x].gateway == 'true'){
        html += '<td>Disconnected from Cloud</td>';
        html += '<td><button class="btn" id="'+id+'" onclick="cloudDeviceConnect(this.id)">Connect</button></td>';
      }
      else{
        html += '<td>Device Unavailable</td>';
        html += '<td>No Action</td>';
      }
    }
    html += '</tr>';
  }
  html += '</table></div>';
  $('#cloud').html(html);
}

function cloudDeviceConnect(data){
  var dev_id = data;
  $.post('/cloud_devices', {id: dev_id, cloud:'true', gateway:'true'}, getCloudDevices);
}

function cloudDeviceDisconnect(data){
  $.post('/cloud_devices', {id: data.id.toString(), cloud:'false', gateway:'true'}, getCloudDevices);
}


