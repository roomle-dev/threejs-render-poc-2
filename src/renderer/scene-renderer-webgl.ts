import { LightServer } from '@/scene/light-server';
import { SceneServer } from '@/scene/scene-server';
import { SceneRenderer } from './scene-renderer';
import { Camera, NeutralToneMapping, Object3D, Scene } from 'three/webgpu';
import { WebGLRenderer } from 'three';
import { SceneHelperServer } from '@/scene/scene-helper-server';
import { RenderEffects } from './render-effects';
import { GUI } from 'dat.gui';

export class SceneRendererWebGL implements SceneRenderer {
  private _renderer: WebGLRenderer;
  private _scene: Scene;
  private _sceneObjects: Object3D[] = [];
  private _renderEffects?: RenderEffects;
  private _effectsNeedUpdate: boolean = false;
  private _cameraHasChanged: boolean = false;

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

  public get renderTypeMessage(): string {
    return 'WebGLRenderer';
  }

  public get scene(): Scene {
    return this._scene;
  }

  public dispose(): void {
    this._renderer.dispose();
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

  public addEffects(renderEffects: RenderEffects): void {
    this._effectsNeedUpdate = true;
    this._renderEffects = renderEffects;
  }

  public cameraHasChanged(): void {
    this._cameraHasChanged = true;
  }

  public async render(camera: Camera): Promise<void> {
    if (this._renderEffects?.isValid) {
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

  public addUI(_gui: GUI): void {
    // not yet implemented
  }
}
