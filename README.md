# three.js render PoC 2

[WebGPU demo](https://rabbid76.github.io/threejs-render-poc-2/?type=webgpu)

[WebGL Path Tracer demo](https://rabbid76.github.io/threejs-render-poc-2/?type=webgl)

## Install and build

```lang-none
npm i  
npm run dev
```

```lang-none
npm i  
npm run build
npm run serve
```

## URL Parameters

| name | type | description | example |
|------|------|-------------|---------|
| `type` | `string` | Renderer type 'webgl', 'webgpu-forcewebgl', 'webgpu' (default 'webgl'). | `type=webgpu` |

## Notes

[Notes and ideas](./docs/notes.md)

## Links

[Three.js Shading Language](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)  
[three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer)  
