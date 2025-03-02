import { Object3D } from 'three';

export interface SceneHelperServer {
  create(): Promise<Object3D[]>;
}
