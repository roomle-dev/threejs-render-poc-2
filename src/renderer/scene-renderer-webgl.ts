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
  private scene: Scene;

  constructor(container: HTMLDivElement) {
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    this.scene = new Scene();
  }

  get domElement(): HTMLElement {
    return this.renderer.domElement;
  }

  public setSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
  }

  public async createNewScene(sceneServer: SceneServer): Promise<Object3D> {
    const sceneObject = await sceneServer.create();
    this.scene.add(sceneObject);
    return sceneObject;
  }

  public render(camera: Camera): void {
    this.renderer.render(this.scene, camera);
  }
}
