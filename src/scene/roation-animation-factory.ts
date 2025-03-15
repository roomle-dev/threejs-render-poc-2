import { AnimationCommand, SceneFactory, SceneObject } from './scene-factory';
import { Object3D } from 'three/webgpu';
import { AnimationServer } from './animation-server';

export class AnimationServerFactory implements SceneFactory {
  private readonly _baseSceneFactory: SceneFactory;
  private readonly _animation: AnimationServer;
  private readonly _sceneObjects: Object3D[] = [];

  constructor(baseSceneFactory: SceneFactory, animation: AnimationServer) {
    this._baseSceneFactory = baseSceneFactory;
    this._animation = animation;
  }

  public create(): Promise<SceneObject> {
    const resultSceneObject = new Promise<SceneObject>((resolve) => {
      this._baseSceneFactory.create().then((baseObject) => {
        const newAnimation: AnimationCommand[] = [];
        for (const object of baseObject.objects) {
          newAnimation.push({
            object,
            animate: (deltaTimeInMs: number) => {
              this._animation.animate(object, deltaTimeInMs);
            },
          });
        }
        resolve({
          objects: baseObject.objects,
          animations: [...baseObject.animations, ...newAnimation],
        });
      });
    });
    return resultSceneObject;
  }
}
