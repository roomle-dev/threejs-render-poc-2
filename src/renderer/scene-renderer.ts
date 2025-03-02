import { SceneServer } from '@/scene/scene-server';
import { Camera, Object3D } from 'three';

export interface SceneRenderer {
  get domElement(): HTMLElement;
  setSize(width: number, height: number): void;
  createNewScene(sceneServer: SceneServer): Promise<Object3D>;
  render(camera: Camera): void;
}
