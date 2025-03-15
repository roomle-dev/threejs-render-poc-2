import { Object3D } from 'three/webgpu';
import { AnimationServer } from './animation-server';

export class RotationAnimationServer implements AnimationServer {
  public animate(object: Object3D, deltaTimeInMs: number): void {
    object.rotation.x += (deltaTimeInMs / 1000) * Math.PI;
    object.rotation.y += (deltaTimeInMs / 1000) * (Math.PI / 2);
  }
}
