import { SceneServer } from './scene-server';
import { Mesh, MeshStandardMaterial, Object3D } from 'three/webgpu';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GlbSceneServer implements SceneServer {
  private _resource: string;
  private _gbLoader: GLTFLoader;

  constructor(resource: string, gbLoader: GLTFLoader) {
    this._resource = resource;
    this._gbLoader = gbLoader;
  }

  async create(): Promise<Object3D[]> {
    const glb = await this._gbLoader.loadAsync(this._resource);
    glb.scene.traverse((child) => {
      if (child instanceof Mesh) {
        if (child.material instanceof MeshStandardMaterial) {
          child.material.envMapIntensity = 1;
          child.material.needsUpdate = true;
        }
      }
    });
    return Promise.resolve([glb.scene]);
  }

  public animate(_deltaTimeInMs: number): void {
    // nothing to do
  }
}
