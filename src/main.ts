import { CubeSceneServer } from './scene/cube-scene-server';
import { SceneRendererWebGL } from './renderer/scene-renderer-webgl';
import { StaticPerspectiveCamera } from './camera/static-perspective-camera';
import { CameraOrbitControls } from './camera/camera-orbit-controls';
import { AmbientDirectionalLightServer } from './scene/ambient-directional-light-server';
import { AxisGridHelperServer } from './scene/axis-grid-helper-server';
import { Mesh, PlaneGeometry, ShadowMaterial } from 'three';
import { ShadowModifierServer } from './scene/shadow-modifier-server';

export const renderScene = async (container: HTMLDivElement) => {
  const renderer = new SceneRendererWebGL(container);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const cameraControl = new CameraOrbitControls(
    new StaticPerspectiveCamera(window.innerWidth / window.innerHeight),
    container
  );
  const lightServer = new AmbientDirectionalLightServer();
  await renderer.addLights(lightServer);
  const sceneHelperServer = new AxisGridHelperServer();
  await renderer.addHelper(sceneHelperServer);
  const sceneServer = new ShadowModifierServer(new CubeSceneServer());
  const sceneObject = await renderer.createNewScene(sceneServer);

  sceneObject[0].position.y = 1.5;
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
    sceneObject[0].rotation.x += 0.01;
    sceneObject[0].rotation.y += 0.01;
    renderer.render(cameraControl.camera);
  };

  animate();
};

const container = document.getElementById('container') as HTMLDivElement;
renderScene(container);
