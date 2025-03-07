import { Camera, Renderer, Scene } from 'three/webgpu';

export interface RenderEffects {
  dispose(): void;
  initialize(renderer: Renderer, scene: Scene, camera: Camera): void;
  renderAsync(): Promise<void>;
}
