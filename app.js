import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let container;

let camera, scene, renderer;

let pointLight;

// Star textures
const starAOTexture = new THREE.TextureLoader().load( 'public/starAO.png' );
starAOTexture.colorSpace = THREE.SRGBColorSpace;

const starAlphaTexture = new THREE.TextureLoader().load( 'public/starAlpha.png' );
starAlphaTexture.colorSpace = THREE.SRGBColorSpace;

// Procyon
const procyonGeometry = new THREE.SphereGeometry( 4, 32, 16 ); 
const procyonMaterial = new THREE.MeshBasicMaterial({ color: 0xfffffb, alphaMap: starAlphaTexture, aoMap: starAOTexture });
const procyon = new THREE.Mesh(procyonGeometry, procyonMaterial);
procyon.position.set(-50, -30, 0);

// Gomeisa
const gomeisaGeometry = new THREE.SphereGeometry( 8, 32, 16 ); 
const gomeisaMaterial = new THREE.MeshBasicMaterial({ color: 0xC1D5FF, alphaMap: starAlphaTexture, aoMap: starAOTexture });
const gomeisa = new THREE.Mesh(gomeisaGeometry, gomeisaMaterial);
gomeisa.position.set(50, 30, 0);

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
    canisMinorMesh.position.set(-80, 0, -300);
    scene.add(canisMinorMesh);

    const gomeisaTextGeometry = new TextGeometry('Gomeisa', {
      size: 4,
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
    gomeisaTextMesh.position.set(10, 30, -5);

    scene.add(gomeisaTextMesh);

    const procyonTextGeometry = new TextGeometry('Procyon', {
      size: 4,
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
    procyonTextMesh.position.set(-40, -33, -5);

    scene.add(procyonTextMesh);
  }
);

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 5000 );
  camera.position.z = 100;

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

  //controls
  const controls = new OrbitControls( camera, renderer.domElement );
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = Math.PI / 4;
  controls.maxPolarAngle = Math.PI / 1.5;

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );
  render();

}

function render() {

  renderer.render( scene, camera );

}