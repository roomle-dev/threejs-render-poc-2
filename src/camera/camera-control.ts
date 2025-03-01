import { Camera } from 'three';

export interface CameraControl {
  get camera(): Camera;
  setSizes(width: number, height: number): void;
}
