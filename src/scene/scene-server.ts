import { Object3D } from 'three';

export interface SceneServer {
  create(): Promise<Object3D>;
}
