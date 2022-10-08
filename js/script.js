import * as THREE from "./three.module.js";
import { OrbitControls } from "./OrbitControls.js";
import { OrbitControls2 } from "./OrbitControls_2.js";
import * as dat from 'https://unpkg.com/three@0.126.1/examples/jsm/libs/dat.gui.module.js';

// import atmosphereFragmentShader from "./shaders/atmosphereFragmentShader.glsl";
// import atmosphereVertexShader from "./shaders/atmosphereVertexShader.glsl";

import {
  Lensflare,
  LensflareElement,
} from 'https://unpkg.com/three@0.126.1/examples/jsm/objects/Lensflare.js';

import Stats from 'https://unpkg.com/three@0.126.1/examples/jsm/libs/stats.module.js';

var isWindowSmall,
  maxRad,
  minRad,
  globeRad,
  camera,
  renderer,
  renderer2,
  scene,
  scene2,
  galaxy,
  strokes,
  dots,
  dotStrokes,
  dotsMaterial,
  strokesMaterial,
  sphere;
  var material1;
const smallWin = 1000;
var positions = [];
var ww = window.innerWidth,
  wh = window.innerHeight;
renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#globe-canvas"),
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

renderer.setSize(ww, wh);
renderer.setClearColor(0x000000);

scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 800, 2500);

camera = new THREE.PerspectiveCamera(50, ww / wh, 0.1, 10000);

camera.position.set(0, 0, 600);
camera.lookAt(new THREE.Vector3(0, 0, 0));
var loader = new THREE.TextureLoader();
loader.crossOrigin = "";
var loader2 = new THREE.TextureLoader();
loader2.crossOrigin = "";
var dotTexture = loader2.load(
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/127738/dotTexture.png"
);
dotsMaterial = new THREE.PointsMaterial({
  size: 6,
  map: dotTexture,
  transparent: true,
  opacity: 0.3,
  alphaTest: 0.1,
});

strokesMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.3,
});

var atmosphere;
galaxy = new THREE.Object3D();
scene.add(galaxy);
strokes = new THREE.LineSegments(new THREE.Geometry(), strokesMaterial);
galaxy.add(strokes);
dotStrokes = new THREE.Points(new THREE.Geometry(), dotsMaterial);
galaxy.add(dotStrokes);

