import { Object3D } from 'three';

export interface AnimationNode {
  animate(object: Object3D, deltaTimeInMs: number): void;
}
