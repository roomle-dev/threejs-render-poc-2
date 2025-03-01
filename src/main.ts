import { CubeSceneServer } from './scene/cube-scene-server';
import { SceneRendererWebGL } from './renderer/scene-renderer-webgl';
import { PerspectiveCamera } from 'three';

export const renderScene = async (canvas: HTMLCanvasElement) => {
  const renderer = new SceneRendererWebGL(canvas);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const sceneServer = new CubeSceneServer();
  const sceneObject = await renderer.createNewScene(sceneServer);

  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 3;

  function animate() {
    requestAnimationFrame(animate);
    sceneObject.rotation.x += 0.01;
    sceneObject.rotation.y += 0.01;
    renderer.render(camera);
  }

  animate();
};

const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
renderScene(canvasElement);
