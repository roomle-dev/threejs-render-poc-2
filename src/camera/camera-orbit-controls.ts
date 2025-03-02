import { CameraControl } from './camera-control';
import { Camera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class CameraOrbitControls implements CameraControl {
  private baseCamera: CameraControl;
  private orbitControls: OrbitControls;

  constructor(baseCamera: CameraControl, domElement: HTMLElement) {
    this.baseCamera = baseCamera;
    this.orbitControls = new OrbitControls(this.baseCamera.camera, domElement);
  }

  get camera(): Camera {
    return this.baseCamera.camera;
  }

  public setSizes(width: number, height: number): void {
    this.baseCamera.setSizes(width, height);
  }

  public update(): void {
    this.orbitControls.update();
  }
}
