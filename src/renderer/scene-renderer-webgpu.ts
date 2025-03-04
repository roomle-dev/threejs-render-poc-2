import { LightServer } from '@/scene/light-server';
import { SceneServer } from '@/scene/scene-server';
import { SceneRenderer } from './scene-renderer';
import { SceneHelperServer } from '@/scene/scene-helper-server';
import { Camera, NeutralToneMapping, Object3D, Scene } from 'three/webgpu';
import { WebGPURenderer } from 'three/webgpu';

export interface SceneRendererWebGPUParameters {
  forceWebGL?: boolean;
}

interface BackendType {
  isWebGPUBackend?: boolean;
  isWebGLBackend?: boolean;
}

export class SceneRendererWebGPU implements SceneRenderer {
  private readonly renderer: WebGPURenderer;
  private _scene: Scene;
  private _sceneObjects: Object3D[] = [];

  constructor(
    container: HTMLDivElement,
    parameters: SceneRendererWebGPUParameters = {}
  ) {
    this.renderer = new WebGPURenderer({
      antialias: true,
      alpha: true,
      forceWebGL: parameters.forceWebGL ?? false,
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
    return (
      'WebGPURenderer' +
      ((this.renderer.backend as BackendType).isWebGPUBackend
        ? ' (WebGPU)'
        : ' (WebGL)')
    );
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

  public render(camera: Camera): void {
    this.renderer.renderAsync(this.scene, camera);
  }
}
