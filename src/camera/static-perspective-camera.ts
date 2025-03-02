import { CameraControl } from './camera-control';
import { Camera, PerspectiveCamera } from 'three/webgpu';

export class StaticPerspectiveCamera implements CameraControl {
  private _camera: PerspectiveCamera;

  constructor(aspect: number) {
    this._camera = new PerspectiveCamera(75, aspect, 0.1, 20);
    this._camera.position.set(0, 3, 5);
  }

  get camera(): Camera {
    return this._camera;
  }

  public setSizes(width: number, height: number): void {
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  }

  public update(): void {
    // nothing to do
  }
}
