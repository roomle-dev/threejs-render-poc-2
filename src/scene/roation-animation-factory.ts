import { SceneFactory } from './scene-factory';
import { AnimationNode } from './animation-node';
import { Object3D } from 'three/webgpu';
import { AnimationServer } from './animation-server';

export class AnimationServerFactory implements SceneFactory, AnimationServer {
  private readonly _baseSceneFactory: SceneFactory;
  private readonly _animation: AnimationNode;
  private readonly _sceneObjects: Object3D[] = [];

  constructor(baseSceneFactory: SceneFactory, animation: AnimationNode) {
    this._baseSceneFactory = baseSceneFactory;
    this._animation = animation;
  }

  public create() {
    const sceneObjects = this._baseSceneFactory.create();
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
