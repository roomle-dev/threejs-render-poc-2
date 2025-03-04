import { SceneServer } from './scene-server';
import { Mesh, MeshStandardMaterial, Object3D } from 'three/webgpu';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class GlbSceneServer implements SceneServer {
  private resource: string;
  public gltfLoader = new GLTFLoader();
  //public dracoLoader = new DRACOLoader();

  constructor(resource: string) {
    this.resource = resource;
    //dracoLoader.setDecoderPath('./draco/');
    //dracoLoader.setDecoderConfig({ type: 'js' });
  }

  async create(): Promise<Object3D[]> {
    const glb = await this.gltfLoader.loadAsync(this.resource);
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
