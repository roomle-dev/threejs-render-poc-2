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
import { ao } from 'three/examples/jsm/tsl/display/GTAONode.js';
import { dof } from 'three/examples/jsm/tsl/display/DepthOfFieldNode.js';
import { fxaa } from 'three/examples/jsm/tsl/display/FXAANode.js';

// https://tympanus.net/codrops/2024/10/30/interactive-3d-with-three-js-batchedmesh-and-webgpurenderer/
export class TslEffectsTest implements RenderEffects {
  private _postProcessing?: PostProcessing;
  private _effectController?: Record<string, NodeRepresentation>;

  public dispose(): void {
    this._postProcessing?.dispose();
  }

  public initialize(renderer: Renderer, scene: Scene, camera: Camera) {
    this._postProcessing = new PostProcessing(renderer as Renderer);

    this._effectController = {
      focus: uniform(32.0),
      aperture: uniform(100),
      maxblur: uniform(0.005),
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

    const aoPass = ao(scenePassDepth, scenePassNormal, camera);
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

  public async renderAsync() {
    return this._postProcessing?.renderAsync();
  }
}
