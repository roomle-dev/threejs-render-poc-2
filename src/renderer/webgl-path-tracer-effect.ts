import { Camera, Scene } from 'three/webgpu';
import { RenderEffects } from './render-effects';
import { WebGLPathTracer } from 'three-gpu-pathtracer';
import { GUI } from 'dat.gui';
import { WebGLRenderer } from 'three';

interface UiProperties {
  toneMapping: boolean;
  pause: boolean;
  tiles: number;
  transparentBackground: boolean;
  resolutionScale: number;
}

// https://github.com/mrdoob/three.js/blob/dev/examples/webgl_renderer_pathtracer.html
export class WebGLPathTracerEffect implements RenderEffects {
  private _pathTracer?: WebGLPathTracer;
  private _uiProperties: UiProperties = {
    toneMapping: true,
    pause: false,
    tiles: 3,
    transparentBackground: false,
    resolutionScale: 1,
  };

  get isValid(): boolean {
    return true;
  }

  public dispose(): void {
    this._pathTracer?.dispose();
  }

  public initialize(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera
  ): void {
    this._pathTracer = new WebGLPathTracer(renderer);
    this._pathTracer.filterGlossyFactor = 1;
    this._pathTracer.minSamples = 3;
    this._pathTracer.renderScale = this._uiProperties.resolutionScale;
    this._pathTracer.tiles.set(
      this._uiProperties.tiles,
      this._uiProperties.tiles
    );
    this._pathTracer.setScene(scene, camera);
  }

  public updateScene(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera
  ): void {
    if (!this._pathTracer) {
      this.initialize(renderer, scene, camera);
    }
    if (this._pathTracer) {
      this._pathTracer.setScene(scene, camera);
    }
  }

  public updateCamera(
    _renderer: WebGLRenderer,
    _scene: Scene,
    _camera: Camera
  ): void {
    this._pathTracer?.updateCamera();
  }

  public async renderAsync(): Promise<void> {
    if (!this._pathTracer) {
      return Promise.resolve();
    }
    this._pathTracer.enablePathTracing = true;
    this._pathTracer.pausePathTracing = false;
    this._pathTracer.renderSample();
    return Promise.resolve();
  }

  public addUI(_gui: GUI): void {
    // ...
  }
}
