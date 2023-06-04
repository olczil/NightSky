import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import vertexShader from '/assets/shaders/v_shader.glsl';
import fragmentShader from '/assets/shaders/f_shader.glsl';

const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

const params = {
  threshold: 0,
  strength: 0.3,
  radius: 0.2,
  exposure: 0.8
};

const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
const materials = {};

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 45, 1000 );
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );

const controls = new OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI * 0.5;
controls.minDistance = 1;
controls.maxDistance = 100;
controls.addEventListener( 'change', render );

scene.add( new THREE.AmbientLight( 0x898989 ) );

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
    vertexShader,
    fragmentShader,
    defines: {}
  } ), 'baseTexture'
);
mixPass.needsSwap = true;

const outputPass = new OutputPass( THREE.ReinhardToneMapping );

const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( mixPass );
finalComposer.addPass( outputPass );


const mouse = new THREE.Vector2();

window.addEventListener( 'pointerdown', onPointerDown );

setupScene();

function onPointerDown( event ) {

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

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

function setupScene() {

  scene.traverse( disposeMaterial );
  scene.children.length = 0;


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

  procyon.layers.enable(BLOOM_SCENE);

  // Gomeisa
  const gomeisaGeometry = new THREE.SphereGeometry( 4, 32, 16 ); 
  const gomeisaMaterial = new THREE.MeshBasicMaterial({ color: 0xC1D5FF, alphaMap: starAlphaTexture, aoMap: starAOTexture });
  const gomeisa = new THREE.Mesh(gomeisaGeometry, gomeisaMaterial);
  
  gomeisa.position.x = 20;
  gomeisa.position.y = 10;
  gomeisa.position.z = 0;

  scene.add(gomeisa);

  gomeisa.layers.enable(BLOOM_SCENE);

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

  animate();

}

function disposeMaterial( obj ) {

  if ( obj.material ) {

    obj.material.dispose();

  }

}

function animate() {
  skybox.rotation.x += 0.005;
  skybox.rotation.y += 0.005;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

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

function restoreMaterial( obj ) {

  if ( materials[ obj.uuid ] ) {

    obj.material = materials[ obj.uuid ];
    delete materials[ obj.uuid ];

  }

}