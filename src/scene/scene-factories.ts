import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CubeSceneFactory } from './cube-scene-factory';
import { GlbSceneFactory } from './glb-scene-factory';
import { AnimationServerFactory } from './roation-animation-factory';
import { RotationAnimationServer } from './rotation-animation';
import { SceneFactory } from './scene-factory';
import { ShadowModifierFactory } from './shadow-modifier-factory';
import { ShadowPlaneSceneFactory } from './shadow-plane-scene-factory';
import { RoomleSceneFactory } from './roomle-scene-factory';
import {
  SCENE_TYPE,
  SceneCache,
  SceneType,
} from '../roomle-threejs-loader/src/scene/scene-cache';
import { SceneSourceModel } from '../roomle-threejs-loader/src/scene/scene-source';

export const getNameFromResourceName = (id: string): string => {
  const extensions = ['glb', 'gltf', 'hdr', 'exr'];
  let lastIndex = -1;
  for (const extension of extensions) {
    lastIndex = id.lastIndexOf('.' + extension);
    if (lastIndex !== -1) {
      break;
    }
  }
  const name = id.substring(0, lastIndex);
  const parts = name.split('/');
  return `${parts[parts.length - 1]}`;
};

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

export const roomleSceneFactory = (
  sceneType: string,
  resource: string,
  sceneCache: SceneCache
): SceneFactory => {
  let type: SceneType = SCENE_TYPE.PLAN;
  let name = resource;
  if (resource.includes('.glb')) {
    type = SCENE_TYPE.GLB;
    name = getNameFromResourceName(resource);
  } else if (resource.startsWith('ps_') || resource.indexOf(':') === -1) {
    type = SCENE_TYPE.PLAN;
    name = `PLAN ${resource}`;
  } else {
    type = SCENE_TYPE.CONFIGURATION;
    const p = resource.split('@');
    const id = p[p.length - 1];
    const names = id.split(':');
    name = names.length > 1 ? `${names[0]} ${names[1]}` : names[0];
  }
  const sceneSource: SceneSourceModel = {
    type,
    name,
    id: resource,
  };
  const sceneFactory = new ShadowPlaneSceneFactory(
    new ShadowModifierFactory(new RoomleSceneFactory(sceneSource, sceneCache)),
    {
      usePhysicalMaterial: true,
      useNodeMaterial: sceneType === 'webgpu',
    }
  );
  return sceneFactory;
};
