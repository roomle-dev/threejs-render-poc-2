import { Camera, Renderer, Scene } from 'three/webgpu';
import { RenderEffects } from './render-effects';
import { GUI } from 'dat.gui';

export class WebGLPathTracer implements RenderEffects {
  get isValid(): boolean {
    return false;
  }

  public dispose(): void {
    // ...
  }

  public initialize(_renderer: Renderer, _scene: Scene, _camera: Camera): void {
    // ...
  }

  public updateScene(
    _renderer: Renderer,
    _scene: Scene,
    _camera: Camera
  ): void {
    // ...
  }

  public updateCamera(
    _renderer: Renderer,
    _scene: Scene,
    _camera: Camera
  ): void {
    // ...
  }

  public async renderAsync(): Promise<void> {
    return Promise.resolve();
  }

  public addUI(_gui: GUI): void {
    // ...
  }
}
