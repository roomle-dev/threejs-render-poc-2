import { SceneRenderer } from './scene-renderer';
import { WebGLRenderer } from 'three';
import { GUI } from 'dat.gui';

interface UiProperties {
  'enable path tracer': true;
}

export class SceneRendererWebGL extends SceneRenderer {
  private _uiProperties: UiProperties = { 'enable path tracer': true };
  private _webGlRenderer: WebGLRenderer;

  constructor(container: HTMLDivElement) {
    const webglRenderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    super(container, webglRenderer);
    this._webGlRenderer = webglRenderer;
  }

  public get effectsEnabled(): boolean {
    return (
      (this.renderEffects?.isValid ?? false) &&
      this._uiProperties['enable path tracer']
    );
  }

  public get showEnvironmentInBackground(): boolean {
    return true;
  }

  public get renderStatusMessage(): string {
    const effectsMessage = this.effectsEnabled
      ? this.renderEffects?.renderStatusMessage
      : '';
    return 'WebGLRenderer ' + effectsMessage;
  }

  public addUI(gui: GUI): void {
    gui
      .add(this._uiProperties, 'enable path tracer')
      .onChange(() => (this.effectsNeedUpdate = true));
    this.renderEffects?.addUI(gui);
  }
}
