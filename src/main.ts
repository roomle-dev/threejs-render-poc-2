import { CubeSceneServer } from './scene/cube-scene-server';
import { StaticPerspectiveCamera } from './camera/static-perspective-camera';
import { CameraOrbitControls } from './camera/camera-orbit-controls';
import { DefaultLightServer } from './scene/default-light-server';
import { AxisGridHelperServer } from './scene/axis-grid-helper-server';
import { ShadowModifierServer } from './scene/shadow-modifier-server';
import { AnimationServer } from './scene/roation-animation-server';
import { ShadowPlaneSceneServer } from './scene/shadow-plane-scene-server';
import { RotationAnimation } from './scene/rotation-animation';
import { SceneRenderer } from './renderer/scene-renderer';
import { SceneRendererWebGPU } from './renderer/scene-renderer-webgpu';
import { SceneRendererWebGL } from './renderer/scene-renderer-webgl';
import Stats from 'three/examples/jsm/libs/stats.module.js';

interface UrlParameters {
  type: string;
}

const queryString = window.location.search;
const urlSearchParams = new URLSearchParams(queryString);
const urlParameters: UrlParameters = {
  type: (urlSearchParams.get('type') as string | undefined) ?? 'webgl',
};
const container = document.getElementById('container') as HTMLDivElement;

const setStatus = (message: string, color: string = '#000000') => {
  console.log(`Status information: ${message}`);
  const statusLine = document.getElementById('status-line');
  if (!statusLine) {
    return;
  }
  statusLine.innerText = message;
  statusLine.style.setProperty('color', color);
};

const renderScene = async (
  container: HTMLDivElement,
  urlParameters: UrlParameters
) => {
  let renderer: SceneRenderer;
  switch (urlParameters.type) {
    default:
    case 'webgl':
      renderer = new SceneRendererWebGL(container);
      break;
    case 'webgpu':
      renderer = new SceneRendererWebGPU(container, {});
      break;
    case 'webgpu-forcewebgl':
      renderer = new SceneRendererWebGPU(container, { forceWebGL: true });
      break;
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  const cameraControl = new CameraOrbitControls(
    new StaticPerspectiveCamera(window.innerWidth / window.innerHeight),
    container
  );
  const lightServer = new DefaultLightServer();
  await renderer.addLights(lightServer);
  const sceneHelperServer = new AxisGridHelperServer();
  await renderer.addHelper(sceneHelperServer);
  const baseObjectServer = new ShadowModifierServer(new CubeSceneServer());
  const animationServer = new AnimationServer(
    baseObjectServer,
    new RotationAnimation()
  );
  const sceneServer = new ShadowPlaneSceneServer(animationServer, {
    usePhysicalMaterial: urlParameters.type !== 'webgl',
  });
  await renderer.createNewScene(sceneServer);

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  setStatus(renderer.renderTypeMessage);
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
    stats.update();
  };
  animate(0);
};

renderScene(container, urlParameters);
