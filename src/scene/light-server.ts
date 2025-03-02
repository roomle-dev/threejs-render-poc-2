import { Light } from 'three/webgpu';

export interface LightServer {
  create(): Promise<Light[]>;
  reset(): void;
  progress(): void;
}
