import { SceneServer } from '@/scene/scene-server';
import { SceneRenderer } from './scene-renderer';
import { Camera, Object3D, Scene, WebGLRenderer } from 'three';

export class SceneRendererWebGL implements SceneRenderer {
  private readonly renderer: WebGLRenderer;
  private scene: Scene;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.scene = new Scene();
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
