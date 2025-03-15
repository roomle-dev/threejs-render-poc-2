import { SceneFactory, SceneObject } from './scene-factory';
import { Mesh, MeshStandardMaterial } from 'three/webgpu';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GlbSceneFactory implements SceneFactory {
  private _resource: string;
  private _gbLoader: GLTFLoader;

  constructor(resource: string, gbLoader: GLTFLoader) {
    this._resource = resource;
    this._gbLoader = gbLoader;
  }

  async create(): Promise<SceneObject> {
    const glb = await this._gbLoader.loadAsync(this._resource);
    glb.scene.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.material instanceof MeshStandardMaterial) {
          child.material.envMapIntensity = 1;
          child.material.needsUpdate = true;
        }
      }
    });
    return Promise.resolve({ objects: [glb.scene], animations: [] });
  }
}
