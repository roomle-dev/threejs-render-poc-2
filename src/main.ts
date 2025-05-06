import { StaticPerspectiveCamera } from './camera/static-perspective-camera';
import { CameraOrbitControls } from './camera/camera-orbit-controls';
import { DefaultLightFactory } from './scene/default-light-factory';
import { AxisGridHelperFactory } from './scene/axis-grid-helper-factory';
import { SceneRenderer } from './renderer/scene-renderer';
import { SceneRendererWebGPU } from './renderer/scene-renderer-webgpu';
import { SceneRendererWebGL } from './renderer/scene-renderer-webgl';
import { setupDragDrop } from './util/drag-target';
import {
  getNameFromResourceName,
  roomleSceneFactory,
} from './scene/scene-factories';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {
  AxesHelper,
  Color,
  DataTexture,
  EquirectangularReflectionMapping,
  GridHelper,
  HemisphereLight,
} from 'three/webgpu';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { TslEffects } from './renderer/tsl-effects';
import { GUI } from 'dat.gui';
import { WebGLPathTracerEffect } from './renderer/webgl-path-tracer-effect';
import { PathTraceDefaultLightFactory } from './scene/path-trace-default-light-factory';
import { SceneObject } from './scene/scene-factory';
import { SceneCache } from './roomle-threejs-loader/src/scene/scene-cache';

const khronosAssetsUrl =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/refs/heads/main/Models/';

const khronosGlbAssets = [
  'AnisotropyBarnLamp',
  'AntiqueCamera',
  'Avocado',
  'BarramundiFish',
  'BoomBox',
  'BrainStem',
  'ChairDamaskPurplegold',
  'CommercialRefrigerator',
  'Corset',
  'DamagedHelmet',
  'DragonAttenuation',
  'DragonDispersion',
  'Duck',
  'GlamVelvetSofa',
  'GlassBrokenWindow',
  'GlassHurricaneCandleHolder',
  'GlassVaseFlowers',
  'IridescenceAbalone',
  'IridescenceLamp',
  'IridescenceSuzanne',
  'IridescentDishWithOlives',
  'Lantern',
  'LightsPunctualLamp',
  'MaterialsVariantsShoe',
  'MosquitoInAmber',
  'PotOfCoalsAnimationPointer',
  'SheenChair',
  'SheenWoodLeatherSofa',
  'SunglassesKhronos',
  'ToyCar',
  'WaterBottle',
];

const rabbid76AssetsUrl =
  'https://raw.githubusercontent.com/Rabbid76/assets-materials-models/main/';

const rabbid76GlbAssets = [
  'FlightHelmet',
  'SciFiHelmet',
  'SheenCloth',
  'StainedGlassLamp',
];

const glbUrls = [
  ...khronosGlbAssets.map(
    (asset) => `${khronosAssetsUrl}${asset}/glTF-Binary/${asset}.glb`
  ),
  ...rabbid76GlbAssets.map(
    (asset) => `${rabbid76AssetsUrl}assets/models/glb/${asset}.glb`
  ),
];

const rabbid76environmentMaps = [
  'belfast_farmhouse_4k.hdr',
  'qwantani_puresky_4k.hdr',
  'studio_small_09_4k.hdr',
  'syferfontein_1d_clear_4k.hdr',
];

const environmentMaps = [
  ...rabbid76environmentMaps.map(
    (asset) => `${rabbid76AssetsUrl}assets/environment-maps/${asset}`
  ),
];

glbUrls.sort((a: string, b: string) => {
  return getNameFromResourceName(a).localeCompare(getNameFromResourceName(b));
});

environmentMaps.sort((a: string, b: string) => {
  return getNameFromResourceName(a).localeCompare(getNameFromResourceName(b));
});

const settings = {
  glb: '',
  envMap: '',
  'grid helper': false,
};

interface UrlParameters {
  type: string;
  id: string;
}

const queryString = window.location.search;
const urlSearchParams = new URLSearchParams(queryString);
const urlParameters: UrlParameters = {
  type: (urlSearchParams.get('type') as string | undefined) ?? 'webgpu',
  id:
    (urlSearchParams.get('id') as string | undefined) ??
    'usm:frame:9C4BC73D19BAAD07675CDDEA721F493BB126939392FF80318204B089BD55C71A',
};
const container = document.getElementById('container') as HTMLDivElement;

