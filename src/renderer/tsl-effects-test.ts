import { RenderEffects } from './render-effects';
import {
  Camera,
  PostProcessing,
  Renderer,
  Scene,
  UniformNode,
} from 'three/webgpu';
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
import GTAONode, { ao } from 'three/examples/jsm/tsl/display/GTAONode.js';
import { dof } from 'three/examples/jsm/tsl/display/DepthOfFieldNode.js';
import { fxaa } from 'three/examples/jsm/tsl/display/FXAANode.js';
import { GUI } from 'dat.gui';

interface UiProperties {
  focus: number;
  aperture: number;
  maxblur: number;
  distanceExponent: number;
  distanceFallOff: number;
  radius: number;
  scale: number;
  thickness: number;
}

// https://tympanus.net/codrops/2024/10/30/interactive-3d-with-three-js-batchedmesh-and-webgpurenderer/
export class TslEffectsTest implements RenderEffects {
  private _postProcessing?: PostProcessing;
  private _effectController?: Record<string, NodeRepresentation>;
  private _aoPass?: ShaderNodeObject<GTAONode>;
  private _uiProperties: UiProperties = {
    focus: 32.0,
    aperture: 100,
    maxblur: 0.005,
    distanceExponent: 1,
    distanceFallOff: 0.1,
    radius: 0.1,
    scale: 1,
    thickness: 1,
  };

  public dispose(): void {
    this._postProcessing?.dispose();
  }

  public initialize(renderer: Renderer, scene: Scene, camera: Camera) {
    this._postProcessing = new PostProcessing(renderer as Renderer);
    this._effectController = {
      focus: uniform(this._uiProperties.focus),
      aperture: uniform(this._uiProperties.aperture),
      maxblur: uniform(this._uiProperties.maxblur),
    };
    const scenePass = pass(scene, camera);
    scenePass.setMRT(
      mrt({
        output: output,
        normal: transformedNormalView,
      })
    );
    const scenePassColor = scenePass.getTextureNode('output');
    const scenePassNormal = scenePass.getTextureNode('normal');
    const scenePassDepth = scenePass.getTextureNode('depth');
    this._aoPass = ao(scenePassDepth, scenePassNormal, camera);
    this._aoPass.distanceExponent.value = 1;
    this._aoPass.distanceFallOff.value = 0.1;
    this._aoPass.radius.value = 0.1;
    this._aoPass.scale.value = 1.5;
    this._aoPass.thickness.value = 1;
    const blendPassAO = this._aoPass.getTextureNode().mul(scenePassColor);
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

  public async renderAsync() {
    return this._postProcessing?.renderAsync();
  }

  public addUI(gui: GUI): void {
    const dofFolder = gui.addFolder('depth of field');
    dofFolder.add(this._uiProperties, 'focus', 0, 100, 1).onChange((value) => {
      (
        this._effectController?.focus as ShaderNodeObject<UniformNode<number>>
      ).value = value;
    });
    dofFolder
      .add(this._uiProperties, 'aperture', 0, 100, 1)
      .onChange((value) => {
        (
          this._effectController?.aperture as ShaderNodeObject<
            UniformNode<number>
          >
        ).value = value;
      });
    dofFolder
      .add(this._uiProperties, 'maxblur', 0, 0.02, 0.0001)
      .onChange((value) => {
        (
          this._effectController?.maxblur as ShaderNodeObject<
            UniformNode<number>
          >
        ).value = value;
      });
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
  }
}
