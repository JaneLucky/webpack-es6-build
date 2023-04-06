const THREE = require('@/three/three.js')
import "@/three/loaders/GLTFLoader.js"
import '@/three/loaders/DRACOLoader.js'
import LoadJSON from "@/utils/LoadJSON.js"
import * as BufferGeometryUtils from "@/three/utils/BufferGeometryUtils.js"
//解压文件
const dracoLoader = new THREE.DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
dracoLoader.preload()

const GLTFLoader = new THREE.GLTFLoader()
GLTFLoader.setDRACOLoader(dracoLoader) //设置glth/glb解压后再加载

export function LoadGLB(GroupBox, path, option, callback) {
	GLTFLoader.load(path, (gltf) => {
		gltf.scene.scale.set(1, 1, 1) //  设置模型大小缩放
		var models = gltf.scene.children;
		let allMeshs = []
		for (let model of models) {
			if(model.type === "Group"){
				if (model.children && model.children.length) {
					for (let child of model.children) {
						child.userData = model.userData
						allMeshs.push(child)
					}
				}
			}else if(model.type === "Mesh"){
				allMeshs.push(model)
			}
		}
		if (!allMeshs.length) {
			callback(null)
			return
		}
		if (option.name === 'modelList') {
			for (var i = 0; i < allMeshs.length; i++) {
				var mesh = allMeshs[i];
				if (option.position != null && option.position.Point != null) {
					if (!(option.position.Point.X == 0 && option.position.Point.Y == 0 && option.position.Point
							.Z == 0)) {
						//平移 
						mesh.matrix.elements[12] = option.position.Point.X * 0.3048;
						mesh.matrix.elements[13] = option.position.Point.Z * 0.3048;
						mesh.matrix.elements[14] = -option.position.Point.Y * 0.3048;
						//旋转
						mesh.rotation.y = option.position.angle_a
					}
				}
			}
			mergeBufferModel(GroupBox, allMeshs);
		} else if (option.name === 'instanceList') {
			let instanceMeshs = []
			for (let item of option.children) {
				for (var i = 0; i < allMeshs.length; i++) {
					if (item.meshId === allMeshs[i].userData.name) {
						for (let child of item.children) {

							let _child = allMeshs[i].clone()
							_child.name = child.name
							//平移
							_child.matrix = _child.matrix.clone().makeRotationY(child.angle_a);
							_child.matrix.elements[12] = child.Point.X * 0.3048;
							_child.matrix.elements[13] = child.Point.Z * 0.3048;
							_child.matrix.elements[14] = -child.Point.Y * 0.3048;

							instanceMeshs.push(_child)
						}
						// break
					}
				}
			}
			mergeBufferModel(GroupBox, instanceMeshs);
		}
		callback(gltf)
	}, (xhr) => {
		// console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
	}, (error) => {
		// console.error(error)
	})
	//合并模型 
	function mergeBufferModel(GroupBox, meshs) {
		let geometryArray = []; // 将你的要合并的多个geometry放入到该数组
		let materialArray = []; // 将你的要赋值的多个material放入到该数组
		let cloneMaterialArray = []; // 将你的要赋值的多个material放入到该数组
		let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
		let scene = window.bimEngine.scene
		//对mesh位置进行偏移
		for (var o of meshs) {
			if (o.geometry != null && o.matrix != null) {
				let matrixWorldGeometry = o.geometry.clone().applyMatrix4(o.matrix.clone());
				o.material.side = THREE.DoubleSide;
				geometryArray.push(matrixWorldGeometry);
				materialArray.push(o.material)
				cloneMaterialArray.push(o.material.clone());
				let _min = o.geometry.boundingBox.min.clone().applyMatrix4(o.matrix.clone());
				let _max = o.geometry.boundingBox.max.clone().applyMatrix4(o.matrix.clone());
				let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math
					.min(_min.z, _max.z));
				let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math
					.max(_min.z, _max.z));
				let center = min.clone().add(max.clone()).multiplyScalar(0.5);
				ElementInfoArray.push({
					name: o.name,
					min: min,
					max: max,
					center: center,
					dbid: ElementInfoArray.length
				});
			}
		}
		//加载模型
		const mergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(geometryArray,
			true);
		const singleMergeMesh = new THREE.Mesh(mergedGeometries, materialArray);
		singleMergeMesh.ElementInfos = ElementInfoArray;
		singleMergeMesh.cloneMaterialArray = cloneMaterialArray;
		singleMergeMesh.name = "rootModel";
		singleMergeMesh.meshs = meshs;
		singleMergeMesh.url = path;
		GroupBox.add(singleMergeMesh);
	}
}
//合并模型
export function mergeModel(GroupBox) {
	var models = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
	var meshs = [];
	for (var model of models) {
		for (var o of model.meshs) {
			meshs.push(o);
		}
		GroupBox.remove(model);
	}
	let geometryArray = []; // 将你的要合并的多个geometry放入到该数组
	let materialArray = []; // 将你的要赋值的多个material放入到该数组
	let cloneMaterialArray = []; // 将你的要赋值的多个material放入到该数组
	let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组


	for (var o of meshs) {
		let matrixWorldGeometry = o.geometry.clone().applyMatrix4(o.matrix.clone());
		geometryArray.push(matrixWorldGeometry);
		materialArray.push(o.material)
		cloneMaterialArray.push(o.material.clone());
		let _min = o.geometry.boundingBox.min.clone().applyMatrix4(o.matrix.clone());
		let _max = o.geometry.boundingBox.max.clone().applyMatrix4(o.matrix.clone());
		let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math
			.min(_min.z, _max.z));
		let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math
			.max(_min.z, _max.z));
		let center = min.clone().add(max.clone()).multiplyScalar(0.5);
		ElementInfoArray.push({
			name: o.name,
			min: min,
			max: max,
			center: center,
			dbid: ElementInfoArray.length
		});
	}
	//加载模型
	const mergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(geometryArray,
		true);
	const singleMergeMesh = new THREE.Mesh(mergedGeometries, materialArray);
	singleMergeMesh.ElementInfos = ElementInfoArray;
	singleMergeMesh.cloneMaterialArray = cloneMaterialArray;
	singleMergeMesh.name = "rootModel";
	singleMergeMesh.meshs = meshs;
	GroupBox.add(singleMergeMesh);
}

