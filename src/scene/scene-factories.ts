import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CubeSceneFactory } from './cube-scene-factory';
import { GlbSceneFactory } from './glb-scene-factory';
import { AnimationServerFactory } from './roation-animation-factory';
import { RotationAnimation } from './rotation-animation';
import { SceneFactory } from './scene-factory';
import { ShadowModifierFactory } from './shadow-modifier-factory';
import { ShadowPlaneSceneFactory } from './shadow-plane-scene-factory';
import { AnimationServer } from './animation-server';

export interface SceneFactoryObjects {
  SceneFactory: SceneFactory;
  animationServer: AnimationServer[];
}

export const rotatingCubeFactory = (
  _sceneType: string
): SceneFactoryObjects => {
  const baseObjectServer = new ShadowModifierFactory(new CubeSceneFactory());
  const animationServer = new AnimationServerFactory(
    baseObjectServer,
    new RotationAnimation()
  );
  const SceneFactory = new ShadowPlaneSceneFactory(animationServer, {
    usePhysicalMaterial: true,
  });
  return { SceneFactory, animationServer: [animationServer] };
};

export const glbSceneFactory = (
  sceneType: string,
  resource: string,
  gbLoader: GLTFLoader
): SceneFactoryObjects => {
  const SceneFactory = new ShadowPlaneSceneFactory(
    new ShadowModifierFactory(new GlbSceneFactory(resource, gbLoader)),
    {
      usePhysicalMaterial: true,
    }
  );
  return { SceneFactory, animationServer: [] };
};
