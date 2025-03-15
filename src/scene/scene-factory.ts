import { Object3D } from 'three/webgpu';

export interface SceneFactory {
  create(): Promise<Object3D[]>;
}
