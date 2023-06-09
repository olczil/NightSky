import * as THREE from 'three'
import React, { Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sky, Cloud, OrbitControls, Stars, PerspectiveCamera, Sphere } from "@react-three/drei"
import Grass from "./components/Grass"
import { useControls } from 'leva'
import { moonDisplacementTex } from './images/textures'
import { moonColorTex } from './images/textures'
import { moonDiffTex } from './images/textures'
import { moonNormTex } from './images/textures'
import { AccumulativeShadows, RandomizedLight, Center, Environment } from '@react-three/drei'


export default function App() {
  return (
    <Canvas camera={{ position: [-10, 35, 40], fov: 45 }}>
      {/* <ambientLight /> */}
      {/* <pointLight position={[10, 10, 10]} /> */}
      <Suspense fallback={null}>
        <Grass position={[0, -5, 0]} /> 
        {/* <Clouds /> */}
        <Stars />
        <Sky mieCoefficient={0.8} azimuth={1} inclination={0.1} distance={1000} />
        <mesh>
        <Sphere position={[0, 45, -90]}>
          <sphereGeometry args={[4, 32, 32]} />
          <meshNormalMaterial emissive={1} normalMap={moonNormTex} displacementMap={moonDisplacementTex} color={'white'}/>
      </Sphere>
      </mesh>
      </Suspense>
      <OrbitControls enableZoom={false} maxAzimuthAngle={0} minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
    </Canvas>
  )
}

function Clouds() {
  return (
    <group>
      <Cloud depthTest={true} position={[-10, 0, -10]} speed={0.2} opacity={0.4} />
      <Cloud depthTest={true} position={[10, 6, -15]} speed={0.2} opacity={1} />
      <Cloud depthTest={true} position={[0, 0, 0]} speed={0.2} opacity={0.2} />
      <Cloud depthTest={true} position={[0, 0, 0]} speed={0.2} opacity={0.2} />
      <Cloud depthTest={true} position={[-10, 6, 15]} speed={0.2} opacity={0.8} />
      <Cloud depthTest={true} position={[10, 0, 10]} speed={0.2} opacity={0.25} />
      <Cloud depthTest={true} position={[-20, 6, -10]} speed={0.2} opacity={0.6} />
      <Cloud depthTest={true} position={[-30, 0, 15]} speed={0.2} opacity={0.4} />
      <Cloud depthTest={true} position={[-40, 0, -10]} speed={0.2} opacity={0.4} />
      <Cloud depthTest={true} position={[-50, 6, -15]} speed={0.2} opacity={0.8} />
      <Cloud depthTest={true} position={[-60, 2, 10]} speed={0.2} opacity={0.1} />
      <Cloud depthTest={true} position={[-70, -2, 20]} speed={0.2} opacity={0.9} />
      <Cloud depthTest={true} position={[-80, 2, 10]} speed={0.2} opacity={0.4} />
      <Cloud depthTest={true} position={[-90, 0, -5]} speed={0.2} opacity={0.4} />
      <Cloud depthTest={true} position={[20, 6, -10]} speed={0.2} opacity={1} />
      <Cloud depthTest={true} position={[30, 2, 15]} speed={0.2} opacity={0.4} />
      <Cloud depthTest={true} position={[40, 0, -10]} speed={0.2} opacity={0.4} />
      <Cloud depthTest={true} position={[50, 6, -15]} speed={0.2} opacity={0.8} />
      <Cloud depthTest={true} position={[60, 2, 10]} speed={0.2} opacity={0.4} />
      <Cloud depthTest={true} position={[70, -2, 20]} speed={0.2} opacity={0.6} />
      <Cloud depthTest={true} position={[80, 2, 10]} speed={0.2} opacity={0.4} />
      <Cloud depthTest={true} position={[90, 0, -5]} speed={0.2} opacity={0.6} />
    </group>
  )
}

function Moon() {
  return (
    <Sphere>
      
    </Sphere>
  )
}