import { TextureLoader, RepeatWrapping } from 'three';

import {
    moonColorImg,
    moonDisplacementImg,
    moonDiffImg,
    moonNormImg
} from './images'

const moonColorTex = new TextureLoader().load(moonColorImg);
const moonDisplacementTex = new TextureLoader().load(moonDisplacementImg);
const moonDiffTex = new TextureLoader().load(moonDiffImg);
const moonNormTex = new TextureLoader().load(moonNormImg);

moonColorTex.wrapS = RepeatWrapping
moonColorTex.wrapT = RepeatWrapping

moonDisplacementTex.wrapS = RepeatWrapping
moonDisplacementTex.wrapT = RepeatWrapping

moonDiffTex.wrapS = RepeatWrapping
moonDiffTex.wrapT = RepeatWrapping

moonNormTex.wrapS = RepeatWrapping
moonNormTex.wrapT = RepeatWrapping

export {
    moonColorTex,
    moonDisplacementTex,
    moonDiffTex,
    moonNormTex
}