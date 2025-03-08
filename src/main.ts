import { StaticPerspectiveCamera } from './camera/static-perspective-camera';
import { CameraOrbitControls } from './camera/camera-orbit-controls';
import { DefaultLightServer } from './scene/default-light-server';
import { AxisGridHelperServer } from './scene/axis-grid-helper-server';
import { SceneRenderer } from './renderer/scene-renderer';
import { SceneRendererWebGPU } from './renderer/scene-renderer-webgpu';
import { SceneRendererWebGL } from './renderer/scene-renderer-webgl';
import { setupDragDrop } from './util/drag-target';
import {
  glbServer,
  rotatingCubeServer,
  SceneServerObjects,
} from './scene/scene-servers';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {
  DataTexture,
  EquirectangularReflectionMapping,
  HemisphereLight,
} from 'three/webgpu';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { TslEffectsTest } from './renderer/tsl-effects-test';
import { GUI } from 'dat.gui';
import { WebGLPathTracer } from './renderer/webgl-path-tracer';

interface UrlParameters {
  type: string;
}

const queryString = window.location.search;
const urlSearchParams = new URLSearchParams(queryString);
const urlParameters: UrlParameters = {
  type: (urlSearchParams.get('type') as string | undefined) ?? 'webgl',
};
const container = document.getElementById('container') as HTMLDivElement;

const renderScene = async (
  container: HTMLDivElement,
  urlParameters: UrlParameters
) => {
  const renderer = await newRenderer(urlParameters.type, container);
  const cameraControl = newCameraControl(container, renderer);
  const sceneServerObjects = rotatingCubeServer(urlParameters.type);
  await renderer.createNewScene(sceneServerObjects.sceneServer);
  if (
    urlParameters.type === 'webgpu' ||
    urlParameters.type === 'webgpu-forcewebgl'
  ) {
    renderer.addEffects(new TslEffectsTest());
  } else if (urlParameters.type === 'webgl') {
    renderer.addEffects(new WebGLPathTracer());
  }
  const stats = newStats(renderer);
  const gui = new GUI();
  renderer.addUI(gui);
  addResizeEventListener(cameraControl, renderer);
  const animate = newAnimationLoop(
    renderer,
    cameraControl,
    sceneServerObjects,
    stats
  );
  animate();

  const gbLoader = newGlbLoader();
  const exrLoader = new EXRLoader();
  const rgbeLoader = new RGBELoader();
  const loadResource = (
    resourceName: string,
    resource: string | ArrayBuffer | null | undefined
  ) => {
    if (typeof resource !== 'string') {
      console.error('Resource is not a string');
      return;
    }
    const lowerName = resourceName.toLowerCase();
    if (lowerName.endsWith('.exr')) {
      loadExr(renderer, resource, exrLoader);
    } else if (lowerName.endsWith('.hdr')) {
      loadHdr(renderer, resource, rgbeLoader);
    } else if (lowerName.endsWith('.glb') || lowerName.endsWith('.gltf')) {
      void loadGlb(renderer, resource, gbLoader, sceneServerObjects);
    }
  };
  setupDragDrop(
    'holder',
    'hover',
    (file: File, event: ProgressEvent<FileReader>) => {
      loadResource(file.name, event.target?.result);
    }
  );
};

const setStatus = (message: string, color: string = '#000000') => {
  console.log(`Status information: ${message}`);
  const statusLine = document.getElementById('status-line');
  if (!statusLine) {
    return;
  }
  statusLine.innerText = message;
  statusLine.style.setProperty('color', color);
};

const newRenderer = async (
  rendererType: string,
  container: HTMLDivElement
): Promise<SceneRenderer> => {
  let renderer: SceneRenderer;
  switch (rendererType) {
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
  await renderer.addLights(new DefaultLightServer());
  await renderer.addHelper(new AxisGridHelperServer());
  return renderer;
};

const newCameraControl = (
  container: HTMLDivElement,
  renderer: SceneRenderer
): CameraOrbitControls => {
  const cameraControl = new CameraOrbitControls(
    new StaticPerspectiveCamera(window.innerWidth / window.innerHeight),
    container
  );
  cameraControl.addCameraChangedListener(() => renderer.cameraHasChanged());
  return cameraControl;
};

const newAnimationLoop = (
  renderer: SceneRenderer,
  cameraControl: CameraOrbitControls,
  sceneServerObjects: SceneServerObjects,
  stats: Stats
) => {
  let previousTimeStamp: number | undefined;
  const animate = (timestamp: number = 0) => {
    const deltaTimeMs = timestamp - (previousTimeStamp ?? timestamp);
    previousTimeStamp = timestamp;
    requestAnimationFrame(animate);
    for (const animationServer of sceneServerObjects.animationServer) {
      animationServer.animate(deltaTimeMs);
    }
    renderer.render(cameraControl.camera);
    stats.update();
  };
  return animate;
};

const addResizeEventListener = (
  cameraControl: CameraOrbitControls,
  renderer: SceneRenderer
) => {
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
};

const setEnvironmentMap = (
  renderer: SceneRenderer,
  equirectTexture: DataTexture,
  _textureData: object
) => {
  //scene.backgroundBlurriness = 1; // @TODO: Needs PMREM
  for (const hemisphereLight of renderer.scene.children.filter(
    (child) => child instanceof HemisphereLight
  )) {
    renderer.scene.remove(hemisphereLight);
  }
  equirectTexture.mapping = EquirectangularReflectionMapping;
  renderer.scene.background = equirectTexture;
  renderer.scene.environment = equirectTexture;
};

const loadExr = (
  renderer: SceneRenderer,
  resource: string,
  exrLoader: EXRLoader
) => {
  exrLoader.load(resource, (texture, textureData) =>
    setEnvironmentMap(renderer, texture, textureData)
  );
};

const loadHdr = (
  renderer: SceneRenderer,
  resource: string,
  hdrLoader: RGBELoader
) => {
  hdrLoader.load(resource, (texture, textureData) =>
    setEnvironmentMap(renderer, texture, textureData)
  );
};

const newGlbLoader = (): GLTFLoader => {
  const gbLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  dracoLoader.setDecoderConfig({ type: 'wasm' });
  gbLoader.setDRACOLoader(dracoLoader);
  return gbLoader;
};

const loadGlb = async (
  renderer: SceneRenderer,
  resource: string,
  gbLoader: GLTFLoader,
  sceneServerObjects: SceneServerObjects
) => {
  const newSceneServerObjects = glbServer(
    urlParameters.type,
    resource,
    gbLoader
  );
  renderer.createNewScene(newSceneServerObjects.sceneServer).then(() => {
    sceneServerObjects.sceneServer = newSceneServerObjects.sceneServer;
    sceneServerObjects.animationServer.length = 0;
    sceneServerObjects.animationServer.push(
      ...newSceneServerObjects.animationServer
    );
  });
};

const newStats = (renderer: SceneRenderer): Stats => {
  const stats = new Stats();
  document.body.appendChild(stats.dom);
  setStatus(renderer.renderTypeMessage);
  return stats;
};

renderScene(container, urlParameters);
