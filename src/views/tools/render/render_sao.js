const THREE = require('three')
//设置AO阴影
import {
	EffectComposer
} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {
	RenderPass
} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {
	SAOPass
} from '@/three/postprocessing/SAOPass.js';
export function RenderSAO(bimengine) {
	var _renderSAO = new Object();
	//设置参数


	//设置参数
	_renderSAO.enableRenderSAO = function(enable) {
		var scene = bimengine.scene;
		var renderer = scene.renderer;
		var camera = scene.camera;
		if (enable == false) {
			bimengine.RenderSAO.saoPass.enabled=false
			return;
		}
		var composer = new EffectComposer(renderer);
		var renderPass = new RenderPass(scene, camera);
		composer.addPass(renderPass);
		var saoPass = new SAOPass(scene, camera, false, true);
		_renderSAO.saoPass = saoPass;
		composer.addPass(saoPass);
		_renderSAO.composer = composer;
		window.addEventListener('resize', onWindowResize);

		saoPass.saoBias = 5;
		saoPass.saoKernelRadius = 20;

		function onWindowResize() {

			const width = window.innerWidth || 1;
			const height = window.innerHeight || 1;

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);

			composer.setSize(width, height);


		}
	}
	_renderSAO.render = function() {
		if (_renderSAO.composer != null) {
			_renderSAO.composer.render();
		}
	}
	return _renderSAO;
}
