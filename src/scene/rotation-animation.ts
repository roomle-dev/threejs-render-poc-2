import { AnimationNode } from './animation-node';
import { Object3D } from 'three';

export class RotationAnimation implements AnimationNode {
  public animate(object: Object3D, deltaTimeInMs: number): void {
    object.rotation.x += (deltaTimeInMs / 1000) * Math.PI;
    object.rotation.y += (deltaTimeInMs / 1000) * (Math.PI / 2);
  }
}
