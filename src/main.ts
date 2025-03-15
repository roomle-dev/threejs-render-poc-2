import { StaticPerspectiveCamera } from './camera/static-perspective-camera';
import { CameraOrbitControls } from './camera/camera-orbit-controls';
import { DefaultLightFactory } from './scene/default-light-factory';
import { AxisGridHelperFactory } from './scene/axis-grid-helper-factory';
import { SceneRenderer } from './renderer/scene-renderer';
import { SceneRendererWebGPU } from './renderer/scene-renderer-webgpu';
import { SceneRendererWebGL } from './renderer/scene-renderer-webgl';
import { setupDragDrop } from './util/drag-target';
import {
  glbSceneFactory,
  rotatingCubeFactory,
  SceneFactoryObjects,
} from './scene/scene-factories';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {
  Color,
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
import { WebGLPathTracerEffect } from './renderer/webgl-path-tracer-effect';
import { PathTraceDefaultLightFactory } from './scene/path-trace-default-light-factory';

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
  const SceneFactoryObjects = rotatingCubeFactory(urlParameters.type);
  await renderer.createNewScene(SceneFactoryObjects.SceneFactory);
  if (
    urlParameters.type === 'webgpu' ||
    urlParameters.type === 'webgpu-forcewebgl'
  ) {
    renderer.addEffects(new TslEffectsTest());
  } else if (urlParameters.type === 'webgl') {
    renderer.addEffects(new WebGLPathTracerEffect());
  }
  const stats = newStats();
  const gui = new GUI();
  addGui(gui, renderer);
  addResizeEventListener(cameraControl, renderer);
  const animate = newAnimationLoop(
    renderer,
    cameraControl,
    SceneFactoryObjects,
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
      void loadGlb(renderer, resource, gbLoader, SceneFactoryObjects);
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

const setStatus = (
  message: string,
  color: string = '#000000',
  log: boolean = true
) => {
  if (log) {
    console.log(`Status information: ${message}`);
  }
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
  await renderer.addLights(
    rendererType == 'webgl'
      ? new PathTraceDefaultLightFactory()
      : new DefaultLightFactory()
  );
  await renderer.addHelper(new AxisGridHelperFactory());
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
  SceneFactoryObjects: SceneFactoryObjects,
  stats: Stats
) => {
  let previousTimeStamp: number | undefined;
  const animate = (timestamp: number = 0) => {
    const deltaTimeMs = timestamp - (previousTimeStamp ?? timestamp);
    previousTimeStamp = timestamp;
    requestAnimationFrame(animate);
    for (const animationServer of SceneFactoryObjects.animationServer) {
      animationServer.animate(deltaTimeMs);
    }
    renderer.render(cameraControl.camera);
    stats.update();
    setStatus(renderer.renderStatusMessage, '#000000', false);
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
  equirectTexture.mapping = EquirectangularReflectionMapping;
  renderer.setEnvironmentMap(equirectTexture);
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
  SceneFactoryObjects: SceneFactoryObjects
) => {
  const newSceneFactoryObjects = glbSceneFactory(
    urlParameters.type,
    resource,
    gbLoader
  );
  renderer.createNewScene(newSceneFactoryObjects.SceneFactory).then(() => {
    SceneFactoryObjects.SceneFactory = newSceneFactoryObjects.SceneFactory;
    SceneFactoryObjects.animationServer.length = 0;
    SceneFactoryObjects.animationServer.push(
      ...newSceneFactoryObjects.animationServer
    );
  });
};

const newStats = (): Stats => {
  const stats = new Stats();
  document.body.appendChild(stats.dom);
  return stats;
};

const addGui = (gui: GUI, renderer: SceneRenderer) => {
  renderer.addUI(gui);
  for (const hemisphereLight of renderer.scene.children.filter(
    (child) => child instanceof HemisphereLight
  )) {
    addHemisphereLightGui(gui, renderer, hemisphereLight as HemisphereLight);
    break;
  }
};

const addHemisphereLightGui = (
  gui: GUI,
  renderer: SceneRenderer,
  hemisphereLight: HemisphereLight
) => {
  hemisphereLight.userData.color = new Color(
    hemisphereLight.color.r * 255,
    hemisphereLight.color.g * 255,
    hemisphereLight.color.b * 255
  );
  hemisphereLight.userData.groundColor = new Color(
    hemisphereLight.groundColor.r * 255,
    hemisphereLight.groundColor.g * 255,
    hemisphereLight.groundColor.b * 255
  );
  const hemisphereLightGui = gui.addFolder('Hemisphere Light');
  hemisphereLightGui
    .addColor(hemisphereLight.userData, 'color')
    .onChange(() => {
      hemisphereLight.color.set(
        new Color(
          hemisphereLight.userData.color.r / 255,
          hemisphereLight.userData.color.g / 255,
          hemisphereLight.userData.color.b / 255
        )
      );
      renderer.sceneHasChanged = true;
    });
  hemisphereLightGui
    .addColor(hemisphereLight.userData, 'groundColor')
    .onChange(() => {
      hemisphereLight.groundColor.set(
        new Color(
          hemisphereLight.userData.groundColor.r / 255,
          hemisphereLight.userData.groundColor.g / 255,
          hemisphereLight.userData.groundColor.b / 255
        )
      );
      renderer.sceneHasChanged = true;
    });
  hemisphereLightGui.add(hemisphereLight, 'intensity', 0, 2).onChange(() => {
    renderer.sceneHasChanged = true;
  });
};

renderScene(container, urlParameters);
