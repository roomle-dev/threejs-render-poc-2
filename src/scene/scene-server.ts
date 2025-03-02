import { Object3D } from 'three/webgpu';

export interface SceneServer {
  create(): Promise<Object3D[]>;
}
