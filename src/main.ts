import { CubeSceneServer } from './scene/cube-scene-server';
import { SceneRendererWebGL } from './renderer/scene-renderer-webgl';
import { StaticPerspectiveCamera } from './camera/static-perspective-camera';
import { CameraOrbitControls } from './camera/camera-orbit-controls';
import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  Mesh,
  PlaneGeometry,
  ShadowMaterial,
} from 'three';

export const renderScene = async (container: HTMLDivElement) => {
  const renderer = new SceneRendererWebGL(container);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const sceneServer = new CubeSceneServer();
  const sceneObject = await renderer.createNewScene(sceneServer);
  const cameraControl = new CameraOrbitControls(
    new StaticPerspectiveCamera(window.innerWidth / window.innerHeight),
    container
  );

  const gridHelper = new GridHelper(10, 10);
  renderer.scene.add(gridHelper);
  const axesHelper = new AxesHelper(2);
  renderer.scene.add(axesHelper);
  const ambientLight = new AmbientLight(0xffffff, 0.5);
  renderer.scene.add(ambientLight);
  const directionalLight = new DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(5, 15, 5);
  directionalLight.castShadow = true;
  renderer.scene.add(directionalLight);
  sceneObject.castShadow = true;
  sceneObject.receiveShadow = true;
  sceneObject.position.y = 1.5;
  const groundGeometry = new PlaneGeometry(10, 10);
  groundGeometry.rotateX(-Math.PI / 2);
  const groundMaterial = new ShadowMaterial();
  const groundMesh = new Mesh(groundGeometry, groundMaterial);
  groundMesh.receiveShadow = true;
  renderer.scene.add(groundMesh);

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

  const animate = () => {
    requestAnimationFrame(animate);
    sceneObject.rotation.x += 0.01;
    sceneObject.rotation.y += 0.01;
    renderer.render(cameraControl.camera);
  };

  animate();
};

const container = document.getElementById('container') as HTMLDivElement;
renderScene(container);
