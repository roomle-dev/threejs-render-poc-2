import { Object3D } from 'three/webgpu';

export interface AnimationServer {
  animate(object: Object3D, deltaTimeInMs: number): void;
}
