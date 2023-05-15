const THREE = require('@/three/three.js')
import * as BufferGeometryUtils from "@/three/utils/BufferGeometryUtils.js"
import {
	BIMEngine
} from "../BIMEngine";
export function EngineRay(_Engine) {
	var _engineRay = new Object();
	_engineRay.isActive = false; //是否激活
	let AnimationFrame;

	let scene = _Engine.scene;
	let camera = _Engine.scene.camera;
	let renderer = _Engine.scene.renderer;

	const pickingMaterial = new THREE.MeshBasicMaterial({
		vertexColors: true
	});
	const defaultMaterial = new THREE.MeshPhongMaterial({
		color: 0xffffff,
		flatShading: true,
		vertexColors: true,
		shininess: 0
	});
	//apply颜色
	function applyVertexColors(geometry, color) {
		const position = geometry.attributes.position;
		const colors = [];
		for (let i = 0; i < position.count; i++) {
			colors.push(color.r, color.g, color.b);
		}
		geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	}
	renderer.domElement.addEventListener('pointermove', onPointerMove);
	let pointer = new THREE.Vector3();

	function onPointerMove(e) {

		pointer.x = e.clientX;
		pointer.y = e.clientY;

	}
	let pickingData = []
	const color = new THREE.Color();
	let pickingTexture = new THREE.WebGLRenderTarget(1, 1);
	if (_engineRay.scene == null) {
		let pickingScene = new THREE.Scene();
		_engineRay.scene = pickingScene;
	}

	function pick() {
		//render the picking scene off-screen
		// set the view offset to represent just a single pixel under the mouse
		camera.setViewOffset(renderer.domElement.width, renderer.domElement.height, pointer.x * window
			.devicePixelRatio | 0, pointer.y * window.devicePixelRatio | 0, 1, 1);
		// render the scene
		renderer.setRenderTarget(pickingTexture);
		renderer.render(_engineRay.scene, camera);
		// clear the view offset so rendering returns to normal
		camera.clearViewOffset();
		//create buffer for reading single pixel
		const pixelBuffer = new Uint8Array(4);
		//read the pixel
		renderer.readRenderTargetPixels(pickingTexture, 0, 0, 1, 1, pixelBuffer);
		//interpret the pixel as an ID
		const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
		renderer.setRenderTarget(null);
		_Engine.GpuRay = null;
		if (id != 0) {
			const data = _engineRay.pickingData[id];
			if (data) {
				if (true) {
					//模型高亮显示
					let highlightBox = new THREE.Mesh(data.geometry, new THREE.MeshBasicMaterial({
						color: 0xffff00,
						transparent: true,
						opacity: 0
					}));
					if (scene.children[data.i].geometry.groups[data.j].visibility != false) {
						_Engine.GpuRay = data;
					} else {
						return;
					}
					//创建射线
					highlightBox.TypeName = 'HighlightMesh';
					highlightBox.Indexs = [data.i, data.j];
					
					scene.children[5].children[0] = (highlightBox);

				} else {
					if (scene.children[data.i].geometry.groups[data.j].visibility != false) {
						_Engine.GpuRay = data;
					}
					// console.log(data)
				}
			}
		} else {
			// debugger
			scene.children[5].children.splice(0, 1);
		}
	}
	//添加颜色
	_engineRay.index = 0;
	_engineRay.pickingData = [];
	_engineRay.AddModels = function() {
		let geometriesPicking2 = [];
		let geometriesPicking3 = [];
		//子物体
		let childs = _Engine.scene.children;
		for (let i = 0; i < childs.length; i++) {
			let child = childs[i];
			if (child.IsGpuRay == true) {
				continue;
			}
			child.IsGpuRay = true;
			if (child.TypeName == "Mesh" || child.TypeName == "Mesh-Structure") {
				for (let k = 0; k < child.ElementInfos.length; k++) {
					A3(i, k)
				}
			}
		}
		if (geometriesPicking2.length > 0) {
			_engineRay.scene.add(new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(geometriesPicking2),
				pickingMaterial));
			geometriesPicking2.forEach(o => {
				o.dispose();
			})
			geometriesPicking2 = null;
		}
		if (geometriesPicking3.length > 0) {
			_engineRay.scene.add(new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(geometriesPicking3),
				pickingMaterial));
			geometriesPicking3.forEach(o => {
				o.dispose();
			})
			geometriesPicking3 = null;
		}

		function A3(i, j) {
			let child = childs[i];
			let o = child.meshs[j];
			let _geometry = child.meshs[j].geometry;

			var geometry = _geometry.clone();
			let colorsetHex = color.setHex(Math.random() * 0xffffff);
			applyVertexColors(geometry, colorsetHex);
			geometry = geometry.clone();
			let color_ = color.setHex(_engineRay.index++)
			applyVertexColors(geometry, color_);

			if (geometry.index == null) {
				//语义化模型
				var matrix = new THREE.Matrix4();
				matrix = matrix.makeRotationFromEuler(o.rotation);
				matrix.elements[12] = o.position.x;
				matrix.elements[13] = o.position.y;
				matrix.elements[14] = o.position.z;
				geometriesPicking2.push(geometry.applyMatrix4(matrix.clone()));
			} else {
				geometriesPicking3.push(geometry.applyMatrix4(o.matrix.clone()));
			}


			_engineRay.pickingData.push({
				i: i,
				j: j,
				geometry: geometry,
				name: child.ElementInfos[j].name
			});
		}
	}
	_engineRay.applyVertexColors = function(geometry, i, j) {
		// const color = new THREE.Color(); 
		// color.setHex(Math.random() * 0xffffff);
		// const _color = color.setHex(_engineRay.index++);
		// applyVertexColors(geometry, _color);    
		// _engineRay.pickingData.push({
		// 	i: i,
		// 	j: j,
		// }); 
	}
	//获取点击数据
	_engineRay.pick = function(_renderer, scene, camera) {

		pick();
		// camera.setViewOffset(renderer.domElement.width, renderer.domElement.height, pointer.x * window
		// 	.devicePixelRatio | 0, pointer.y * window.devicePixelRatio | 0, 1, 1);
		// renderer.setRenderTarget(pickingTexture);
		// renderer.render(scene, camera);
		// scene.camera.clearViewOffset();
		// const pixelBuffer = new Uint8Array(4);
		// renderer.readRenderTargetPixels(pickingTexture, 0, 0, 1, 1, pixelBuffer);
		// const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]); 
		// console.log("gpu点击模型",pixelBuffer,id)
		// if (id != 0) {
		// 	const data = _engineRay.pickingData[id];
		// 	if (data) {
		// 		//模型高亮显示 
		// 		let highlightBox = new THREE.Mesh(data.geometry, new THREE.MeshBasicMaterial({
		// 			color: 0xffff00,
		// 			transparent: true,
		// 			opacity: 0
		// 		}));
		// 		//创建射线，	
		// 		console.log("点击模型",data)
		// 		highlightBox.TypeName = 'HighlightMesh';
		// 		highlightBox.Indexs = [data.i, data.j]
		// 		scene.children[5].children[0] = (highlightBox);
		// 	}
		// }
		// renderer.setRenderTarget(null);
	}

	_engineRay.Active = function() {
		function render() {
			AnimationFrame = requestAnimationFrame(render);
			pick();
			renderer.setRenderTarget(null);
		}
		render() //开启动画
		_engineRay.isActive = true
	}
	_engineRay.DisActive = function() {
		cancelAnimationFrame(AnimationFrame) //清除动画
		_engineRay.isActive = false
	}

	return _engineRay
}