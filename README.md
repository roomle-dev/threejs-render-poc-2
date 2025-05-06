# three.js render PoC 2

WebGPU demo

- [https://roomle-dev.github.io/threejs-render-poc-2/?type=webgpu&id=usm:frame:9C4BC73D19BAAD07675CDDEA721F493BB126939392FF80318204B089BD55C71A]
- [https://roomle-dev.github.io/threejs-render-poc-2/?type=webgpu&id=ps_taum3gv9o9sqw61nc9zw6486l2602su]

WebGL Path Tracer demo

- [https://roomle-dev.github.io/threejs-render-poc-2/?type=webgl&id=usm:frame:9C4BC73D19BAAD07675CDDEA721F493BB126939392FF80318204B089BD55C71A]

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
| `id` | `string` | roomle plan, plan snapshot or configuration ID. | `id=usm:frame` |

## Notes

[Notes and ideas](./docs/notes.md)

## Links

[Three.js Shading Language](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)  
[three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer)  
