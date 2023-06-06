import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';


let container;
let camera, scene, renderer, controls;
let pointLight;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const clock = new THREE.Clock();


// Star textures
const starAOTexture = new THREE.TextureLoader().load( 'public/starAO.png' );
starAOTexture.colorSpace = THREE.SRGBColorSpace;

const starAlphaTexture = new THREE.TextureLoader().load( 'public/starAlpha.png' );
starAlphaTexture.colorSpace = THREE.SRGBColorSpace;

// Procyon
const procyonGeometry = new THREE.SphereGeometry( 8, 32, 16 ); 
const procyonMaterial = new THREE.MeshBasicMaterial({ color: 0xfffffb, alphaMap: starAlphaTexture, aoMap: starAOTexture });
const procyon = new THREE.Mesh(procyonGeometry, procyonMaterial);
procyon.position.set(-105, -60, 0);

// Gomeisa
const gomeisaGeometry = new THREE.SphereGeometry( 16, 32, 16 ); 
const gomeisaMaterial = new THREE.MeshBasicMaterial({ color: 0xC1D5FF, alphaMap: starAlphaTexture, aoMap: starAOTexture });
const gomeisa = new THREE.Mesh(gomeisaGeometry, gomeisaMaterial);
gomeisa.position.set(105, 60, 0);

// Text etc
const fontLoader = new FontLoader();
fontLoader.load(
  'public/space-mono-regular.json',
  (monospace) => {
    const canisMinorGeometry = new TextGeometry('Canis minor', {
      size: 20,
      height: 1,
      font: monospace,
    });
    const canisMinorMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 'white',
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      envMap: 'reflection',
      depthTest: false

    });
    const canisMinorMesh = new THREE.Mesh(canisMinorGeometry, canisMinorMaterial);
    canisMinorMesh.position.set(-80, 40, -300);
    scene.add(canisMinorMesh);

    const canisMinorSubtitleGeometry = new TextGeometry('71. co do wielkości gwiazdozbiór usytuowany\n w pobliżu równika niebieskiego. Jest jednym \n z 48 pierwotnych greckich gwiazdozbiorów.', {
      size: 10,
      height: 1,
      font: monospace,
    });

    const canisMinorSubtitleMesh = new THREE.Mesh(canisMinorSubtitleGeometry, canisMinorMaterial);
    canisMinorSubtitleMesh.position.set(-170, 0, -300);
    scene.add(canisMinorSubtitleMesh);

    const gomeisaTextGeometry = new TextGeometry('Gomeisa', {
      size: 6,
      height: 0.1,
      font: monospace,
    });
    const gomeisaTextMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 'slateblue',
      emissiveIntensity: 1,
      side: THREE.DoubleSide,
      envMap: 'reflection',
      depthTest: false

    });
    const gomeisaTextMesh = new THREE.Mesh(gomeisaTextGeometry, gomeisaTextMaterial);
    gomeisaTextMesh.position.set(12, 66, -10);

    scene.add(gomeisaTextMesh);

    const procyonTextGeometry = new TextGeometry('Procyon', {
      size: 6,
      height: 0.1,
      font: monospace,
    });

    const procyonTextMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 'slateblue',
      emissiveIntensity: 1,
      side: THREE.DoubleSide,
      envMap: 'reflection',
      depthTest: false
      
    });

    const procyonTextMesh = new THREE.Mesh(procyonTextGeometry, procyonTextMaterial);
    procyonTextMesh.position.set(-90, -58, -10);

    scene.add(procyonTextMesh);

    const gomeisaDetailsGeometry = new TextGeometry('Druga pod względem jasności gwiazda\nw gwiazdozbiorze Małego Psa, znajdująca się\nw odległości ok. 162 lat świetlnych od Słońca.', {
      size: 1.8,
      height: 0.1,
      font: monospace,
    });
    const detailsMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 'slateblue',
      emissiveIntensity: 1,
      side: THREE.DoubleSide,
      envMap: 'reflection',
      depthTest: false

    });
    const gomeisaDetailsMesh = new THREE.Mesh(gomeisaDetailsGeometry, detailsMaterial);
    gomeisaDetailsMesh.position.set(12, 59, -10);

    scene.add(gomeisaDetailsMesh);

    const procyonDetailsGeometry = new TextGeometry('Najjaśniejsza gwiazda w gwiazdozbiorze Małego Psa,\nósma co do jasności gwiazda nocnego nieba. Znajduje się\nw odległości około 11,5 roku świetlnego od Słońca.', {
      size: 1.8,
      height: 0.1,
      font: monospace,
    });

    const procyonDetailsMesh = new THREE.Mesh(procyonDetailsGeometry, detailsMaterial);
    procyonDetailsMesh.position.set(-90, -65, -10);

    scene.add(procyonDetailsMesh);
  }
);

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 5000 );
  camera.position.z = 200;

  //cubemap
  const path = 'public/skybox/';
  const format = '.png';
  const urls = [
    path + 'right' + format, path + 'left' + format,
    path + 'top' + format, path + 'bottom' + format,
    path + 'front' + format, path + 'back' + format
  ];

  const reflectionCube = new THREE.CubeTextureLoader().load( urls );
  const refractionCube = new THREE.CubeTextureLoader().load( urls );
  refractionCube.mapping = THREE.CubeRefractionMapping;

  scene = new THREE.Scene();
  scene.background = reflectionCube;

  //lights
  const ambient = new THREE.AmbientLight( 0xffffff, 20 );
  scene.add( ambient );

  pointLight = new THREE.PointLight( 0xffffff, 2 );
  scene.add( pointLight );

  //planets
  scene.add(gomeisa);
  scene.add(procyon);

  //materials
  const cubeMaterial3 = new THREE.MeshLambertMaterial( { color: 0xffaa00, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3 } );
  const cubeMaterial2 = new THREE.MeshLambertMaterial( { color: 0xfff700, envMap: refractionCube, refractionRatio: 0.95 } );
  const cubeMaterial1 = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } );

  //renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  controls = new FlyControls( camera, renderer.domElement );
  controls.movementSpeed = 100;
  controls.rollSpeed = Math.PI / 50;

  window.addEventListener( 'resize', onWindowResize );
  document.addEventListener( 'pointerdown', onPointerDown );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onPointerDown( event ) {

  pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
  raycaster.setFromCamera( pointer, camera );
  const intersects = raycaster.intersectObjects( procyon );

  if ( intersects.length > 0 ) {

    procyon.material.color.setHex(0x444444);

  }

  renderer.render();

}

function animate() {

  requestAnimationFrame( animate );
  render();

}



function render() {

  controls.update( clock.getDelta() );
  renderer.render( scene, camera );

}
