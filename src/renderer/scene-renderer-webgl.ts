import { LightFactory } from '@/scene/light-factory';
import { SceneFactory } from '@/scene/scene-factory';
import { SceneRenderer } from './scene-renderer';
import {
  Camera,
  NeutralToneMapping,
  Object3D,
  Scene,
  Texture,
} from 'three/webgpu';
import { WebGLRenderer } from 'three';
import { SceneHelperFactory } from '@/scene/scene-helper-factory';
import { RenderEffects } from './render-effects';
import { GUI } from 'dat.gui';

interface UiProperties {
  'enable path tracer': true;
}

export class SceneRendererWebGL implements SceneRenderer {
  private _renderer: WebGLRenderer;
  private _scene: Scene;
  private _sceneObjects: Object3D[] = [];
  private _renderEffects?: RenderEffects;
  private _effectsNeedUpdate: boolean = false;
  private _cameraHasChanged: boolean = false;
  private _uiProperties: UiProperties = { 'enable path tracer': true };

  constructor(container: HTMLDivElement) {
    this._renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
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
      this._uiProperties['enable path tracer']
    );
  }

  public get renderStatusMessage(): string {
    const effectsMessage = this.effectsEnabled
      ? this._renderEffects?.renderStatusMessage
      : '';
    return 'WebGLRenderer ' + effectsMessage;
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

  public async createNewScene(SceneFactory: SceneFactory): Promise<Object3D[]> {
    const sceneObjects = await SceneFactory.create();
    for (const sceneObject of this._sceneObjects) {
      this._scene.remove(sceneObject);
    }
    this._sceneObjects = sceneObjects;
    for (const sceneObject of sceneObjects) {
      this._scene.add(sceneObject);
    }
    this._effectsNeedUpdate = true;
    return this._sceneObjects;
  }

  public setEnvironmentMap(equirectTexture: Texture): void {
    this._scene.background = equirectTexture;
    this._scene.environment = equirectTexture;
    this._effectsNeedUpdate = true;
  }

  public async addLights(LightFactory: LightFactory): Promise<void> {
    const lights = await LightFactory.create();
    lights.forEach((light) => this._scene.add(light));
    this._effectsNeedUpdate = true;
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
      this._renderer.render(this.scene, camera);
    }
  }

  public addUI(gui: GUI): void {
    gui
      .add(this._uiProperties, 'enable path tracer')
      .onChange(() => (this._effectsNeedUpdate = true));
    this._renderEffects?.addUI(gui);
  }
}
