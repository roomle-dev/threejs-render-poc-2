import { LightFactory } from './light-factory';
import { DirectionalLight, HemisphereLight, Light } from 'three/webgpu';

export class DefaultLightFactory implements LightFactory {
  public create(): Promise<Light[]> {
    const environmentLight = new HemisphereLight(0x000000, 0xffffff, 0.5);
    //const lightSource = new PointLight(0xffffff, 100);
    const lightSource = new DirectionalLight(0xffffff, 1);
    lightSource.position.set(100, 150, 100);
    lightSource.castShadow = true;
    lightSource.shadow.mapSize.width = 1024;
    lightSource.shadow.mapSize.height = 1024;
    lightSource.shadow.camera.near = 50;
    lightSource.shadow.camera.far = 300;
    lightSource.shadow.camera.lookAt(0, 0, 0);
    return Promise.resolve([environmentLight, lightSource]);
  }
}
