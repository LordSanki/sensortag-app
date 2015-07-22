/*
 * Class for drawing and rotating an object
 * */

function Draw3D(label){
  this.container = document.getElementById(label);
  this.scene = '';
  this.camera = '';
  this.renderer = '';
  this.object = '';
  this.callback = '';
  this.animateID = '';
}

Draw3D.prototype.close = function() {
  cancelAnimationFrame(this.animateID);
}

Draw3D.prototype.init = function() {

  this.renderer = new THREE.WebGLRenderer({antialias:true});
  this.renderer.setClearColor( 0x333F47 );
  this.renderer.setSize( 400, 300 );
  this.container.appendChild( this.renderer.domElement );


  this.camera = new THREE.PerspectiveCamera( 70, 1, 1, 1000 );
  this.camera.position.x = 0;
  this.camera.position.y = 0;
  this.camera.position.z = 200;

  this.scene = new THREE.Scene();
  this.scene.add(this.camera);

  var light = new THREE.PointLight(0xffffff);
  light.position.set(150,150,150);
  this.scene.add(light);

  // Cube
  var geometry = new THREE.BoxGeometry( 60, 100, 10 );
  var material = new THREE.MeshBasicMaterial( { color: 0xb20000} );
  this.shape = new THREE.Mesh( geometry, material );
  this.shape.position.x = 0;
  this.shape.position.y = 0;
  this.shape.position.z = 0;
  this.scene.add( this.shape );
}

//
Draw3D.prototype.animate = function() {
  var obj = this;
  obj.render();
  this.animateID = requestAnimationFrame( function(){obj.animate();} );
}

//
Draw3D.prototype.render = function() {
  if(this.callback != ''){
    var xyz = this.callback();
    this.set_position(xyz[0], xyz[1], xyz[2], xyz[3]/40.0, xyz[4]/40.0, xyz[5]/40.0);
  }
  this.renderer.render( this.scene, this.camera );
}

//
Draw3D.prototype.setCallback = function(func) {
  this.callback = func;
}

//
Draw3D.prototype.set_position = function(ax, ay, az, mx, my, mz){
  var roll = 0, pitch = 0, yaw = 0;
//  roll = 1.5707963267948966 - Math.acos( Math.max(Math.min(ay,1.0),-1.0) );
//  pitch = 1.5707963267948966 - Math.acos(Math.max(Math.min(ax,1.0),-1.0));
  roll = Math.atan(ay/((ay*ay)+(az*az)));
  pitch = Math.atan(ax/((ax*ax)+(az*az)));
  var x = mx*Math.cos(pitch) + my*Math.sin(pitch)*Math.sin(roll) + mz*Math.sin(pitch)*Math.cos(roll);
  var y = my*Math.cos(roll) + mz*Math.sin(roll);


  //yaw = Math.atan2(-y, x);
  console.log(yaw);
  this.rotate([roll, pitch, yaw]);
}

//
Draw3D.prototype.rotate = function (radians) {
  
  var unit_vectorX = new THREE.Vector3(1,0,0);
  var unit_vectorY = new THREE.Vector3(0,1,0);
  var unit_vectorZ = new THREE.Vector3(0,0,1);

  var rotMatX = new THREE.Matrix4();
  var rotMatY = new THREE.Matrix4();
  var rotMatZ = new THREE.Matrix4();
  rotMatX.makeRotationAxis(unit_vectorX.normalize(), radians[0]);
  rotMatY.makeRotationAxis(unit_vectorY.normalize(), radians[1]);
  rotMatZ.makeRotationAxis(unit_vectorZ.normalize(), radians[2]);
  rotMatX.multiply(rotMatY);
  rotMatX.multiply(rotMatZ);

  this.shape.matrix = rotMatX;
  this.shape.rotation.setFromRotationMatrix(this.shape.matrix);
}


