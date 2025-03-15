import { Mesh } from 'three/webgpu';
import { SceneFactory } from './scene-factory';

export class ShadowModifierFactory {
  private readonly _baseSceneFactory: SceneFactory;

  constructor(baseSceneFactory: SceneFactory) {
    this._baseSceneFactory = baseSceneFactory;
  }

  public create() {
    const newSceneObject = this._baseSceneFactory.create();
    newSceneObject.then((sceneObject) => {
      sceneObject.objects.forEach((object) => {
        object.traverse((node) => {
          if (node instanceof Mesh) {
            node.receiveShadow = true;
            node.castShadow = true;
          }
        });
      });
    });
    return newSceneObject;
  }
}
