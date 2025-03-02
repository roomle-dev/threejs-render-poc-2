import { Camera } from 'three/webgpu';

export interface CameraControl {
  get camera(): Camera;
  setSizes(width: number, height: number): void;
  update(): void;
}
