import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CubeSceneFactory } from './cube-scene-factory';
import { GlbSceneFactory } from './glb-scene-factory';
import { AnimationServerFactory } from './roation-animation-factory';
import { RotationAnimationServer } from './rotation-animation';
import { SceneFactory } from './scene-factory';
import { ShadowModifierFactory } from './shadow-modifier-factory';
import { ShadowPlaneSceneFactory } from './shadow-plane-scene-factory';

export const rotatingCubeFactory = (_sceneType: string): SceneFactory => {
  const sceneFactory = new ShadowPlaneSceneFactory(
    new AnimationServerFactory(
      new ShadowModifierFactory(new CubeSceneFactory()),
      new RotationAnimationServer()
    ),
    {
      usePhysicalMaterial: true,
    }
  );
  return sceneFactory;
};

export const glbSceneFactory = (
  sceneType: string,
  resource: string,
  gbLoader: GLTFLoader
): SceneFactory => {
  const sceneFactory = new ShadowPlaneSceneFactory(
    new ShadowModifierFactory(new GlbSceneFactory(resource, gbLoader)),
    {
      usePhysicalMaterial: true,
      useNodeMaterial: sceneType === 'webgpu',
    }
  );
  return sceneFactory;
};
