import { Mesh } from 'three/webgpu';
import { SceneFactory } from './scene-factory';

export class ShadowModifierFactory {
  private readonly _baseSceneFactory: SceneFactory;

  constructor(baseSceneFactory: SceneFactory) {
    this._baseSceneFactory = baseSceneFactory;
  }

  public create() {
    const sceneObjects = this._baseSceneFactory.create();
    sceneObjects.then((objects) => {
      objects.forEach((object) => {
        object.traverse((node) => {
          if (node instanceof Mesh) {
            node.receiveShadow = true;
            node.castShadow = true;
          }
        });
      });
    });
    return sceneObjects;
  }
}
