const THREE = require('@/three/three.js')
import * as BufferGeometryUtils from "@/three/utils/BufferGeometryUtils.js"
export function EngineRay(clientX, clientY) {
	var _engineRay = new Object();
	_engineRay.isActive = false; //是否激活
	let AnimationFrame;

	let scene = window.bimEngine.scene;
	let camera = window.bimEngine.scene.camera;
	let renderer = window.bimEngine.scene.renderer;

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
	let geometriesPicking1 = [];
	let geometriesPicking2 = [];
	let geometriesPicking3 = [];
	const color = new THREE.Color();
	let pickingScene = new THREE.Scene();
	let pickingTexture = new THREE.WebGLRenderTarget(1, 1);
	//子物体
	let childs = window.bimEngine.scene.children;
	let index = 0;
	for (let i = 0; i < childs.length; i++) {
		let child = childs[i];
		if (child.TypeName == "InstancedMesh") {
			// for (let j = 0; j < child.ElementInfos.length; j++) {
			// 	A1(i, j)
			// }
		} else if (child.TypeName == "InstancedMesh-Pipe") {
			// for (let m = 0; m < child.ElementInfos.length; m++) {
			// 	A2(i, m)
			// }
		}
		if (child.TypeName == "Mesh" || child.TypeName == "Mesh-Structure") {
			for (let k = 0; k < child.ElementInfos.length; k++) {
				A3(i, k)
			}
		}
	}


	function A1(i, j) {
		let child = childs[i];
		let _geometry = child.meshs.geometry;
		let matrix = new THREE.Matrix4();
		matrix.elements = child.instanceMatrix.array.slice(j * 16, (j + 1) * 16);
		var geometry = _geometry.clone().applyMatrix4(matrix);
		let colorsetHex = color.setHex(Math.random() * 0xffffff);
		applyVertexColors(geometry, colorsetHex);
		geometry = geometry.clone();
		applyVertexColors(geometry, color.setHex(index++));
		geometriesPicking1.push(geometry);
		pickingData.push({
			i: i,
			j: j,
			geometry: geometry,
			name: child.ElementInfos[j].name
		});

	}

	function A2(i, j) {
		let child = childs[i];
		let _geometry = child.meshs.geometry;
		let matrix = new THREE.Matrix4();
		matrix.elements = child.instanceMatrix.array.slice(j * 16, (j + 1) * 16);
		var geometry = _geometry.clone().applyMatrix4(matrix);
		let colorsetHex = color.setHex(Math.random() * 0xffffff);
		applyVertexColors(geometry, colorsetHex);
		geometry = geometry.clone();
		applyVertexColors(geometry, color.setHex(index++));
		geometriesPicking2.push(geometry);
		pickingData.push({
			i: i,
			j: j,
			geometry: geometry,
			name: child.ElementInfos[j].name
		});
	}

	function A3(i, j) {
		let child = childs[i];
		let o = child.meshs[j];
		let _geometry = child.meshs[j].geometry;
		 
		var geometry = _geometry.clone();
		let colorsetHex = color.setHex(Math.random() * 0xffffff);
		applyVertexColors(geometry, colorsetHex);
		geometry = geometry.clone();
		applyVertexColors(geometry, color.setHex(index++));

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

		pickingData.push({
			i: i,
			j: j,
			geometry: geometry,
			name: child.ElementInfos[j].name
		});
	}




	if (geometriesPicking1.length > 0)
		pickingScene.add(new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(geometriesPicking1),
			pickingMaterial));
	if (geometriesPicking2.length > 0)
		pickingScene.add(new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(geometriesPicking2),
			pickingMaterial));
	if (geometriesPicking3.length > 0)
		pickingScene.add(new THREE.Mesh(THREE.BufferGeometryUtils.mergeBufferGeometries(geometriesPicking3),
			pickingMaterial));


	function pick() {
		//render the picking scene off-screen
		// set the view offset to represent just a single pixel under the mouse
		camera.setViewOffset(renderer.domElement.width, renderer.domElement.height, pointer.x * window
			.devicePixelRatio | 0, pointer.y * window.devicePixelRatio | 0, 1, 1);
		// render the scene
		renderer.setRenderTarget(pickingTexture);
		renderer.render(pickingScene, camera);
		// clear the view offset so rendering returns to normal
		camera.clearViewOffset();
		//create buffer for reading single pixel
		const pixelBuffer = new Uint8Array(4);
		//read the pixel
		renderer.readRenderTargetPixels(pickingTexture, 0, 0, 1, 1, pixelBuffer);
		//interpret the pixel as an ID
		const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
		if (id != 0) {
			const data = pickingData[id];
			if (data) {
				//模型高亮显示 
				let highlightBox = new THREE.Mesh(data.geometry, new THREE.MeshBasicMaterial({
					color: 0xffff00,
					transparent: true,
					opacity: 0
				}));
				//创建射线，	
				highlightBox.TypeName = 'HighlightMesh';
				highlightBox.Indexs = [data.i, data.j]
				scene.children[5].children[0] = (highlightBox);
			}
		}
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