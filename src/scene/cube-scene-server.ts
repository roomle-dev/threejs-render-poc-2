import { SceneServer } from './scene-server';
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D } from 'three';

export class CubeSceneServer implements SceneServer {
  async create(): Promise<Object3D> {
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: 0xff0000 });
    const cube = new Mesh(geometry, material);
    return cube;
  }
}
