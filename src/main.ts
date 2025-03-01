import { CubeSceneServer } from './scene/cube-scene-server';
import { SceneRendererWebGL } from './renderer/scene-renderer-webgl';
import { StaticPerspectiveCamera } from './camera/static-perspective-camera';

export const renderScene = async (canvas: HTMLCanvasElement) => {
  const renderer = new SceneRendererWebGL(canvas);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const sceneServer = new CubeSceneServer();
  const sceneObject = await renderer.createNewScene(sceneServer);
  const cameraControl = new StaticPerspectiveCamera(
    window.innerWidth / window.innerHeight
  );

  window.addEventListener(
    'resize',
    () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      cameraControl.setSizes(width, height);
      renderer.setSize(width, height);
    },
    false
  );

  function animate() {
    requestAnimationFrame(animate);
    sceneObject.rotation.x += 0.01;
    sceneObject.rotation.y += 0.01;
    renderer.render(cameraControl.camera);
  }

  animate();
};

const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
renderScene(canvasElement);
