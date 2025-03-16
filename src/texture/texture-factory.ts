import {
  DataTexture,
  LinearFilter,
  RepeatWrapping,
  RGBAFormat,
  UnsignedByteType,
} from 'three/webgpu';

export const newRadialFloorTexture = (
  dim: number,
  opaqueRadius: number = 0
): DataTexture => {
  const data = new Uint8Array(dim * dim * 4);

  for (let x = 0; x < dim; x++) {
    for (let y = 0; y < dim; y++) {
      const xNorm = x / (dim - 1);
      const yNorm = y / (dim - 1);
      const xCent = 2.0 * (xNorm - 0.5);
      const yCent = 2.0 * (yNorm - 0.5);
      let d = Math.sqrt(xCent ** 2 + yCent ** 2);
      let a = 1;
      if (d > opaqueRadius) {
        d = (d - opaqueRadius) / (1 - opaqueRadius);
        a = Math.max(Math.min(1.0 - d, 1.0), 0.0);
        a = a ** 1.5;
        a = a * 1.5;
        a = Math.min(a, 1.0);
      }
      const i = y * dim + x;
      data[i * 4 + 0] = 255;
      data[i * 4 + 1] = 255;
      data[i * 4 + 2] = 255;
      data[i * 4 + 3] = a * 255;
    }
  }
  const tex = new DataTexture(data, dim, dim);
  tex.format = RGBAFormat;
  tex.type = UnsignedByteType;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
};
