import { SceneSourceModel } from '../roomle-threejs-loader/src/scene/scene-source';
import { SceneFactory, SceneObject } from './scene-factory';
import { Mesh, MeshStandardMaterial } from 'three/webgpu';
import { SceneCache } from '../roomle-threejs-loader/src/scene/scene-cache';

export class RoomleSceneFactory implements SceneFactory {
  private _sceneSource: SceneSourceModel;
  private _sceneCache: SceneCache;

  constructor(sceneSource: SceneSourceModel, sceneCache: SceneCache) {
    this._sceneSource = sceneSource;
    this._sceneCache = sceneCache;
  }

  async create(): Promise<SceneObject> {
    const sceneModel = await this._sceneCache.getOrLoadScene(this._sceneSource);
    sceneModel.sceneObject.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.material instanceof MeshStandardMaterial) {
          child.material.envMapIntensity = 1;
          child.material.needsUpdate = true;
        }
      }
    });
    return Promise.resolve({
      objects: [sceneModel.sceneObject],
      animations: [],
    });
  }
}
