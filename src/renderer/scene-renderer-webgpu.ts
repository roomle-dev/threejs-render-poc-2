import { LightServer } from '@/scene/light-server';
import { SceneServer } from '@/scene/scene-server';
import { SceneRenderer } from './scene-renderer';
import { SceneHelperServer } from '@/scene/scene-helper-server';
import {
  Camera,
  NeutralToneMapping,
  Object3D,
  PostProcessing,
  Renderer,
  Scene,
  UniformNode,
} from 'three/webgpu';
import { WebGPURenderer } from 'three/webgpu';
import {
  clamp,
  mrt,
  NodeRepresentation,
  output,
  pass,
  ShaderNodeObject,
  transformedNormalView,
  uniform,
  viewportUV,
} from 'three/tsl';
import { ao } from 'three/examples/jsm/tsl/display/GTAONode.js';
import { dof } from 'three/examples/jsm/tsl/display/DepthOfFieldNode.js';
import { fxaa } from 'three/examples/jsm/tsl/display/FXAANode.js';

export interface SceneRendererWebGPUParameters {
  forceWebGL?: boolean;
}

interface BackendType {
  isWebGPUBackend?: boolean;
  isWebGLBackend?: boolean;
}

export class SceneRendererWebGPU implements SceneRenderer {
  private _renderer: WebGPURenderer;
  private _scene: Scene;
  private _sceneObjects: Object3D[] = [];
  private _postProcessing?: PostProcessing;
  private _effectController?: Record<string, NodeRepresentation>;

  constructor(
    container: HTMLDivElement,
    parameters: SceneRendererWebGPUParameters = {}
  ) {
    this._renderer = new WebGPURenderer({
      antialias: true,
      alpha: true,
      forceWebGL: parameters.forceWebGL ?? false,
    });
    this._renderer.toneMapping = NeutralToneMapping;
    this._renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this._renderer.domElement);
    this._renderer.shadowMap.enabled = true;
    this._scene = new Scene();
  }

  public get domElement(): HTMLElement {
    return this._renderer.domElement;
  }

  public get renderTypeMessage(): string {
    return (
      'WebGPURenderer' +
      ((this._renderer.backend as BackendType).isWebGPUBackend
        ? ' (WebGPU)'
        : ' (WebGL)')
    );
  }

  public get scene(): Scene {
    return this._scene;
  }

  public dispose(): void {
    this._renderer.dispose();
    this._postProcessing?.dispose();
  }

  public setSize(width: number, height: number): void {
    this._renderer.setSize(width, height);
  }

  public async createNewScene(sceneServer: SceneServer): Promise<Object3D[]> {
    const sceneObjects = await sceneServer.create();
    for (const sceneObject of this._sceneObjects) {
      this._scene.remove(sceneObject);
    }
    this._sceneObjects = sceneObjects;
    for (const sceneObject of sceneObjects) {
      this._scene.add(sceneObject);
    }
    return this._sceneObjects;
  }

  public async addLights(lightServer: LightServer): Promise<void> {
    const lights = await lightServer.create();
    lights.forEach((light) => this._scene.add(light));
  }

  public async addHelper(sceneHelperServer: SceneHelperServer): Promise<void> {
    const sceneHelpers = await sceneHelperServer.create();
    sceneHelpers.forEach((sceneHelper) => this._scene.add(sceneHelper));
  }

  public enableEffects(_camera: Camera): void {
    // https://tympanus.net/codrops/2024/10/30/interactive-3d-with-three-js-batchedmesh-and-webgpurenderer/
    this._postProcessing = new PostProcessing(this._renderer as Renderer);

    this._effectController = {
      focus: uniform(32.0),
      aperture: uniform(100),
      maxblur: uniform(0.005),
    };

    const scenePass = pass(this.scene, _camera);
    scenePass.setMRT(
      mrt({
        output: output,
        normal: transformedNormalView,
      })
    );

    const scenePassColor = scenePass.getTextureNode('output');
    const scenePassNormal = scenePass.getTextureNode('normal');
    const scenePassDepth = scenePass.getTextureNode('depth');

    const aoPass = ao(scenePassDepth, scenePassNormal, _camera);
    aoPass.distanceExponent.value = 1;
    aoPass.distanceFallOff.value = 0.1;
    aoPass.radius.value = 0.1;
    aoPass.scale.value = 1.5;
    aoPass.thickness.value = 1;

    const blendPassAO = aoPass.getTextureNode().mul(scenePassColor);
    const scenePassViewZ = scenePass.getViewZNode();
    const dofPass = dof(
      blendPassAO,
      scenePassViewZ,
      this._effectController.focus,
      (
        this._effectController.aperture as ShaderNodeObject<UniformNode<number>>
      ).mul(0.00001),
      this._effectController.maxblur
    );
    const vignetteFactor = clamp(
      viewportUV.sub(0.5).length().mul(1.2),
      0.0,
      1.0
    )
      .oneMinus()
      .pow(0.5);
    this._postProcessing.outputNode = fxaa(dofPass.mul(vignetteFactor));
  }

  public async render(camera: Camera): Promise<void> {
    if (this._postProcessing) {
      await this._postProcessing.renderAsync();
    } else {
      await this._renderer.renderAsync(this.scene, camera);
    }
  }
}
