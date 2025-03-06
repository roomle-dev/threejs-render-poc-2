import { LightServer } from '@/scene/light-server';
import { SceneServer } from '@/scene/scene-server';
import { SceneRenderer } from './scene-renderer';
import { Camera, NeutralToneMapping, Object3D, Scene } from 'three/webgpu';
import { WebGLRenderer } from 'three';
import { SceneHelperServer } from '@/scene/scene-helper-server';

export class SceneRendererWebGL implements SceneRenderer {
  private readonly renderer: WebGLRenderer;
  private _scene: Scene;
  private _sceneObjects: Object3D[] = [];

  constructor(container: HTMLDivElement) {
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    this.renderer.shadowMap.enabled = true;
    this._scene = new Scene();
  }

  public get domElement(): HTMLElement {
    return this.renderer.domElement;
  }

  public get renderTypeMessage(): string {
    return 'WebGLRenderer';
  }

  public get scene(): Scene {
    return this._scene;
  }

  public dispose(): void {
    this.renderer.dispose();
  }

  public setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
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

  public enableEffects(_camera: Camera): void {
    // not yet implemented
  }

  public render(camera: Camera): Promise<void> {
    this.renderer.render(this.scene, camera);
    return Promise.resolve();
  }
}
