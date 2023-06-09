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


function Moon() {
  return (
    <Sphere args={[6, 32, 32]}>
      <meshBasicMaterial color={"#2fe4fc"} />
    </Sphere>
  )
}

function ThreeScene() {
  return (
    <Canvas>
      <ambientLight />
      <OrbitControls />
      <Moon />
    </Canvas>
  )
}


export default function App() {
  return (
    <ThreeScene />
  )
}

