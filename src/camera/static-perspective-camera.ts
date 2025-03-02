import { CameraControl } from './camera-control';
import { Camera, PerspectiveCamera } from 'three';

export class StaticPerspectiveCamera implements CameraControl {
  private cameraObject: PerspectiveCamera;

  constructor(aspect: number) {
    this.cameraObject = new PerspectiveCamera(75, aspect, 0.1, 10);
    this.camera.position.z = 3;
  }

  get camera(): Camera {
    return this.cameraObject;
  }

  public setSizes(width: number, height: number): void {
    this.cameraObject.aspect = width / height;
    this.cameraObject.updateProjectionMatrix();
  }

  public update(): void {
    // nothing to do
  }
}
