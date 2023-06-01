const THREE = require("@/three/three.js");
//设置AO阴影
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { SAOPass } from "@/three/postprocessing/SAOPass.js";
import { SSAOPass } from "@/three/postprocessing/SSAOPass.js";
import { CopyShader } from "@/three/shaders/CopyShader.js";
import { SSAOShader } from "@/three/shaders/SSAOShader.js";
export function RenderSAO(_Engine) {
  var _renderSAO = new Object();
  //设置参数

  // _renderSAO.enableRenderSAO = function(enable) {
  // 	var scene = _Engine.scene;
  // 	var camera = scene.camera;
  // 	const ssaoPass = new SSAOPass(scene, camera);
  // 	ssaoPass.kernelRadius = 16;
  // 	ssaoPass.minDistance = 0.005;
  // 	ssaoPass.maxDistance = 0.1;
  // 	_renderSAO.ssaoPass = ssaoPass;
  // }
  // _renderSAO.render = function() {
  // 	if (_renderSAO.ssaoPass != null) {
  // 		_renderSAO.ssaoPass.render(_Engine.scene.renderer);
  // 	}
  // }
  //设置参数
  _renderSAO.enableRenderSAO = function (enable) {
    // var scene = _Engine.scene;
    // var camera = scene.camera;
    // var renderer = scene.renderer;

    // var composer = new EffectComposer(renderer);
    // const height = window.innerHeight || 1;
    // const width = window.innerWidth || 1;
    // const ssaoPass = new SSAOPass(scene, camera, width, height);
    // ssaoPass.kernelRadius = 32;
    // composer.addPass(ssaoPass);
    // _renderSAO.composer = composer;
    // composer.setSize( width, height );
    // The shader pass to draw the scene
    // var renderScenePass = new RenderPass(scene, camera);
    // // Copy to screen render pass
    // var copyToScreenPass = new ShaderPass(CopyShader);
    // copyToScreenPass.renderToScreen = true;
    // // SSAO render pass
    // 	const width = window.innerWidth || 1;
    // 	const height = window.innerHeight || 1;
    // var renderTargetParametersRGB = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
    // var renderTargetParametersRGBA = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat };
    // var depthTarget = new THREE.WebGLRenderTarget(width, height, renderTargetParametersRGBA);
    // var colorTarget = new THREE.WebGLRenderTarget(width, height, renderTargetParametersRGB);
    // var effectSSAO = new ShaderPass(SSAOShader);
    // effectSSAO.uniforms['tDepth'].texture = depthTarget;
    // // effectSSAO.uniforms['size'].value.set(width, height);
    // effectSSAO.uniforms['cameraNear'].value = camera.near; // 1
    // effectSSAO.uniforms['cameraFar'].value = camera.far; // 1000
    // //effectSSAO.uniforms.onlyAO.value = 1;
    // // Setup post processing chain
    // var composer = new EffectComposer(renderer, colorTarget);
    // composer.addPass(effectSSAO);
    // composer.addPass(copyToScreenPass);
    // // Depth pass
    // var depthPassPlugin = new DepthPassPlugin();
    // depthPassPlugin.renderTarget = depthTarget;
    // renderer.addPrePlugin(depthPassPlugin);

    var scene = _Engine.scene;
    var renderer = scene.renderer;
    var camera = scene.camera;
    if (enable == false) {
      _Engine.RenderSAO.saoPass.enabled = false;
      return;
    }
    var composer = new EffectComposer(renderer);
    var renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    var saoPass = new SAOPass(scene, camera, false, false);
    _renderSAO.saoPass = saoPass;
    composer.addPass(saoPass);
    _renderSAO.composer = composer;
    window.addEventListener("resize", onWindowResize);
    function onWindowResize() {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    }
  };
  _renderSAO.render = function () {
    if (_renderSAO.composer != null) {
      _renderSAO.composer.render();
    }
  };
  return _renderSAO;
}
