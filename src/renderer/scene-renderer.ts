import { LightServer } from '@/scene/light-server';
import { SceneHelperServer } from '@/scene/scene-helper-server';
import { SceneServer } from '@/scene/scene-server';
import { Camera, Object3D, Scene } from 'three';

export interface SceneRenderer {
  get domElement(): HTMLElement;
  get scene(): Scene;
  setSize(width: number, height: number): void;
  createNewScene(sceneServer: SceneServer): Promise<Object3D[]>;
  addLights(lightServer: LightServer): Promise<void>;
  addHelper(sceneHelperServer: SceneHelperServer): Promise<void>;
  render(camera: Camera): void;
}
