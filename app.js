import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';


const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 45, 1000 );
camera.position.set( 0, 0, 80 );
camera.lookAt( 0, 0, 0 );

const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window. innerHeight),
  1.6,
  0.1,
  0.1
);

composer.addPass(bloomPass);


const controls = new OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 1;
controls.maxDistance = 100;
controls.enableZoom = false;



scene.add( new THREE.AmbientLight( 0x898989 ) );

setupScene();

window.onresize = function () {

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize( width, height );

  render();

};

function setupScene() {

  // Star textures
  const starAOTexture = new THREE.TextureLoader().load( 'public/starAO.png' );
  starAOTexture.colorSpace = THREE.SRGBColorSpace;

  const starAlphaTexture = new THREE.TextureLoader().load( 'public/starAlpha.png' );
  starAlphaTexture.colorSpace = THREE.SRGBColorSpace;
  

  // Procyon
  const procyonGeometry = new THREE.SphereGeometry( 2, 32, 16 ); 
  const procyonMaterial = new THREE.MeshBasicMaterial({ color: 0xfffffb, alphaMap: starAlphaTexture, aoMap: starAOTexture });
  const procyon = new THREE.Mesh(procyonGeometry, procyonMaterial);

  procyon.position.x = -20;
  procyon.position.y = -10;
  procyon.position.z = 0;

  scene.add(procyon);

  // Gomeisa
  const gomeisaGeometry = new THREE.SphereGeometry( 4, 32, 16 ); 
  const gomeisaMaterial = new THREE.MeshBasicMaterial({ color: 0xC1D5FF, alphaMap: starAlphaTexture, aoMap: starAOTexture });
  const gomeisa = new THREE.Mesh(gomeisaGeometry, gomeisaMaterial);
  
  gomeisa.position.x = 20;
  gomeisa.position.y = 10;
  gomeisa.position.z = 0;

  scene.add(gomeisa);

  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load( 'public/skybox/space_ft.png');
  let texture_bk = new THREE.TextureLoader().load( 'public/skybox/space_bk.png');
  let texture_up = new THREE.TextureLoader().load( 'public/skybox/space_up.png');
  let texture_dn = new THREE.TextureLoader().load( 'public/skybox/space_dn.png');
  let texture_rt = new THREE.TextureLoader().load( 'public/skybox/space_rt.png');
  let texture_lf = new THREE.TextureLoader().load( 'public/skybox/space_lf.png');
    
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
  scene.add( skybox );  
}

function animate() {
  // renderer.render(scene, camera);
  composer.render();
  requestAnimationFrame(animate);
}
animate();

