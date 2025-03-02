import { Light } from 'three';

export interface LightServer {
  create(): Promise<Light[]>;
  reset(): void;
  progress(): void;
}
