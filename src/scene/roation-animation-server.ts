import { SceneServer } from './scene-server';
import { AnimationNode } from './animation-node';
import { Object3D } from 'three/webgpu';

export class AnimationServer implements SceneServer {
  private readonly _baseSceneServer: SceneServer;
  private readonly _animation: AnimationNode;
  private readonly _sceneObjects: Object3D[] = [];

  constructor(baseSceneServer: SceneServer, animation: AnimationNode) {
    this._baseSceneServer = baseSceneServer;
    this._animation = animation;
  }

  public create() {
    const sceneObjects = this._baseSceneServer.create();
    this._sceneObjects.length = 0;
    sceneObjects.then((objects) => {
      this._sceneObjects.push(...objects);
    });
    return sceneObjects;
  }

  public animate(deltaTimeInMs: number): void {
    this._sceneObjects.forEach((object) => {
      this._animation.animate(object, deltaTimeInMs);
    });
  }
}
