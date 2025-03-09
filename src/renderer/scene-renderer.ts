import { LightServer } from '@/scene/light-server';
import { SceneHelperServer } from '@/scene/scene-helper-server';
import { SceneServer } from '@/scene/scene-server';
import { RenderEffects } from './render-effects';
import { Camera, Object3D, Scene, Texture } from 'three/webgpu';
import { GUI } from 'dat.gui';

export interface SceneRenderer {
  get domElement(): HTMLElement;
  get renderStatusMessage(): string;
  get scene(): Scene;
  dispose(): void;
  setSize(width: number, height: number): void;
  createNewScene(sceneServer: SceneServer): Promise<Object3D[]>;
  setEnvironmentMap(equirectTexture: Texture): void;
  addLights(lightServer: LightServer): Promise<void>;
  addHelper(sceneHelperServer: SceneHelperServer): Promise<void>;
  addEffects(renderEffects: RenderEffects): void;
  cameraHasChanged(): void;
  render(camera: Camera): Promise<void>;
  addUI(gui: GUI): void;
}
