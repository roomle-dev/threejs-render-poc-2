import { CameraControl } from './camera-control';
import { Camera, MathUtils } from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class CameraOrbitControls implements CameraControl {
  private _baseCamera: CameraControl;
  private _orbitControls: OrbitControls;
  private _onCameraChangedCallbacks: (() => void)[] = [];

  constructor(baseCamera: CameraControl, domElement: HTMLElement) {
    this._baseCamera = baseCamera;
    this._orbitControls = new OrbitControls(
      this._baseCamera.camera,
      domElement
    );
    this._orbitControls.minPolarAngle = MathUtils.degToRad(0);
    this._orbitControls.maxPolarAngle = MathUtils.degToRad(90);
    this._orbitControls.addEventListener('change', () => {
      this._onCameraChangedCallbacks.forEach((callback) => callback());
    });
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

  public addCameraChangedListener(callback: () => void): void {
    this._onCameraChangedCallbacks.push(callback);
  }
}
