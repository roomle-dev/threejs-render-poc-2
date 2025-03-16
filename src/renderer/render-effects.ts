import { WebGLRenderer } from 'three';
import { Camera, Renderer, Scene } from 'three/webgpu';
import { GUI } from 'dat.gui';

export interface RenderEffects {
  get isValid(): boolean;
  get renderStatusMessage(): string;
  dispose(): void;
  initialize(
    renderer: Renderer | WebGLRenderer,
    scene: Scene,
    camera: Camera
  ): void;
  updateScene(
    renderer: Renderer | WebGLRenderer,
    scene: Scene,
    camera: Camera
  ): void;
  updateEnvironment(
    renderer: Renderer | WebGLRenderer,
    scene: Scene,
    camera: Camera
  ): void;
  updateCamera(
    renderer: Renderer | WebGLRenderer,
    scene: Scene,
    camera: Camera
  ): void;
  updateLights(
    renderer: Renderer | WebGLRenderer,
    scene: Scene,
    camera: Camera,
    enabled: boolean
  ): void;
  renderAsync(): Promise<void>;
  addUI(gui: GUI): void;
}
