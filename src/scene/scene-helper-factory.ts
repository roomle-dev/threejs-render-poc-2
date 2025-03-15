import { Object3D } from 'three/webgpu';

export interface SceneHelperFactory {
  create(): Promise<Object3D[]>;
}