if (ww > smallWin) {
  maxRad = 500;
  globeRad = 250;
  minRad = 250;
  isWindowSmall = false;
  material1 = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./img/earth_3.jpg"),
    transparent: true,
    opacity: 0,
    
  });
  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(globeRad, 16, 16),
    material1
  );
  
} else {
  maxRad = 250;
  globeRad = 150;
  minRad = 150;
  isWindowSmall = true;
  material1 = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("./img/earth_mob2.jpg"),
    opacity: 0,
    
  });
  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(globeRad, 32, 32),
    material1
  );


  atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(190, 16, 16),
    new THREE.ShaderMaterial({
      vertexShader : `varying vec3 vertexNormal;
  
      void main(){
          vertexNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
      fragmentShader : `varying vec3 vertexNormal;
  
      void main(){
          float intensity = pow(0.5-dot(vertexNormal, vec3(0,0,1.0)),2.0);
          gl_FragColor = vec4(0.3,0.6,1.0,1.0) * intensity;
      }`,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    opacity: 0,
  transparent: true,})
      
  );

  const cubeTextureLoader = new THREE.CubeTextureLoader();
const environmentMapTexture = cubeTextureLoader.load(
  [
    './img/px.png',
    './img/nx.png',
    './img/py.png',
    './img/ny.png',
    './img/pz.png',
    './img/nz.png',
  ]
);

/**
 * Scene
 */
scene.background = environmentMapTexture;
  atmosphere.position.z = -1400;
  scene.add(atmosphere)

  

}

function run() {
  for (var x = 0; x < 700; x++) {
    var pos = {
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      lat: 2 * Math.PI * Math.random(),
      long: Math.acos(2 * Math.random() - 1),
    };
    pos.u = Math.cos(pos.long);
    pos.sqrt = Math.sqrt(1 - pos.u * pos.u);
    positions.push(pos);
  }

  function init() {
    //   var download = document.createElement("a");
    //   download.setAttribute("id", "downloadButton");
    //   download.addEventListener("click", downloadImage);
    //   document.querySelector(".cr.function").appendChild(download);

    requestAnimationFrame(render);
  }

  window.addEventListener("resize", onResize);

  function onResize() {
    ww = window.innerWidth;
    wh = window.innerHeight;
    camera.aspect = ww / wh;
    camera.updateProjectionMatrix();
    renderer.setSize(ww, wh);
  }

  var radius = 25;
  var i = 0;
  var j = 0;
  var isTextVisible = false;
  var isExpanding = true;
  var isCompressed = true;
  var isOpacity1 = false;
  var isSphereVisible = false;
  var render = function (a) {
    requestAnimationFrame(render);
    // scene.add(sphere);
    
    if (sphere.position.z != 0) {
      sphere.position.z += 50;
      atmosphere.position.z += 50;
      console.log(sphere.position.z);
    }

    
    if(!isWindowSmall){
     

      if (isExpanding) {
        expandSphere();
      } else {
        compressSphere();
      }
    }else{
      sphere.rotation.y += 0.001
      atmosphere.rotation.z =camera.rotation.z
      atmosphere.rotation.x =camera.rotation.x 
      atmosphere.rotation.y =camera.rotation.y
      
    }

    if (material1.opacity < 1) {
      if (!isWindowSmall) {
        material1.opacity += 0.005;
      } else {
        material1.opacity += 0.01;
      }
    }

    renderer.render(scene, camera);
  };

  const myTimeout = setTimeout(() => {
    scene.add(sphere)
    if (!isWindowSmall) {
      document.querySelector(".nav1").style.display = "flex";
      document.querySelector(".nav2").style.display = "flex";

      var controls = new OrbitControls(camera, renderer.domElement);
      document.body.addEventListener("mousemove", (e) => {
        controls.handleMouseMoveRotate(e);
      });

      // createStrokes(500); 
    }else{
      var controls = new OrbitControls2(camera, renderer.domElement);
      controls.enableZoom = false;
      document.querySelector(".floater__btn").style.display = "flex";
      document.querySelector(".icon-bg").style.display = "flex";
      document.querySelector(".ms-logo-mob").style.display = "flex";
        
    }
    document.querySelector(".loading-screen").style.display = "none";
    document.querySelector(".title-img").style.display = "block";
    init();

    // const links_tag= document.querySelector('.navbar').getElementsByTagName('a');
    // console.log(links_tag)
  }, 2000);

  // var orbit;
  // document.addEventListener('mousemove', function(e){
  //     let scale = -0.001;
  //     orbit.rotateY( e.movementX * scale );
  //     orbit.rotateX( e.movementY * scale );
  //     orbit.rotation.z = 0; //this is important to keep the camera level..
  // })

  // //the camera rotation pivot
  // orbit = new THREE.Object3D();
  // orbit.rotation.order = "YXZ"; //this is important to keep level, so Z should be the last axis to rotate in order...
  // orbit.position.copy(new THREE.Vector3(0, 0, 600));
  // scene.add(orbit );

  // let cameraDistance = 1;
  // camera.position.z = cameraDistance;
  // orbit.add( camera );
  function expandSphere() {
    if (radius < maxRad) {
      radius += 10;
      createStrokes(radius);
    } else {
      isExpanding = false;
    }
  }
  function compressSphere() {
    if (radius > minRad) {
      radius -= 10;
      createStrokes(radius);
    } else {
      if (isCompressed) {
        const socials = document.querySelector(".socials");
        socials.classList.add("social-animation");
        socials.style.display = "flex";
        isCompressed = false;
      }
    }
  }
  
  

  
  if (!isWindowSmall) {
    sphere.rotation.x = 0.3;
    sphere.rotation.y = 3.19;
    sphere.rotation.z = -0.08;
    sphere.position.z = -1400;
  } else {
    sphere.rotation.x = 0.3;
    sphere.rotation.y = 3.36;
    sphere.rotation.z = -0.08;
    sphere.position.z = -1400;
  }

  // TweenMax.to(material1, 3, { opacity: 1 });

  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);

  // setTimeout(() => {
  //   document.getElementById('container').innerHTML += `<div class="title">
  //   <img src="./img/MS-22 Logo-01.png" alt="">

  // </div>`
  // isTextVisible = true;
  // }, 600);
}

run();
function createStrokes(radius) {
  var dots = new THREE.Geometry();
  // Create vertices
  for (var i = 0; i < 700; i++) {
    var pos = {
      x:
        (positions[i].x * 20 + radius) *
        positions[i].sqrt *
        Math.cos(positions[i].lat),
      y:
        (positions[i].y * 20 + radius) *
        positions[i].sqrt *
        Math.sin(positions[i].lat),
      z: (positions[i].z * 20 + radius) * positions[i].u,
    };
    var vector = new THREE.Vector3(pos.x, pos.y, pos.z);
    vector.amount = 0;
    dots.vertices.push(vector);
  }

  // Create segments
  var segments = new THREE.Geometry();
  for (var i = dots.vertices.length - 1; i >= 0; i--) {
    var vector = dots.vertices[i];
    for (var j = dots.vertices.length - 1; j >= 0; j--) {
      if (
        vector.amount < 3 &&
        i !== j &&
        vector.distanceTo(dots.vertices[j]) < 55
      ) {
        segments.vertices.push(vector);
        segments.vertices.push(dots.vertices[j]);
        vector.amount++;
        dots.vertices[j].amount++;
      }
    }
  }

  strokesMaterial.color = new THREE.Color("#00ffff");
  strokesMaterial.opacity = 1;
  strokes.geometry = segments;
  dotsMaterial.size = 5;
  dotsMaterial.opacity = 0.6;
  dotsMaterial.color = new THREE.Color("#000fff");
  dotStrokes.geometry = dots;
  dotStrokes.geometry.verticesNeedUpdate = true;

  //   if(true){

  //   } else {
  //     dotsMaterial.opacity = 0;
  //   }

  renderer.setClearColor(new THREE.Color("#000000"));
}
// window.addEventListener('resize', ()=>{
//   run()
// })
window.addEventListener("resize", () => {

  if (ww > smallWin) {
    maxRad = 500;
    globeRad = 253;
    minRad = 253;
    isWindowSmall = false;
  } else {
    maxRad = 250;
    globeRad = 150;
    minRad = 150;
    isWindowSmall = true;
  }
  if (!isWindowSmall) {
    document.querySelector(".nav1").style.display = "flex";
    document.querySelector(".nav2").style.display = "flex";
    document.querySelector(".socials").style.display = "flex";
    document.querySelector(".floater__btn").style.display = "none";
    document.querySelector(".hamburger").style.display = "none";
    createStrokes(300);
  } else {
    document.querySelector(".nav1").style.display = "none";
    document.querySelector(".nav2").style.display = "none";
    document.querySelector(".socials").style.display = "none";
    document.querySelector(".floater__btn").style.display = "flex";
    document.querySelector(".hamburger").style.display = "block";
    
  }
});

// hamburger js

const hamBtn = document.querySelector(".icon");
hamBtn.addEventListener("click", () => {
  hamBtn.querySelectorAll("span").forEach((span) => {
    span.classList.toggle("open");
  });

  document.querySelector('.menu').querySelector('ul').querySelectorAll('li').forEach((li)=>{
    li.classList.toggle('open')
  });

  document.querySelector('.menu').classList.toggle('open')
});



