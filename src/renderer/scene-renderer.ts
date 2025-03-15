import { LightFactory } from '@/scene/light-factory';
import { SceneHelperFactory } from '@/scene/scene-helper-factory';
import { SceneFactory, SceneObject } from '@/scene/scene-factory';
import { RenderEffects } from './render-effects';
import { Camera, Scene, Texture } from 'three/webgpu';
import { GUI } from 'dat.gui';

export interface SceneRenderer {
  get domElement(): HTMLElement;
  get renderStatusMessage(): string;
  get scene(): Scene;
  set sceneHasChanged(value: boolean);
  dispose(): void;
  setSize(width: number, height: number): void;
  createNewScene(SceneFactory: SceneFactory): Promise<SceneObject>;
  setEnvironmentMap(equirectTexture: Texture): void;
  addLights(LightFactory: LightFactory): Promise<void>;
  addHelper(SceneHelperFactory: SceneHelperFactory): Promise<void>;
  addEffects(renderEffects: RenderEffects): void;
  cameraHasChanged(): void;
  render(camera: Camera): Promise<void>;
  addUI(gui: GUI): void;
}
