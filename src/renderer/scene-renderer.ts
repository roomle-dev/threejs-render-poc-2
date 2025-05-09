import { LightFactory } from '@/scene/light-factory';
import { SceneFactory, SceneObject } from '@/scene/scene-factory';
import {
  Camera,
  Color,
  NeutralToneMapping,
  PCFSoftShadowMap,
  Scene,
  Texture,
  WebGPURenderer,
} from 'three/webgpu';
import { WebGLRenderer } from 'three';
import { SceneHelperFactory } from '@/scene/scene-helper-factory';
import { RenderEffects } from './render-effects';
import { GUI } from 'dat.gui';

export abstract class SceneRenderer {
  private _renderer: WebGLRenderer | WebGPURenderer;
  private _scene: Scene;
  private _sceneObject: SceneObject | null = null;
  private _renderEffects?: RenderEffects;
  private _effectsNeedUpdate: boolean = false;
  private _environmentHasChanged: boolean = false;
  private _cameraHasChanged: boolean = false;

  constructor(
    container: HTMLDivElement,
    renderer: WebGLRenderer | WebGPURenderer
  ) {
    this._renderer = renderer;
    this._renderer.toneMapping = NeutralToneMapping;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this._renderer.domElement);
    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = PCFSoftShadowMap;
    this._scene = new Scene();
  }

  public get domElement(): HTMLElement {
    return this._renderer.domElement;
  }

  public abstract get effectsEnabled(): boolean;
  public abstract get showEnvironmentInBackground(): boolean;
  public abstract get renderStatusMessage(): string;

  public get scene(): Scene {
    return this._scene;
  }

  public set effectsNeedUpdate(value: boolean) {
    this._effectsNeedUpdate = value;
  }

  public get renderEffects(): RenderEffects | undefined {
    return this._renderEffects;
  }

  set sceneHasChanged(value: boolean) {
    if (value) {
      this._effectsNeedUpdate = true;
    }
  }

  set environmentHasChanged(value: boolean) {
    if (value) {
      this._environmentHasChanged = true;
    }
  }

  public abstract addUI(gui: GUI): void;

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
    this._scene.environment = equirectTexture;
    this._environmentHasChanged = true;
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
    if (this._effectsNeedUpdate) {
      this._renderEffects?.updateLights(
        this._renderer,
        this._scene,
        camera,
        this.effectsEnabled
      );
    }
    if (this.effectsEnabled && this._renderEffects) {
      if (this._effectsNeedUpdate) {
        this._effectsNeedUpdate = false;
        this._renderEffects.updateScene(this._renderer, this._scene, camera);
        if (this._scene.environment) {
          this._scene.environment.needsUpdate = true;
        }
      }
      if (this._environmentHasChanged) {
        this._environmentHasChanged = false;
        this._scene.background = this.showEnvironmentInBackground
          ? this._scene.environment
          : new Color(0xffffff);
        this._renderEffects.updateEnvironment(
          this._renderer,
          this._scene,
          camera
        );
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
}
