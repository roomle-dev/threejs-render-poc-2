import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CubeSceneServer } from './cube-scene-server';
import { GlbSceneServer } from './glb-scene-server';
import { AnimationServer } from './roation-animation-server';
import { RotationAnimation } from './rotation-animation';
import { SceneServer } from './scene-server';
import { ShadowModifierServer } from './shadow-modifier-server';
import { ShadowPlaneSceneServer } from './shadow-plane-scene-server';

export interface SceneServerObjects {
  sceneServer: SceneServer;
  animationServer: AnimationServer[];
}

export const rotatingCubeServer = (sceneType: string): SceneServerObjects => {
  const baseObjectServer = new ShadowModifierServer(new CubeSceneServer());
  const animationServer: AnimationServer | null = new AnimationServer(
    baseObjectServer,
    new RotationAnimation()
  );
  const sceneServer = new ShadowPlaneSceneServer(animationServer, {
    usePhysicalMaterial: sceneType !== 'webgl',
  });
  return { sceneServer, animationServer: [animationServer] };
};

export const glbServer = (
  sceneType: string,
  resource: string,
  gbLoader: GLTFLoader
): SceneServerObjects => {
  const sceneServer = new ShadowPlaneSceneServer(
    new ShadowModifierServer(new GlbSceneServer(resource, gbLoader)),
    {
      usePhysicalMaterial: true,
    }
  );
  return { sceneServer, animationServer: [] };
};
