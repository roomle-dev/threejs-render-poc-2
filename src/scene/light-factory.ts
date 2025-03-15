import { Light } from 'three/webgpu';

export interface LightFactory {
  create(): Promise<Light[]>;
  reset(): void;
  progress(): void;
}
