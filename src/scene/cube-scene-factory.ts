import { SceneFactory } from './scene-factory';
import {
  BoxGeometry,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
} from 'three/webgpu';

export class CubeSceneFactory implements SceneFactory {
  async create(): Promise<Object3D[]> {
    const geometry = new BoxGeometry();
    const materials = [
      new MeshPhysicalMaterial({ color: 0xff0000 }), // Red
      new MeshPhysicalMaterial({ color: 0x00ff00 }), // Green
      new MeshPhysicalMaterial({ color: 0x0000ff }), // Blue
      new MeshPhysicalMaterial({ color: 0xffff00 }), // Yellow
      new MeshPhysicalMaterial({ color: 0xff8000 }), // Orange
      new MeshPhysicalMaterial({ color: 0xff00ff }), // Magenta
    ];
    const cube = new Mesh(geometry, materials);
    cube.position.y = 1.5;
    return Promise.resolve([cube]);
  }

  public animate(_deltaTimeInMs: number): void {
    // nothing to do
  }
}
