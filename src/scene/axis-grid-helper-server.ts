import { SceneHelperServer } from './scene-helper-server';
import { AxesHelper, GridHelper, Object3D } from 'three/webgpu';

export class AxisGridHelperServer implements SceneHelperServer {
  create(): Promise<Object3D[]> {
    const gridHelper = new GridHelper(10, 10);
    const axesHelper = new AxesHelper(2);
    return Promise.resolve([gridHelper, axesHelper]);
  }
}
