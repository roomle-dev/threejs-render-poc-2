import { LightServer } from './light-server';
import { AmbientLight, DirectionalLight, Light } from 'three';

export class AmbientDirectionalLightServer implements LightServer {
  public create(): Promise<Light[]> {
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    const directionalLight = new DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 15, 5);
    directionalLight.castShadow = true;
    return Promise.resolve([ambientLight, directionalLight]);
  }

  public reset(): void {
    // nihting to do
  }

  public progress(): void {
    // nothiong to do
  }
}