//批量加载glb模型，json - 大量相同模型合并
export function LoadGlbJsonList(GroupBox, path = "/file/gis/fl/bim/100004", option, callback) {
	LoadJSON(path + '/modelList.json', res => {
		let glbList = JSON.parse(res)
		// 根据category重复去重
		let obj = {}
		glbList = glbList.reduce(function(item, next) {
			obj[next.category] ? '' : obj[next.category] = true && item.push(next)
			return item
		}, [])
		let currentIndex = 0;
		let loadsAll = async () => {
			let getGLB = item => {
				return new Promise((resolve, reject) => {
					option.Point = item.Point;
					option.Rotate = item.angle_a;
					LoadGLB(GroupBox, item.fullPath, {
						name: 'modelList',
						position: option
					}, gltf => {
						currentIndex = currentIndex + 1;
						if (currentIndex == 1) {
							window.bimEngine.ViewCube.cameraGoHome();
						}
						//全部加载完成，然后去合并模型
						if (currentIndex == glbList.length) {
							// mergeModel(GroupBox);
							// window.bimEngine.ViewCube.cameraGoHome();
						}

						resolve(gltf);
					})
				});
			};
			//for循环调接口
			for (let i = 0; i < glbList.length; i++) {
				glbList[i].fullPath = path + "/" + glbList[i].category + '.glb'
				const result = await getGLB(glbList[i]);
			}
		};
		loadsAll()
	})

	LoadJSON(path + '/instanceList.json', res => {
		let glbList = JSON.parse(res)
		let currentIndex = 0;
		let loadsAll = async () => {
			let getGLB = item => {
				return new Promise((resolve, reject) => {
					LoadGLB(GroupBox, item.fullPath, {
						name: 'instanceList',
						children: item.children
					}, gltf => {
						currentIndex = currentIndex + 1;
						if (currentIndex == 1) {
							window.bimEngine.ViewCube.cameraGoHome();
						}
						//全部加载完成，然后去合并模型
						if (currentIndex == glbList.length) {
							// mergeModel(GroupBox);
							// window.bimEngine.ViewCube.cameraGoHome();
						}

						resolve(gltf);
					})
				});
			};
			//for循环调接口
			for (let i = 0; i < glbList.length; i++) {
				glbList[i].fullPath = path + "/" + glbList[i].category + '.glb'
				const result = await getGLB(glbList[i]);
			}
		};
		loadsAll()
	})
}
