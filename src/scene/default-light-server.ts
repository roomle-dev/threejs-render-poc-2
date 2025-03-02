import { LightServer } from './light-server';
import { DirectionalLight, HemisphereLight, Light } from 'three/webgpu';

export class DefaultLightServer implements LightServer {
  public create(): Promise<Light[]> {
    const environmentLight = new HemisphereLight(0xffffff, 0x080808, 0.5);
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

  public reset(): void {
    // nihting to do
  }

  public progress(): void {
    // nothiong to do
  }
}
