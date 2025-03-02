import { Object3D } from 'three';
import { SceneServer } from './scene-server';

export class RotationAnimationServer {
  private readonly _baseSceneServer: SceneServer;
  private readonly sceneObjects: Object3D[] = [];

  constructor(baseSceneServer: SceneServer) {
    this._baseSceneServer = baseSceneServer;
  }

  public create() {
    const sceneObjects = this._baseSceneServer.create();
    sceneObjects.then((objects) => {
      this.sceneObjects.push(...objects);
    });
    return sceneObjects;
  }

  public animate(deltaTimeInMs: number): void {
    this._baseSceneServer.animate(deltaTimeInMs);
    this.sceneObjects.forEach((object) => {
      object.rotation.x += (deltaTimeInMs / 1000) * Math.PI;
      object.rotation.y += (deltaTimeInMs / 1000) * (Math.PI / 2);
    });
  }
}