const renderScene = async (
  container: HTMLDivElement,
  urlParameters: UrlParameters
) => {
  const renderer = await newRenderer(urlParameters.type, container);
  const dracoLoader = newDracoLoader();
  const sceneCache = new SceneCache(dracoLoader, undefined, () => {});
  const cameraControl = newCameraControl(container, renderer);
  const sceneFactory = roomleSceneFactory(
    urlParameters.type,
    urlParameters.id,
    sceneCache
  );
  const sceneObject = await renderer.createNewScene(sceneFactory);
  if (
    urlParameters.type === 'webgpu' ||
    urlParameters.type === 'webgpu-forcewebgl'
  ) {
    renderer.addEffects(new TslEffects());
  } else if (urlParameters.type === 'webgl') {
    renderer.addEffects(new WebGLPathTracerEffect());
  }

  const exrLoader = new EXRLoader();
  const rgbeLoader = new RGBELoader();
  const loadNewGlbScene = (resource: string) =>
    loadGlb(renderer, resource, sceneCache, sceneObject);
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
      loadNewGlbScene(resource);
    }
  };
  const loadNewResource = (resource: string) => {
    loadResource(resource, resource);
  };
  const switchHelperVisibility = (visible: boolean) => {
    renderer.scene.traverse((node) => {
      if (node instanceof GridHelper) {
        node.visible = visible;
      } else if (node instanceof AxesHelper) {
        node.visible = visible;
      }
    });
  };

  setupDragDrop(
    'holder',
    'hover',
    (file: File, event: ProgressEvent<FileReader>) => {
      loadResource(file.name, event.target?.result);
    }
  );

  const stats = newStats();
  const gui = new GUI();
  addGui(gui, urlParameters, renderer, loadNewResource, switchHelperVisibility);
  addResizeEventListener(cameraControl, renderer);
  const animate = newAnimationLoop(renderer, cameraControl, sceneObject, stats);
  animate();
  loadNewResource(environmentMaps[2]);
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
    rendererType === 'webgl'
      ? new PathTraceDefaultLightFactory()
      : new DefaultLightFactory()
  );
  if (rendererType !== 'webgl') {
    await renderer.addHelper(new AxisGridHelperFactory());
  }
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
  sceneObject: SceneObject,
  stats: Stats
) => {
  let previousTimeStamp: number | undefined;
  const animate = (timestamp: number = 0) => {
    const deltaTimeMs = timestamp - (previousTimeStamp ?? timestamp);
    previousTimeStamp = timestamp;
    requestAnimationFrame(animate);
    for (const animationServer of sceneObject.animations) {
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

const newDracoLoader = (): DRACOLoader => {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  dracoLoader.setDecoderConfig({ type: 'wasm' });
  return dracoLoader;
};

const loadGlb = async (
  renderer: SceneRenderer,
  resource: string,
  sceneCache: SceneCache,
  scneeObject: SceneObject
) => {
  const newSceneFactory = roomleSceneFactory(
    urlParameters.type,
    resource,
    sceneCache
  );
  renderer.createNewScene(newSceneFactory).then((newSceneObject) => {
    scneeObject.objects.length = 0;
    scneeObject.animations.length = 0;
    scneeObject.objects.push(...newSceneObject.objects);
    scneeObject.animations.push(...newSceneObject.animations);
  });
};

const newStats = (): Stats => {
  const stats = new Stats();
  document.body.appendChild(stats.dom);
  return stats;
};

const addGui = (
  gui: GUI,
  urlParameters: UrlParameters,
  renderer: SceneRenderer,
  loadNewResource: (resource: string) => void,
  switchHelperVisibility: (visible: boolean) => void
) => {
  addGlbGui(gui, loadNewResource);
  addEnvironmentMapGui(gui, loadNewResource);
  addHelperGui(gui, switchHelperVisibility);
  renderer.addUI(gui);
  if (urlParameters.type !== 'webgl') {
    for (const hemisphereLight of renderer.scene.children.filter(
      (child) => child instanceof HemisphereLight
    )) {
      addHemisphereLightGui(gui, renderer, hemisphereLight as HemisphereLight);
      break;
    }
  }
};

const addGlbGui = (gui: GUI, loadGlb: (resource: string) => void) => {
  gui.add(settings, 'glb', getScenesForUI()).onChange((value) => {
    if (value !== '') {
      loadGlb(value);
    }
  });
};

const addEnvironmentMapGui = (
  gui: GUI,
  loadEnvironmentMap: (resource: string) => void
) => {
  gui.add(settings, 'envMap', getEnvironmentForUI()).onChange((value) => {
    if (value !== '') {
      loadEnvironmentMap(value);
    }
  });
};

const addHelperGui = (
  gui: GUI,
  switchHelperVisibility: (visible: boolean) => void
) => {
  if (urlParameters.type === 'webgl') {
    return;
  }
  gui.add(settings, 'grid helper').onChange((value) => {
    if (value !== '') {
      switchHelperVisibility(value);
    }
  });
};

const getScenesForUI = () => {
  const configuratorMenuItems = Object.assign(
    {},
    ...glbUrls.map((url: string) => ({
      [getNameFromResourceName(url)]: url,
    }))
  );
  return configuratorMenuItems;
};

const getEnvironmentForUI = () => {
  const configuratorMenuItems = Object.assign(
    {},
    ...environmentMaps.map((url: string) => ({
      [getNameFromResourceName(url)]: url,
    }))
  );
  return configuratorMenuItems;
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
  hemisphereLightGui.add(hemisphereLight, 'intensity', 0, 10).onChange(() => {
    renderer.sceneHasChanged = true;
  });
};

renderScene(container, urlParameters);
