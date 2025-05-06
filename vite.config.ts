import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../dist',
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: './draco/*',
          dest: 'draco',
        },
        {
          src: '../node_modules/roomle-core-hsc/wasm_modern/ConfiguratorKernel.wasm',
          dest: '.',
        },
        {
          src: '../node_modules/roomle-core-hsc/wasm_modern/RoomleCore.wasm',
          dest: '.',
        },
      ],
    }),
  ],
});
