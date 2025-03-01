import * as THREE from 'three';
import { CubeSceneServer } from './scene/cube-scene-server';

export const renderScene = async (canvas: HTMLCanvasElement) => {
  const sceneServer = new CubeSceneServer();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const sceneObject = await sceneServer.create();
  scene.add(sceneObject);

  function animate() {
    requestAnimationFrame(animate);
    sceneObject.rotation.x += 0.01;
    sceneObject.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
};

const canvasElement = document.getElementById('canvas') as HTMLCanvasElement;
renderScene(canvasElement);
