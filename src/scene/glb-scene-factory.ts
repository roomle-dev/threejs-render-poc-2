import { SceneFactory, SceneObject } from './scene-factory';
import { Mesh, MeshStandardMaterial } from 'three/webgpu';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GlbSceneFactory implements SceneFactory {
  private _resource: string;
  private _glbLoader: GLTFLoader;

  constructor(resource: string, glbLoader: GLTFLoader) {
    this._resource = resource;
    this._glbLoader = glbLoader;
  }

  async create(): Promise<SceneObject> {
    const glb = await this._glbLoader.loadAsync(this._resource);
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
