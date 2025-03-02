import { CameraControl } from './camera-control';
import { Camera } from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraOrbitControls implements CameraControl {
  private _baseCamera: CameraControl;
  private _orbitControls: OrbitControls;

  constructor(baseCamera: CameraControl, domElement: HTMLElement) {
    this._baseCamera = baseCamera;
    this._orbitControls = new OrbitControls(
      this._baseCamera.camera,
      domElement
    );
  }

  get camera(): Camera {
    return this._baseCamera.camera;
  }

  public setSizes(width: number, height: number): void {
    this._baseCamera.setSizes(width, height);
  }

  public update(): void {
    this._orbitControls.update();
  }
}
