import { SceneServer } from './scene-server';
import { BoxGeometry, Mesh, MeshPhysicalMaterial, Object3D } from 'three';

export class CubeSceneServer implements SceneServer {
  async create(): Promise<Object3D[]> {
    const geometry = new BoxGeometry();
    const material = new MeshPhysicalMaterial({ color: 0xff80c0 });
    const cube = new Mesh(geometry, material);
    return Promise.resolve([cube]);
  }
}
