import { LightServer } from '@/scene/light-server';
import { SceneServer } from '@/scene/scene-server';
import { SceneRenderer } from './scene-renderer';
import { SceneHelperServer } from '@/scene/scene-helper-server';
import { RenderEffects } from './render-effects';
import {
  Camera,
  NeutralToneMapping,
  Object3D,
  Scene,
  WebGPURenderer,
} from 'three/webgpu';

export interface SceneRendererWebGPUParameters {
  forceWebGL?: boolean;
}

interface BackendType {
  isWebGPUBackend?: boolean;
  isWebGLBackend?: boolean;
}

export class SceneRendererWebGPU implements SceneRenderer {
  private _renderer: WebGPURenderer;
  private _scene: Scene;
  private _sceneObjects: Object3D[] = [];
  private _renderEffects?: RenderEffects;

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

  public get renderTypeMessage(): string {
    return (
      'WebGPURenderer' +
      ((this._renderer.backend as BackendType).isWebGPUBackend
        ? ' (WebGPU)'
        : ' (WebGL)')
    );
  }

  public get scene(): Scene {
    return this._scene;
  }

  public dispose(): void {
    this._renderer.dispose();
    this._renderEffects?.dispose();
  }

  public setSize(width: number, height: number): void {
    this._renderer.setSize(width, height);
  }

  public async createNewScene(sceneServer: SceneServer): Promise<Object3D[]> {
    const sceneObjects = await sceneServer.create();
    for (const sceneObject of this._sceneObjects) {
      this._scene.remove(sceneObject);
    }
    this._sceneObjects = sceneObjects;
    for (const sceneObject of sceneObjects) {
      this._scene.add(sceneObject);
    }
    return this._sceneObjects;
  }

  public async addLights(lightServer: LightServer): Promise<void> {
    const lights = await lightServer.create();
    lights.forEach((light) => this._scene.add(light));
  }

  public async addHelper(sceneHelperServer: SceneHelperServer): Promise<void> {
    const sceneHelpers = await sceneHelperServer.create();
    sceneHelpers.forEach((sceneHelper) => this._scene.add(sceneHelper));
  }

  public addEffects(camera: Camera, renderEffects: RenderEffects): void {
    this._renderEffects = renderEffects;
    this._renderEffects.initialize(this._renderer, this._scene, camera);
  }

  public async render(camera: Camera): Promise<void> {
    if (this._renderEffects) {
      await this._renderEffects.renderAsync();
    } else {
      await this._renderer.renderAsync(this.scene, camera);
    }
  }
}
