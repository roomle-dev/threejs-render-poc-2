import { newRadialFloorTexture } from '../texture/texture-factory';
import { SceneFactory, SceneObject } from './scene-factory';
import {
  Box3,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  PlaneGeometry,
  ShadowMaterial,
  Vector3,
} from 'three/webgpu';

export interface ShadowPlaneParameters {
  usePhysicalMaterial?: boolean;
}

export class ShadowPlaneSceneFactory implements SceneFactory {
  private readonly _baseSceneFactory: SceneFactory;
  private readonly _shadowPlaneParameters: ShadowPlaneParameters;

  constructor(
    baseSceneFactory: SceneFactory,
    shadowPlaneParameters: ShadowPlaneParameters
  ) {
    this._baseSceneFactory = baseSceneFactory;
    this._shadowPlaneParameters = shadowPlaneParameters;
  }

  async create(): Promise<SceneObject> {
    const resultSceneObject = new Promise<SceneObject>((resolve) => {
      this._baseSceneFactory.create().then((baseObject) => {
        const objectGroup = this._newGroup(baseObject.objects);
        this._liftOnGround(objectGroup);
        resolve({
          objects: [objectGroup, this._newShadowPlane()],
          animations: baseObject.animations,
        });
      });
    });
    return resultSceneObject;
  }

  private _newGroup(objects: Object3D[]): Object3D {
    const group = new Group();
    objects.forEach((object) => group.add(object));
    return group;
  }

  private _liftOnGround(object: Object3D): void {
    const box = new Box3().setFromObject(object);
    const log10 = Math.floor(
      Math.log10(Math.abs(box.getSize(new Vector3()).length()))
    );
    const scale = 10 ** -log10;
    object.scale.multiplyScalar(scale);
    const boxCenter = box.getCenter(new Vector3());
    object.position.x -= boxCenter.x * scale;
    object.position.z -= boxCenter.z * scale;
    if (box.min.y < 0) {
      object.position.y -= box.min.y * scale;
    }
  }

  private _newShadowPlane(): Object3D {
    const groundGeometry = new PlaneGeometry(20, 20);
    groundGeometry.rotateX(-Math.PI / 2);
    // ShadowMaterial is only supported in webgl (three.js 174)
    // ShadowMaterial is all over black with webgl path tracer (three-gpu-pathtracer 0.0.23)
    const groundMaterial = this._shadowPlaneParameters.usePhysicalMaterial
      ? new MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0.0,
          roughness: 0.2,
          reflectivity: 0.8,
          transparent: true,
          map: newRadialFloorTexture(1024),
        })
      : new ShadowMaterial();
    const groundMesh = new Mesh(groundGeometry, groundMaterial);
    groundMesh.receiveShadow = true;
    return groundMesh;
  }
}
