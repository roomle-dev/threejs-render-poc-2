import { Mesh } from 'three';
import { SceneServer } from './scene-server';

export class ShadowModifierServer {
  private readonly _baseSceneServer: SceneServer;

  constructor(baseSceneServer: SceneServer) {
    this._baseSceneServer = baseSceneServer;
  }

  public create() {
    const sceneObjects = this._baseSceneServer.create();
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
