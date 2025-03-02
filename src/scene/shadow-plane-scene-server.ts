import {
  Box3,
  Group,
  Mesh,
  Object3D,
  PlaneGeometry,
  ShadowMaterial,
} from 'three';
import { SceneServer } from './scene-server';

export class ShadowPlaneSceneServer implements SceneServer {
  private readonly _baseSceneServer: SceneServer;

  constructor(baseSceneServer: SceneServer) {
    this._baseSceneServer = baseSceneServer;
  }

  async create(): Promise<Object3D[]> {
    const sceneObjects = new Promise<Object3D[]>((resolve) => {
      this._baseSceneServer.create().then((baseObjects) => {
        const objects: Object3D[] = [];
        const objectGroup = this._newGroup(baseObjects);
        this._liftOnGround(objectGroup);
        objects.push(objectGroup);
        objects.push(this._newShadowPlane());
        resolve(objects);
      });
    });
    return sceneObjects;
  }

  private _newGroup(objects: Object3D[]): Object3D {
    const group = new Group();
    objects.forEach((object) => group.add(object));
    return group;
  }

  private _liftOnGround(object: Object3D): void {
    const box = new Box3().setFromObject(object);
    if (box.min.y < 0) {
      object.position.y -= box.min.y;
    }
  }

  private _newShadowPlane(): Object3D {
    const groundGeometry = new PlaneGeometry(10, 10);
    groundGeometry.rotateX(-Math.PI / 2);
    const groundMaterial = new ShadowMaterial();
    const groundMesh = new Mesh(groundGeometry, groundMaterial);
    groundMesh.receiveShadow = true;
    return groundMesh;
  }

  public animate(deltaTimeInMs: number): void {
    this._baseSceneServer.animate(deltaTimeInMs);
  }
}
