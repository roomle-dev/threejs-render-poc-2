import { Object3D } from 'three/webgpu';

export interface SceneHelperServer {
  create(): Promise<Object3D[]>;
}
