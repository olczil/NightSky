import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// this is a mess //


const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set( 0, 0, 80 );
camera.lookAt( 0, 0, 0 );

const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window. innerHeight),
  0.9,
  0.1,
  0.1
);

composer.addPass(bloomPass);

const fontLoader = new FontLoader();
fontLoader.load(
  'public/Montserrat_Bold.json',
  (montserratFont) => {
    const textGeometry = new TextGeometry('Canis minor', {
      size: 20,
      height: 1,
      font: montserratFont,
    });
    const textMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 'white',
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      envMap: 'reflection',
      depthTest: false
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-80, 0, -300);
    scene.add(textMesh);

    const gomeisaTextGeometry = new TextGeometry('Gomeisa', {
      size: 4,
      height: 1,
      font: montserratFont,
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
    gomeisaTextMesh.position.set(18, 28, 0);

    scene.add(gomeisaTextMesh);
  }
);

// fontLoader.load(
//   'public/Montserrat_Bold.json',
//   (montserratFont) => {
//     const gomeisaTextGeometry = new TextGeometry('Gomeisa', {
//       size: 10,
//       height: 1,
//       font: montserratFont,
//     });
//     const gomeisaTextMaterial = new THREE.MeshStandardMaterial({
//       color: 0xffffff,
//       emissive: 'white',
//       emissiveIntensity: 0.3,
//       transparent: true,
//       opacity: 0.2,
//       side: THREE.DoubleSide,
//       envMap: 'reflection',
//       depthTest: false

//     });
//     const gomeisaTextMesh = new THREE.Mesh(gomeisaTextGeometry, gomeisaTextMaterial);
//     gomeisaTextMesh.position.set(50, 30, -50);

//     scene.add(gomeisaTextMesh);
//   }
// );



// Skybox
let materialArray = [];
let texture_ft = new THREE.TextureLoader().load( 'public/skybox/front.png');
let texture_bk = new THREE.TextureLoader().load( 'public/skybox/back.png');
let texture_up = new THREE.TextureLoader().load( 'public/skybox/top.png');
let texture_dn = new THREE.TextureLoader().load( 'public/skybox/bottom.png');
let texture_rt = new THREE.TextureLoader().load( 'public/skybox/right.png');
let texture_lf = new THREE.TextureLoader().load( 'public/skybox/left.png');
  
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

for (let i = 0; i < 6; i++)
materialArray[i].side = THREE.BackSide;
let skyboxGeo = new THREE.BoxGeometry( 1000, 1000, 1000);
let skybox = new THREE.Mesh( skyboxGeo, materialArray );
skybox.position.set(0,0,0);

// Star textures
const starAOTexture = new THREE.TextureLoader().load( 'public/starAO.png' );
starAOTexture.colorSpace = THREE.SRGBColorSpace;

const starAlphaTexture = new THREE.TextureLoader().load( 'public/starAlpha.png' );
starAlphaTexture.colorSpace = THREE.SRGBColorSpace;

// Procyon
const procyonGeometry = new THREE.SphereGeometry( 2, 32, 16 ); 
const procyonMaterial = new THREE.MeshBasicMaterial({ color: 0xfffffb, alphaMap: starAlphaTexture, aoMap: starAOTexture });
const procyon = new THREE.Mesh(procyonGeometry, procyonMaterial);
procyon.position.set(-50, -30, 0);

// Gomeisa
const gomeisaGeometry = new THREE.SphereGeometry( 4, 32, 16 ); 
const gomeisaMaterial = new THREE.MeshBasicMaterial({ color: 0xC1D5FF, alphaMap: starAlphaTexture, aoMap: starAOTexture });
const gomeisa = new THREE.Mesh(gomeisaGeometry, gomeisaMaterial);
gomeisa.position.set(50, 30, 0);

setupScene();

function setupScene() {
  scene.add(procyon);
  scene.add(gomeisa);
  scene.add( skybox );  
}

function animate() {
  // renderer.render(scene, camera);
  composer.render();
  requestAnimationFrame(animate);
}

animate();


window.onresize = function () {

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );

  render();

};

const controls = new OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 1;
controls.maxDistance = 100;
controls.enableZoom = false;