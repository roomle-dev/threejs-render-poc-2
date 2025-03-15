import { Light } from 'three/webgpu';

export interface LightFactory {
  create(): Promise<Light[]>;
}
