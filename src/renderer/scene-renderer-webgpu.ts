import { SceneRenderer } from './scene-renderer';
import { WebGPURenderer } from 'three/webgpu';
import { GUI } from 'dat.gui';

export interface SceneRendererWebGPUParameters {
  forceWebGL?: boolean;
}

interface BackendType {
  isWebGPUBackend?: boolean;
  isWebGLBackend?: boolean;
}

interface UiProperties {
  'enable effects': boolean;
  'environment background': boolean;
}

export class SceneRendererWebGPU extends SceneRenderer {
  private _uiProperties: UiProperties = {
    'enable effects': true,
    'environment background': false,
  };
  private _webGpuRenderer: WebGPURenderer;

  constructor(
    container: HTMLDivElement,
    parameters: SceneRendererWebGPUParameters = {}
  ) {
    const webGpuRenderer = new WebGPURenderer({
      antialias: true,
      alpha: true,
      forceWebGL: parameters.forceWebGL ?? false,
    });
    super(container, webGpuRenderer);
    this._webGpuRenderer = webGpuRenderer;
  }

  public get effectsEnabled(): boolean {
    return (
      (this.renderEffects?.isValid ?? false) &&
      this._uiProperties['enable effects']
    );
  }

  public get showEnvironmentInBackground(): boolean {
    return this._uiProperties['environment background'];
  }

  public get renderStatusMessage(): string {
    const effectsMessage = this.effectsEnabled
      ? this.renderEffects?.renderStatusMessage
      : '';
    return (
      'WebGPURenderer' +
      ((this._webGpuRenderer.backend as BackendType).isWebGPUBackend
        ? ' (WebGPU)'
        : ' (WebGL)') +
      ' ' +
      effectsMessage
    );
  }

  public addUI(gui: GUI): void {
    gui
      .add(this._uiProperties, 'enable effects')
      .onChange(() => (this.effectsNeedUpdate = true));
    gui
      .add(this._uiProperties, 'environment background')
      .onChange(() => (this.environmentHasChanged = true));
    this.renderEffects?.addUI(gui);
  }
}
