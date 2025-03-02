import { CubeSceneServer } from './scene/cube-scene-server';
import { SceneRendererWebGL } from './renderer/scene-renderer-webgl';
import { StaticPerspectiveCamera } from './camera/static-perspective-camera';
import { CameraOrbitControls } from './camera/camera-orbit-controls';
import { AmbientDirectionalLightServer } from './scene/ambient-directional-light-server';
import { AxisGridHelperServer } from './scene/axis-grid-helper-server';
import { ShadowModifierServer } from './scene/shadow-modifier-server';
import { AnimationServer } from './scene/roation-animation-server';
import { ShadowPlaneSceneServer } from './scene/shadow-plane-scene-server';
import { RotationAnimation } from './scene/rotation-animation';

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
  const baseObjectServer = new ShadowModifierServer(new CubeSceneServer());
  const animationServer = new AnimationServer(
    baseObjectServer,
    new RotationAnimation()
  );
  const sceneServer = new ShadowPlaneSceneServer(animationServer);
  await renderer.createNewScene(sceneServer);

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

  let previousTimeStamp: number | undefined;
  const animate = (timestamp: number) => {
    const deltaTimeMs = timestamp - (previousTimeStamp ?? timestamp);
    previousTimeStamp = timestamp;
    requestAnimationFrame(animate);
    animationServer.animate(deltaTimeMs);
    renderer.render(cameraControl.camera);
  };
  requestAnimationFrame(animate);
};

const container = document.getElementById('container') as HTMLDivElement;
renderScene(container);
