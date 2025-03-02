import { LightServer } from '@/scene/light-server';
import { SceneServer } from '@/scene/scene-server';
import { SceneRenderer } from './scene-renderer';
import {
  Camera,
  NeutralToneMapping,
  Object3D,
  Scene,
  WebGLRenderer,
} from 'three';

export class SceneRendererWebGL implements SceneRenderer {
  private readonly renderer: WebGLRenderer;
  private _scene: Scene;
  private _sceneObject: Object3D | null = null;

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

  get domElement(): HTMLElement {
    return this.renderer.domElement;
  }

  get scene(): Scene {
    return this._scene;
  }

  public setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  public async createNewScene(sceneServer: SceneServer): Promise<Object3D> {
    const sceneObject = await sceneServer.create();
    if (this._sceneObject) {
      this._scene.remove(this._sceneObject);
    }
    this._sceneObject = sceneObject;
    this._scene.add(this._sceneObject);
    return sceneObject;
  }

  public async addLights(LightServer: LightServer): Promise<void> {
    const lights = await LightServer.create();
    lights.forEach((light) => this._scene.add(light));
  }

  public render(camera: Camera): void {
    this.renderer.render(this.scene, camera);
  }
}
