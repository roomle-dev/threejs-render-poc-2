import { Camera, Scene } from 'three/webgpu';
import { RenderEffects } from './render-effects';
import { WebGLPathTracer } from 'three-gpu-pathtracer';
import { GUI } from 'dat.gui';
import { WebGLRenderer } from 'three';

interface UiProperties {
  enable: boolean;
  pause: boolean;
  tiles: number;
  filterGlossyFactor: number;
  minSamples: number;
  resolutionScale: number;
}

// https://github.com/mrdoob/three.js/blob/dev/examples/webgl_renderer_pathtracer.html
export class WebGLPathTracerEffect implements RenderEffects {
  private _pathTracer?: WebGLPathTracer;
  private _uiProperties: UiProperties = {
    enable: true,
    pause: false,
    tiles: 3,
    filterGlossyFactor: 1,
    resolutionScale: 1,
    minSamples: 3,
  };

  get isValid(): boolean {
    return true;
  }

  get renderStatusMessage(): string {
    return this._pathTracer
      ? `WebGL Path Tracer samples ${Math.floor(this._pathTracer.samples)}`
      : '#';
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
    this._pathTracer.filterGlossyFactor = this._uiProperties.filterGlossyFactor;
    this._pathTracer.minSamples = this._uiProperties.minSamples;
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

  public updateEnvironment(
    _renderer: WebGLRenderer,
    _scene: Scene,
    _camera: Camera
  ): void {
    this._pathTracer?.updateEnvironment();
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
    this._pathTracer.enablePathTracing = this._uiProperties.enable;
    this._pathTracer.pausePathTracing = this._uiProperties.pause;
    this._pathTracer.renderSample();
    return Promise.resolve();
  }

  public addUI(gui: GUI): void {
    const pathTracerFolder = gui.addFolder('path tracer');
    pathTracerFolder.add(this._uiProperties, 'enable');
    pathTracerFolder.add(this._uiProperties, 'pause');
    pathTracerFolder
      .add(this._uiProperties, 'tiles', 1, 10, 1)
      .onChange((value) => {
        this._pathTracer?.tiles.set(value, value);
      });
    pathTracerFolder
      .add(this._uiProperties, 'filterGlossyFactor', 0, 10, 0.1)
      .onChange((value) => {
        if (this._pathTracer) {
          this._pathTracer.filterGlossyFactor = value;
        }
      });
    pathTracerFolder
      .add(this._uiProperties, 'resolutionScale', 0.1, 1, 0.1)
      .onChange((value) => {
        if (this._pathTracer) {
          this._pathTracer.renderScale = value;
        }
      });
  }
}
