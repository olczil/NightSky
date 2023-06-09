import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
import { Sky } from 'three/addons/objects/Sky.js';

let container;
let camera, controls, scene, renderer, parameters;
let sky, sun;

const worldWidth = 256, worldDepth = 256;
const clock = new THREE.Clock();
let rainMaterial;
let rainColor;
let rainSize;
let rainDensity = 10000;
const rainVertices = [];

class FogGUIHelper {
    constructor(fog) {
      this.fog = fog;
    }
    get near() {
      return this.fog.near;
    }
    set near(v) {
      this.fog.near = v;
      this.fog.far = Math.max(this.fog.far, v);
    }
    get far() {
      return this.fog.far;
    }
    set far(v) {
      this.fog.far = v;
      this.fog.near = Math.min(this.fog.near, v);
    }
  }

init();
animate();
// render();

function initParticles() {

    const geometry = new THREE.BufferGeometry();
    
    const textureLoader = new THREE.TextureLoader();

    const assignSRGB = ( texture ) => { texture.colorSpace = THREE.SRGBColorSpace; };

    const sprite = textureLoader.load( 'public/snowflake4.png', assignSRGB );

    for ( let i = 0; i < rainDensity; i ++ ) {

        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;

        rainVertices.push( x, y, z );

    }

    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( rainVertices, 3 ) );

    rainColor = [ 1.0, 0.2, 0.5 ];
    rainSize = 20;

    rainMaterial = new THREE.PointsMaterial( { size: rainSize, map: sprite, blending: THREE.AdditiveBlending, depthTest: true, transparent: true } );
    rainMaterial.color.setHSL( rainColor[ 0 ], rainColor[ 1 ], rainColor[ 2 ], THREE.SRGBColorSpace );

    const particles = new THREE.Points( geometry, rainMaterial );

    particles.rotation.x = Math.random() * 6;
    particles.rotation.y = Math.random() * 6;
    particles.rotation.z = Math.random() * 6;

    particles.layers.set(1);

    scene.add( particles );

}

function initSky() {

    // Add Sky
    sky = new Sky();
    sky.scale.setScalar( 45000 );
    sky.layers.set(0);
    scene.add( sky );

    sun = new THREE.Vector3();

    /// GUI
    const effectController = {
        turbidity: 10,
        rayleigh: 0.2,
        mieCoefficient: 0,
        mieDirectionalG: 0.27,
        elevation: 36,
        azimuth: 180,
        exposure: 0.1
    };


    function guiChanged() {

        const uniforms = sky.material.uniforms;
        uniforms[ 'turbidity' ].value = effectController.turbidity;
        uniforms[ 'rayleigh' ].value = effectController.rayleigh;
        uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
        uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
        const theta = THREE.MathUtils.degToRad( effectController.azimuth );

        sun.setFromSphericalCoords( 1, phi, theta );

        uniforms[ 'sunPosition' ].value.copy( sun );

        renderer.toneMappingExposure = effectController.exposure;

        renderer.render( scene, camera );

    }

    const gui = new GUI();

    const near = 10;
    const far = 1500;
    const color = 0x263448;
    scene.fog = new THREE.Fog(color, near, far);
    scene.background = new THREE.Color(color);
   
    const fogGUIHelper = new FogGUIHelper(scene.fog);
    gui.add(fogGUIHelper, 'near', near, far).listen();
    gui.add(fogGUIHelper, 'far', near, far).listen();

    const moonFolder = gui.addFolder("Moon")
    moonFolder.add(effectController, 'elevation', 0, 90, 0.1 ).onChange( guiChanged );
    moonFolder.add(effectController, 'azimuth', -180, 180, 0.1 ).onChange( guiChanged );

    const rainFolder = gui.addFolder("Rain");
    rainFolder.add({'toggle': function() { camera.layers.toggle(1) }}, 'toggle');

    guiChanged();

}

function init() {

    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.layers.enable(0);
    // camera.layers.enable(1);
    scene = new THREE.Scene();

    let mainLight = new THREE.HemisphereLight(0xffffff, 0x70a4cc, 0.9);
    mainLight.layers.enable(0);
    mainLight.position.set(200, -50, -100);
    scene.add(mainLight);
    
    const shadowLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);
    shadowLight.layers.enable(0);
    shadowLight.position.set(0, 10, 0);
    shadowLight.target.position.set(-5, 0, 0);
    shadowLight.castShadow = true;
    scene.add(shadowLight);
    scene.add(shadowLight.target);
    

    const hillsMap = new THREE.CanvasTexture( new generateHillsTexture() );
    hillsMap.wrapS = THREE.RepeatWrapping;
    hillsMap.wrapT = THREE.RepeatWrapping;
    hillsMap.repeat.x = 10;
    hillsMap.repeat.y = 6;
    hillsMap.anisotropy = 16;

    let material = new THREE.MeshPhysicalMaterial( {
        clearcoat: 0.1,
        clearcoatRoughness: 1,
        metalness: 0.1,
        roughness: 1,
        color: 0x49a35d,
        normalMap: hillsMap,
        normalScale: new THREE.Vector2( 0.4, 0.4 )
      } );

    const data = generateHeight( worldWidth, worldDepth );  

    camera.position.set( 0, 500, 0 );
    camera.lookAt( 0, 530, - 100 );

    const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
      
    geometry.rotateX( - Math.PI / 2 );

    const vertices = geometry.attributes.position.array;
  
    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
      vertices[ j + 1 ] = data[ i ] * 8;
    }

    geometry.computeVertexNormals();
  
    let ground = new THREE.Mesh(geometry, material);
    ground.castShadow = true;
    ground.receiveShadow = true;
    ground.layers.set(0);
    
    scene.add(ground);
    initParticles();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;

    container.appendChild( renderer.domElement );

    controls = new FirstPersonControls( camera, renderer.domElement );
    controls.movementSpeed = 150;
    controls.lookSpeed = 0;

    initSky();

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

    const size = width * height, data = new Uint32Array( size );
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

    requestAnimationFrame(animate); 
    render();

}

function render() {


  
    controls.update( clock.getDelta() );

    const time = Date.now() * 0.00005;


    for ( let i = 0; i < scene.children.length; i ++ ) {

        const object = scene.children[ i ];

        if ( object instanceof THREE.Points ) {

            object.rotation.x = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

        }

    }

    renderer.render( scene, camera );

    requestAnimationFrame( render );
}