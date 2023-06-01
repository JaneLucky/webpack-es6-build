import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "@/three/postprocessing/RenderPass.js";
import { ShaderPass } from "@/three/postprocessing/ShaderPass.js";
import { SMAAPass } from "@/three/postprocessing/SMAAPass.js";

import { BSCShader } from "@/three/shaders/BSCShader.js";
import { FXAAShader } from "@/three/shaders/FXAAShader.js";
import { SMAAShader } from "@/three/shaders/SMAAShader.js";
//设置后期
export function RenderPost(_Engine) {
  var _renderPost = new Object();
  //亮度
  _renderPost._Brightness = 1;
  //饱和度
  _renderPost._Saturation = 1;
  //对比度
  _renderPost._Contrast = 1.5;
  //设置渲染器的可见性
  _renderPost.enableRenderPost = function (enable) {
    if (enable) {
      var scene = _Engine.scene;
      var renderer = scene.renderer;
      var camera = scene.camera;
      // 创建后期渲染通道
      var composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      // 添加 RGB 颜色分离效果通道效果
      var effect = new ShaderPass(BSCShader);
      // effect.uniforms[ '_Brightness' ].value = 0.015;
      effect.uniforms["_Brightness"].value = _renderPost._Brightness;
      effect.uniforms["_Saturation"].value = _renderPost._Saturation;
      effect.uniforms["_Contrast"].value = _renderPost._Contrast;
      composer.addPass(effect);

      const smaaPass = new SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
      composer.addPass(smaaPass);
      _renderPost.composer = composer;
    } else {
      _renderPost.composer = null;
    }
  };
  _renderPost.render = function () {
    // if (_renderPost.composer != null) {
    // 	_renderPost.composer.render();
    // }
  };
  return _renderPost;
}
