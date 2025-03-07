import { Camera, Renderer, Scene } from 'three/webgpu';
import { GUI } from 'dat.gui';

export interface RenderEffects {
  dispose(): void;
  initialize(renderer: Renderer, scene: Scene, camera: Camera): void;
  renderAsync(): Promise<void>;
  addUI(gui: GUI): void;
}
