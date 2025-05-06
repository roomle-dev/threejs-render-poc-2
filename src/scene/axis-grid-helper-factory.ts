import { SceneHelperFactory } from './scene-helper-factory';
import { AxesHelper, GridHelper, Object3D } from 'three/webgpu';

export class AxisGridHelperFactory implements SceneHelperFactory {
  create(): Promise<Object3D[]> {
    const gridHelper = new GridHelper(10, 10);
    gridHelper.visible = false;
    const axesHelper = new AxesHelper(2);
    axesHelper.visible = false;
    return Promise.resolve([gridHelper, axesHelper]);
  }
}
