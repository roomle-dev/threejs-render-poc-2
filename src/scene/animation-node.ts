import { Object3D } from 'three/webgpu';

export interface AnimationNode {
  animate(object: Object3D, deltaTimeInMs: number): void;
}
