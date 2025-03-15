import { LightFactory } from '@/scene/light-factory';
import { SceneFactory, SceneObject } from '@/scene/scene-factory';
import { SceneRenderer } from './scene-renderer';
import { SceneHelperFactory } from '@/scene/scene-helper-factory';
import { RenderEffects } from './render-effects';
import {
  Camera,
  NeutralToneMapping,
  Scene,
  Texture,
  WebGPURenderer,
} from 'three/webgpu';
import { GUI } from 'dat.gui';

export interface SceneRendererWebGPUParameters {
  forceWebGL?: boolean;
}

interface BackendType {
  isWebGPUBackend?: boolean;
  isWebGLBackend?: boolean;
}

interface UiProperties {
  'enable effects': true;
}

export class SceneRendererWebGPU implements SceneRenderer {
  private _renderer: WebGPURenderer;
  private _scene: Scene;
  private _sceneObject: SceneObject | null = null;
  private _renderEffects?: RenderEffects;
  private _effectsNeedUpdate: boolean = false;
  private _cameraHasChanged: boolean = false;
  private _uiProperties: UiProperties = { 'enable effects': true };

  constructor(
    container: HTMLDivElement,
    parameters: SceneRendererWebGPUParameters = {}
  ) {
    this._renderer = new WebGPURenderer({
      antialias: true,
      alpha: true,
      forceWebGL: parameters.forceWebGL ?? false,
    });
    this._renderer.toneMapping = NeutralToneMapping;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this._renderer.domElement);
    this._renderer.shadowMap.enabled = true;
    this._scene = new Scene();
  }

  public get domElement(): HTMLElement {
    return this._renderer.domElement;
  }

  public get effectsEnabled(): boolean {
    return (
      (this._renderEffects?.isValid ?? false) &&
      this._uiProperties['enable effects']
    );
  }

  public get renderStatusMessage(): string {
    const effectsMessage = this.effectsEnabled
      ? this._renderEffects?.renderStatusMessage
      : '';
    return (
      'WebGPURenderer' +
      ((this._renderer.backend as BackendType).isWebGPUBackend
        ? ' (WebGPU)'
        : ' (WebGL)') +
      ' ' +
      effectsMessage
    );
  }

  public get scene(): Scene {
    return this._scene;
  }

  set sceneHasChanged(value: boolean) {
    if (value) {
      this._effectsNeedUpdate = true;
    }
  }

  public dispose(): void {
    this._renderer.dispose();
    this._renderEffects?.dispose();
  }

  public setSize(width: number, height: number): void {
    this._renderer.setSize(width, height);
    this._effectsNeedUpdate = true;
  }

  public async createNewScene(
    SceneFactory: SceneFactory
  ): Promise<SceneObject> {
    const sceneObject = await SceneFactory.create();
    for (const oldObject of this._sceneObject?.objects ?? []) {
      this._scene.remove(oldObject);
    }
    this._sceneObject = sceneObject;
    for (const newObject of sceneObject.objects) {
      this._scene.add(newObject);
    }
    this._effectsNeedUpdate = true;
    return sceneObject;
  }

  public setEnvironmentMap(equirectTexture: Texture): void {
    this._scene.background = equirectTexture;
    this._scene.environment = equirectTexture;
    this._effectsNeedUpdate = true;
  }

  public async addLights(LightFactory: LightFactory): Promise<void> {
    const lights = await LightFactory.create();
    lights.forEach((light) => this._scene.add(light));
  }

  public async addHelper(
    SceneHelperFactory: SceneHelperFactory
  ): Promise<void> {
    const sceneHelpers = await SceneHelperFactory.create();
    sceneHelpers.forEach((sceneHelper) => this._scene.add(sceneHelper));
  }

  public addEffects(renderEffects: RenderEffects): void {
    this._effectsNeedUpdate = true;
    this._renderEffects = renderEffects;
  }

  public cameraHasChanged(): void {
    this._cameraHasChanged = true;
  }

  public async render(camera: Camera): Promise<void> {
    if (this.effectsEnabled && this._renderEffects) {
      if (this._effectsNeedUpdate) {
        this._effectsNeedUpdate = false;
        this._renderEffects.updateScene(this._renderer, this._scene, camera);
        if (this._scene.environment) {
          this._scene.environment.needsUpdate = true;
        }
      }
      if (this._cameraHasChanged) {
        this._cameraHasChanged = false;
        this._renderEffects.updateCamera(this._renderer, this._scene, camera);
      }
      await this._renderEffects.renderAsync();
    } else {
      await this._renderer.renderAsync(this.scene, camera);
    }
  }

  public addUI(gui: GUI): void {
    gui
      .add(this._uiProperties, 'enable effects')
      .onChange(() => (this._effectsNeedUpdate = true));
    this._renderEffects?.addUI(gui);
  }
}
