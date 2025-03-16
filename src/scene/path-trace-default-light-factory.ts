import { LightFactory } from './light-factory';
import { HemisphereLight, Light, RectAreaLight } from 'three/webgpu';

export class PathTraceDefaultLightFactory implements LightFactory {
  public create(): Promise<Light[]> {
    const environmentLight = new HemisphereLight(0x404040, 0xffffff, 2);
    const lightSourceTop = new RectAreaLight(0xffffff, 100, 100, 100);
    lightSourceTop.position.set(0, 500, 0);
    lightSourceTop.lookAt(0, 0, 0);
    const lightSource2 = new RectAreaLight(0xffffff, 60, 100, 100);
    lightSource2.position.set(-400, 400, 200);
    lightSource2.lookAt(0, 0, 0);
    const lightSource3 = new RectAreaLight(0xffffff, 60, 100, 100);
    lightSource3.position.set(400, 400, 200);
    lightSource3.lookAt(0, 0, 0);
    const lightSource4 = new RectAreaLight(0xffffff, 60, 100, 100);
    lightSource4.position.set(0, 400, -500);
    lightSource4.lookAt(0, 0, 0);
    return Promise.resolve([
      environmentLight,
      lightSourceTop,
      lightSource2,
      lightSource3,
      lightSource4,
    ]);
  }
}
