const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

const params = {
  threshold: 0,
  strength: 3,
  radius: 0.5,
  exposure: 1
};

const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
const materials = {};

const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

const mixPass = new ShaderPass(
  new THREE.ShaderMaterial( {
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture }
    },
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
    defines: {}
  } ), 'baseTexture'
);
mixPass.needsSwap = true;

const outputPass = new OutputPass( THREE.ReinhardToneMapping );

const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( mixPass );
finalComposer.addPass( outputPass );

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();

window.addEventListener( 'pointerdown', onPointerDown );

//moje init czy cos
setupScene();

function onPointerDown( event ) {

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  raycaster.setFromCamera( mouse, camera );
  const intersects = raycaster.intersectObjects( scene.children, false );
  if ( intersects.length > 0 ) {

    const object = intersects[ 0 ].object;
    object.layers.toggle( BLOOM_SCENE );
    render();

  }

}

window.onresize = function () {

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );

  bloomComposer.setSize( width, height );
  finalComposer.setSize( width, height );

  render();

};

function render() {

  scene.traverse( darkenNonBloomed );
  bloomComposer.render();
  scene.traverse( restoreMaterial );

  // render the entire scene, then render bloom scene on top
  finalComposer.render();

}

function darkenNonBloomed( obj ) {

  if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {

    materials[ obj.uuid ] = obj.material;
    obj.material = darkMaterial;

  }

}

////// backuuuuup

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
