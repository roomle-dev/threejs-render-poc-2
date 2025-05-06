import { RenderEffects } from './render-effects';
import {
  Camera,
  Mesh,
  MeshPhysicalNodeMaterial,
  PassNode,
  PostProcessing,
  ReflectorNode,
  ReflectorNodeParameters,
  Renderer,
  Scene,
  TextureNode,
  UniformNode,
} from 'three/webgpu';
import {
  mrt,
  NodeRepresentation,
  output,
  pass,
  reflector,
  ShaderNodeObject,
  transformedNormalView,
  uniform,
} from 'three/tsl';
import GTAONode, { ao } from 'three/examples/jsm/tsl/display/GTAONode.js';
import FXAANode, { fxaa } from 'three/examples/jsm/tsl/display/FXAANode.js';
import { GUI } from 'dat.gui';

interface UiProperties {
  distanceExponent: number;
  distanceFallOff: number;
  radius: number;
  scale: number;
  thickness: number;
  reflection: number;
}

// https://tympanus.net/codrops/2024/10/30/interactive-3d-with-three-js-batchedmesh-and-webgpurenderer/
export class TslEffects implements RenderEffects {
  private _postProcessing?: PostProcessing;
  private _effectController: Map<string, NodeRepresentation> = new Map();
  private _scenePass?: ShaderNodeObject<PassNode>;
  private _groundReflection?: ShaderNodeObject<ReflectorNode>;
  private _aoPass?: ShaderNodeObject<GTAONode>;
  private _uiProperties: UiProperties = {
    distanceExponent: 1,
    distanceFallOff: 0.1,
    radius: 0.1,
    scale: 1,
    thickness: 1,
    reflection: 0.5,
  };

  get isValid(): boolean {
    return true;
  }

  get renderStatusMessage(): string {
    return 'TSL Effects Test';
  }

  public dispose(): void {
    this._postProcessing?.dispose();
    this._scenePass?.dispose();
    this._aoPass?.dispose();
  }

  public initialize(renderer: Renderer, scene: Scene, camera: Camera) {
    this._postProcessing = new PostProcessing(renderer as Renderer);
    const scenePass = pass(scene, camera);
    scenePass.setMRT(
      mrt({
        output: output,
        normal: transformedNormalView,
      })
    );
    const blendPassAO = this._createAO(scenePass, camera);
    this._postProcessing.outputNode = this._createFxAA(blendPassAO);
  }

  private _createGroundReflection(scene: Scene) {
    const reflectionPlane = this._findReflectionPlane(scene);
    if (!reflectionPlane) {
      return;
    }
    if (!(reflectionPlane.material instanceof MeshPhysicalNodeMaterial)) {
      return;
    }
    const reflectionMaterial =
      reflectionPlane.material as MeshPhysicalNodeMaterial;
    if (!reflectionMaterial.colorNode) {
      return;
    }
    const reflectionUniform = uniform(this._uiProperties.reflection);
    this._effectController.set('reflection', reflectionUniform);
    const prams: ReflectorNodeParameters = {
      resolution: 0.5,
      bounces: false,
      generateMipmaps: false,
    };
    this._groundReflection?.dispose();
    this._groundReflection = reflector(prams);
    this._groundReflection.target.rotateX(-Math.PI / 2);
    const groundReflectionColor =
      reflectionMaterial.colorNode as ShaderNodeObject<TextureNode>;
    reflectionMaterial.colorNode = groundReflectionColor.add(
      groundReflectionColor.mul(this._groundReflection).mul(reflectionUniform)
    );
    scene.add(this._groundReflection.target);
  }

  private _findReflectionPlane(scene: Scene): Mesh | null {
    let groundForReflection: Mesh | null = null;
    scene.traverse((node) => {
      if (node instanceof Mesh && node.userData?.groundForReflection) {
        groundForReflection = node;
      }
    });
    return groundForReflection;
  }

  private _createAO(
    scenePass: ShaderNodeObject<PassNode>,
    camera: Camera
  ): NodeRepresentation {
    const scenePassColor = scenePass.getTextureNode('output');
    const scenePassNormal = scenePass.getTextureNode('normal');
    const scenePassDepth = scenePass.getTextureNode('depth');
    this._aoPass = ao(scenePassDepth, scenePassNormal, camera);
    this._aoPass.distanceExponent.value = 1;
    this._aoPass.distanceFallOff.value = 0.1;
    this._aoPass.radius.value = 0.1;
    this._aoPass.scale.value = 1.5;
    this._aoPass.thickness.value = 1;
    return this._aoPass.getTextureNode().mul(scenePassColor);
  }

  private _createFxAA(
    parentNode: NodeRepresentation
  ): ShaderNodeObject<FXAANode> {
    return fxaa(parentNode);
  }

  public updateScene(renderer: Renderer, scene: Scene, camera: Camera): void {
    if (!this._postProcessing) {
      this.initialize(renderer, scene, camera);
    }
    if (this._postProcessing) {
      this._createGroundReflection(scene);
    }
    if (this._scenePass) {
      this._scenePass.scene = scene;
      this._scenePass.camera = camera;
    }
  }

  public updateEnvironment(
    _renderer: Renderer,
    _scene: Scene,
    _camera: Camera
  ): void {
    // nothing to do
  }

  public updateCamera(
    _renderer: Renderer,
    _scene: Scene,
    _camera: Camera
  ): void {
    // nothing to do
  }

  public updateLights(
    _renderer: Renderer,
    _scene: Scene,
    _camera: Camera,
    _enabled: boolean
  ): void {
    // nothing to do
  }

  public async renderAsync() {
    return this._postProcessing?.renderAsync();
  }

  public addUI(gui: GUI): void {
    const aoFolder = gui.addFolder('ambient occlusion');
    aoFolder
      .add(this._uiProperties, 'distanceExponent', 0, 2, 0.1)
      .onChange((value) => {
        if (this._aoPass) {
          this._aoPass.distanceExponent.value = value;
        }
      });
    aoFolder
      .add(this._uiProperties, 'distanceFallOff', 0, 1, 0.1)
      .onChange((value) => {
        if (this._aoPass) {
          this._aoPass.distanceFallOff.value = value;
        }
      });
    aoFolder.add(this._uiProperties, 'radius', 0, 1, 0.01).onChange((value) => {
      if (this._aoPass) {
        this._aoPass.radius.value = value;
      }
    });
    aoFolder.add(this._uiProperties, 'scale', 0, 2, 0.1).onChange((value) => {
      if (this._aoPass) {
        this._aoPass.scale.value = value;
      }
    });
    aoFolder
      .add(this._uiProperties, 'thickness', 0, 2, 0.1)
      .onChange((value) => {
        if (this._aoPass) {
          this._aoPass.thickness.value = value;
        }
      });
    const reflectionFolder = gui.addFolder('ground reflection');
    reflectionFolder
      .add(this._uiProperties, 'reflection', 0, 1, 0.01)
      .onChange((value) => {
        if (this._effectController.has('reflection')) {
          const reflectionUniform = this._effectController.get(
            'reflection'
          ) as ShaderNodeObject<UniformNode<number>>;
          reflectionUniform.value = value;
        }
      });
  }
}
