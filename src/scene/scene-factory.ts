import { Object3D } from 'three/webgpu';

export interface SceneFactory {
  create(): Promise<SceneObject>;
}

export interface SceneObject {
  objects: Object3D[];
  animations: AnimationCommand[];
}

export interface AnimationCommand {
  get object(): Object3D;
  animate(deltaTimeInMs: number): void;
}
