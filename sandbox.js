import * as THREE from 'three';

import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

let container;
let camera, controls, scene, renderer;
let mesh, texture;

const worldWidth = 256, worldDepth = 256;
const clock = new THREE.Clock();


init();
animate();

function init() {

    container = document.getElementById( 'container' );

    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x70a4cc);

    let mainLight = new THREE.HemisphereLight(0xffffff, 0x70a4cc, 0.9);
    mainLight.position.set(200, -50, -100);
    scene.add(mainLight);
    
    const shadowLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);
    shadowLight.position.set(0, 10, 0);
    shadowLight.target.position.set(-5, 0, 0);
    shadowLight.castShadow = true;
    scene.add(shadowLight);
    scene.add(shadowLight.target);
    
    // Add Scene Fog
    scene.fog = new THREE.FogExp2( 0x70a4cc, 0.0002 );

    const hillsMap = new THREE.CanvasTexture( new generateHillsTexture() );
    hillsMap.wrapS = THREE.RepeatWrapping;
    hillsMap.wrapT = THREE.RepeatWrapping;
    hillsMap.repeat.x = 10;
    hillsMap.repeat.y = 6;
    hillsMap.anisotropy = 16;

    let material = new THREE.MeshPhysicalMaterial( {
        clearcoat: 0.1,
        clearcoatRoughness: 1,
        metalness: 0,
        roughness: 1,
        color: 0x49a35d,
        normalMap: hillsMap,
        normalScale: new THREE.Vector2( 0.4, 0.4 )
      } );

    const data = generateHeight( worldWidth, worldDepth );  

    camera.position.set( 0, 800, 0 );
    camera.lookAt( 0, 830, - 100 );

    const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
      
    geometry.rotateX( - Math.PI / 2 );

    const vertices = geometry.attributes.position.array;
  
    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
      vertices[ j + 1 ] = data[ i ] * 10;
    }

    geometry.computeVertexNormals();
  
    let ground = new THREE.Mesh(geometry, material);
    ground.castShadow = true;
    ground.receiveShadow = true;
    
    scene.add(ground);


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    controls = new FirstPersonControls( camera, renderer.domElement );
    controls.movementSpeed = 150;
    controls.lookSpeed = 0;

    window.addEventListener( 'resize', onWindowResize );

}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();

}

function generateHeight( width, height ) {

    let seed = Math.PI / 4;
    window.Math.random = function () {

        const x = Math.sin( seed ++ ) * 10000;
        return x - Math.floor( x );

    };

    const size = width * height, data = new Uint8Array( size );
    const perlin = new ImprovedNoise(), z = Math.random() * 100;

    let quality = 1;

    for ( let j = 0; j < 4; j ++ ) {

        for ( let i = 0; i < size; i ++ ) {

            const x = i % width, y = ~ ~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

        }

        quality *= 5;

    }

    return data;

}

function generateHillsTexture() {

    const canvas = document.createElement( 'canvas' );
    const width = 7500;
    const height = 7500;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext( '2d' );
    context.fillStyle = 'rgb(127,127,255)';
    context.fillRect( 0, 0, width, height );

    for ( let i = 0; i < 4000; i ++ ) {

        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 3 + 3;

        let nx = Math.random() * 2 - 1;
        let ny = Math.random() * 2 - 1;
        let nz = 1.5;

        const l = Math.sqrt( nx * nx + ny * ny + nz * nz );

        nx /= l; ny /= l; nz /= l;

        context.fillStyle = 'rgb(' + ( nx * 127 + 127 ) + ',' + ( ny * 127 + 127 ) + ',' + ( nz * 255 ) + ')';
        context.beginPath();
        context.arc( x, y, r, 0, Math.PI * 2 );
        context.fill();

    }

    return canvas;
}

function animate() {

    requestAnimationFrame( animate );
    render();

}


function render() {

    controls.update( clock.getDelta() );
    renderer.render( scene, camera );

}