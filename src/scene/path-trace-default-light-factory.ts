import { LightFactory } from './light-factory';
import { HemisphereLight, Light, RectAreaLight } from 'three/webgpu';

export class PathTraceDefaultLightFactory implements LightFactory {
  public create(): Promise<Light[]> {
    const environmentLight = new HemisphereLight(0x404040, 0xffffff, 2);
    const lightSourceTop = new RectAreaLight(0xffffff, 40, 100, 100);
    lightSourceTop.position.set(0, 500, 0);
    lightSourceTop.lookAt(0, 0, 0);
    const lightSources = [environmentLight, lightSourceTop];
    for (let i = 0; i < 3; i++) {
      const lightSource = new RectAreaLight(0xffffff, 20, 100, 100);
      const z = -500 * Math.cos((i * Math.PI * 2) / 3);
      const x = 500 * Math.sin((i * Math.PI * 2) / 3);
      console.log(x, z);
      lightSource.position.set(x, 400, z);
      lightSource.lookAt(0, 0, 0);
      lightSources.push(lightSource);
    }
    return Promise.resolve(lightSources);
  }
}
