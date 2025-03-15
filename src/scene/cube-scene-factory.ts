import { SceneFactory, SceneObject } from './scene-factory';
import { BoxGeometry, Mesh, MeshPhysicalMaterial } from 'three/webgpu';

export class CubeSceneFactory implements SceneFactory {
  async create(): Promise<SceneObject> {
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
    return Promise.resolve({ objects: [cube], animations: [] });
  }
}
