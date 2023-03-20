const THREE = require('@/three/three.js')
import {
	LoadZipJson,
	LoadJSON
} from "@/utils/LoadJSON.js"
import * as BufferGeometryUtils from "@/three/utils/BufferGeometryUtils.js"
import {
	ModelOctrees
} from "@/views/tools/common/modelOctree.js"
export function LoadGLB(Scene, relativePath, basePath, path, option, callback) {
	window.bimEngine.GLTFLoader.load(path, (gltf) => {
		gltf.scene.scale.set(1, 1, 1) //  设置模型大小缩放
		var models = gltf.scene.children;
		let allMeshs = [];
		let mergeModelDatas = [];
		for (let model of models) {
			if (model.type === "Group") {
				if (model.children && model.children.length) {
					for (let i = 0; i < model.children.length; i++) {
						let child = model.children[i];
						child.userData = model.userData

						child.IsMerge = true;
						child.MergeCount = model.children.length;
						child.MergeIndex = i;
						child.MergeName = model.name;



						allMeshs.push(child)
					}
				}
			} else if (model.type === "Mesh") {
				model.IsMerge = false;
				model.MergeIndex = 0;
				model.MergeCount = 1;
				model.MergeName = model.name;
				allMeshs.push(model)
			}
		}
		if (!allMeshs.length) {
			callback(null)
			return
		}
		if (option == null) {

			Scene.add(gltf.scene);
			// mergeBufferModel(Scene, allMeshs);
		}
		if (option && option.name === 'modelList') { 
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
			mergeBufferModel(Scene, allMeshs);
		} else if (option && option.name === 'instanceList') { 
			let instanceMeshs = []
			let MaterialMapList = window.bimEngine.MaterialMapList.filter(item => item.path === relativePath)
			let materialMap = MaterialMapList.length ? MaterialMapList[0].mapList.filter(item => item.glb ===
				path)[0] : null
			let paramMaterial = materialMap ? window.bimEngine.MaterialList.filter(item => item.Id ===
				materialMap.materialId)[0] : null
			for (let item of option.children) {
				for (var i = 0; i < allMeshs.length; i++) {
					if (materialMap && materialMap.meshId === allMeshs[i].userData.name && paramMaterial &&
						paramMaterial.Param) {
						setMaterialAttribute(allMeshs[i].material, paramMaterial.Param)
					}
					if (item.meshId === allMeshs[i].userData.name) {
						a(0);
						a(1);
						a(2);
						a(3);
						//设置为双边显示材质
						allMeshs[i].material.side = THREE.DoubleSide;

						function a(Mirrored) {
							let _childs = null;
							if (Mirrored == 0) {
								_childs = new THREE.InstancedMesh(allMeshs[i].geometry.clone(), allMeshs[i]
									.material, item.children.length);
							} else if (Mirrored == 1 || Mirrored == 3) {
								//facing
								if (item.children[0].FacingDir != null) {
									var vec = new THREE.Vector3(item.children[0].FacingDir.X, 0, -item.children[
										0].FacingDir.Y);
									var m = new THREE.Matrix4();
									m.set(1 - 2 * vec.x * vec.x, -2 * vec.x * vec.y, -2 * vec.x * vec.z, 0,
										-2 * vec.x * vec.y, 1 - 2 * vec.y * vec.y, -2 * vec.y * vec.z, 0,
										-2 * vec.x * vec.z, -2 * vec.y * vec.z, 1 - 2 * vec.z * vec.z, 0,
										0, 0, 0, 1);
									let geo = allMeshs[i].geometry.clone().applyMatrix4(m);
									geo.verticesNeedUpdate = true;
									geo.normalsNeedUpdate = true;
									geo.computeBoundingSphere();
									geo.computeFaceNormals();
									geo.computeVertexNormals();
									_childs = new THREE.InstancedMesh(geo, allMeshs[i].material, item.children
										.length);
								}
							} else if (Mirrored == 2) {
								if (item.children[0].handleDir != null) {
									var vec = new THREE.Vector3(item.children[0].handleDir.X, 0, -item.children[
										0].handleDir.Y);
									var m = new THREE.Matrix4();
									m.set(1 - 2 * vec.x * vec.x, -2 * vec.x * vec.y, -2 * vec.x * vec.z, 0,
										-2 * vec.x * vec.y, 1 - 2 * vec.y * vec.y, -2 * vec.y * vec.z, 0,
										-2 * vec.x * vec.z, -2 * vec.y * vec.z, 1 - 2 * vec.z * vec.z, 0,
										0, 0, 0, 1);
									let geo = allMeshs[i].geometry.clone().applyMatrix4(m);
									geo.verticesNeedUpdate = true;
									geo.normalsNeedUpdate = true;
									geo.computeBoundingSphere();
									geo.computeFaceNormals();
									geo.computeVertexNormals();
									_childs = new THREE.InstancedMesh(geo, allMeshs[i].material, item.children
										.length);
								}
							}
							if (_childs == null) {
								return
							}
							//非镜像模型 
							let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
							window.color = new THREE.Color();
							let chis = item.children.filter(o => o.Mirrored == Mirrored);

							for (var j = 0; j < chis.length; j++) {
								//平移
								let child = chis[j];
								let matrix = new THREE.Matrix4();
								if (child.Mirrored != Mirrored) {
									continue;
								}
								if (Mirrored == 2) {
									matrix = matrix.clone().makeRotationY(child.angle_a + Math.PI);
								} else if (Mirrored == 1) {
									matrix = matrix.clone().makeRotationY(child.angle_a);
								} else if (Mirrored == 3) {
									matrix = matrix.clone().makeRotationY(child.angle_a);
								} else {
									matrix = matrix.clone().makeRotationY(child.angle_a);
								}
								matrix.elements[12] = child.Point.X * 0.3048;
								matrix.elements[13] = child.Point.Z * 0.3048;
								matrix.elements[14] = -child.Point.Y * 0.3048;

								_childs.setMatrixAt(j, matrix);
								_childs.setColorAt(j, window.color);

								let _min = _childs.geometry.boundingBox.min.clone().applyMatrix4(matrix
									.clone());
								let _max = _childs.geometry.boundingBox.max.clone().applyMatrix4(matrix
									.clone());
								let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y),
									Math
									.min(_min.z, _max.z));
								let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y),
									Math
									.max(_min.z, _max.z));
								let center = min.clone().add(max.clone()).multiplyScalar(0.5);
								_childs.geometry.groups.push({});

 
								
								ElementInfoArray.push({
									name: child.name,
									min: min,
									max: max,
									center: center,
									dbid: j,
									IsMerge: allMeshs[i].IsMerge,
									MergeIndex: allMeshs[i].MergeIndex,
									MergeCount: allMeshs[i].MergeCount,
									MergeName: allMeshs[i].MergeName,
									url: path,
									EdgeList: [],
									matrix: matrix,
									basePath: basePath,
									relativePath: relativePath
								});
							}
							if (ElementInfoArray.length != 0) {
								_childs.ElementInfos = ElementInfoArray;
								_childs.name = "rootModel";
								_childs.TypeName = "InstancedMesh";
								_childs.MeshId = item.meshId;
								_childs.cloneMaterialArray = allMeshs[i].material.clone();
								_childs.basePath = basePath;
								_childs.relativePath = relativePath;
								_childs.meshs = allMeshs[i];
								_childs.url = path;
								// _childs.cloneInstanceColor = Array.from(_childs.instanceColor.array)
								_childs.cloneInstanceMatrix = Array.from(_childs.instanceMatrix.array)
								Scene.add(_childs);
								// instanceMeshs.push(_childs)
								// break
							}
						}
					}
				}
			}


			{


			}
		}
		callback(gltf)
	}, (xhr) => {
		// console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
	}, (error) => {
		// console.error(error)
	})
	//合并模型 
	function mergeBufferModel(Scene, meshs) {
		let geometryArray = []; // 将你的要合并的多个geometry放入到该数组
		let materialArray = []; // 将你的要赋值的多个material放入到该数组
		let cloneMaterialArray = []; // 将你的要赋值的多个material放入到该数组
		let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
		let scene = window.bimEngine.scene
		//对mesh位置进行偏移
		for (var o of meshs) {
			if (o.geometry != null && o.matrix != null) {
				let matrixWorldGeometry = o.geometry.clone().applyMatrix4(o.matrix.clone());
				let MaterialMapList = window.bimEngine.MaterialMapList.filter(item => item.path === relativePath)
				let materialMap = MaterialMapList.length ? MaterialMapList[0].mapList.filter(item => item.glb === path)[
					0] : null
				let paramMaterial = materialMap ? window.bimEngine.MaterialList.filter(item => item.Id === materialMap
					.materialId)[0] : null

				if (materialMap && materialMap.meshId === o.userData.name && paramMaterial && paramMaterial.Param) {
					setMaterialAttribute(o.material, paramMaterial.Param)
				} else {
					o.material.side = THREE.DoubleSide;
				}


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
					name: o.userData.name,
					min: min,
					max: max,
					center: center,
					dbid: ElementInfoArray.length,
					IsMerge: o.IsMerge,
					MergeIndex: o.MergeIndex,
					MergeCount: o.MergeCount,
					MergeName: o.MergeName,
					EdgeList: [],
					basePath: basePath,
					relativePath: relativePath
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
		singleMergeMesh.TypeName = "Mesh";
		singleMergeMesh.meshs = meshs;
		singleMergeMesh.url = path;
		singleMergeMesh.basePath = basePath;
		singleMergeMesh.relativePath = relativePath;
		Scene.add(singleMergeMesh);
	}

	//设置材质属性
	function setMaterialAttribute(material, param) {
		material.transparent = param.transparent //是否透明
		material.opacity = param.opacity //透明度
		material.side = THREE[param.side] //渲染面
		material.color = new THREE.Color(param.color) //颜色
		material.emissive = new THREE.Color(param.emissive) //自发光
		material.roughness = param.roughness //粗糙度 
		material.metalness = param.metalness //金属度 
		material.reflectivity = param.reflectivity //反射率 
		material.clearcoat = param.clearcoat //清漆/透明图层
		material.clearcoatRoughness = param.clearcoatRoughness //清漆粗糙度 
		material.flatShading = param.flatShading //平面着色
		material.vertexColors = param.vertexColors //顶点颜色

		material.envMap = param.envMap.url ? new THREE.TextureLoader().load(param.envMap.url, (texture) => {
			texture.wrapS = THREE.RepeatWrapping
			texture.wrapT = THREE.RepeatWrapping
			//表示在x、y上的重复次数
			texture.repeat.set(param.envMap.repeat.u, param.envMap.repeat.v);
			//表示在x、y上的偏移
			texture.offset.set(param.envMap.offset.u, param.envMap.offset.v);
		}) : null //环境贴图
		material.map = param.map.url ? new THREE.TextureLoader().load(param.map.url, (texture) => {
				texture.wrapS = THREE.RepeatWrapping
				texture.wrapT = THREE.RepeatWrapping
				//表示在x、y上的重复次数
				texture.repeat.set(param.map.repeat.u, param.map.repeat.v);
				//表示在x、y上的偏移
				texture.offset.set(param.map.offset.u, param.map.offset.v);
			}) : null, //纹理贴图
			material.normalMap = param.normalMap.url ? new THREE.TextureLoader().load(param.normalMap.url, (
				texture) => {
				texture.wrapS = THREE.RepeatWrapping
				texture.wrapT = THREE.RepeatWrapping
				//表示在x、y上的重复次数
				texture.repeat.set(param.normalMap.repeat.u, param.normalMap.repeat.v);
				//表示在x、y上的偏移
				texture.offset.set(param.normalMap.offset.u, param.normalMap.offset.v);
			}) : null, //法线贴图
			material.roughnessMap = param.roughnessMap.url ? new THREE.TextureLoader().load(param.roughnessMap.url, (
				texture) => {
				texture.wrapS = THREE.RepeatWrapping
				texture.wrapT = THREE.RepeatWrapping
				//表示在x、y上的重复次数
				texture.repeat.set(param.roughnessMap.repeat.u, param.roughnessMap.repeat.v);
				//表示在x、y上的偏移
				texture.offset.set(param.roughnessMap.offset.u, param.roughnessMap.offset.v);
			}) : null, //粗糙贴图
			material.alphaMap = param.alphaMap.url ? new THREE.TextureLoader().load(param.alphaMap.url, (texture) => {
				texture.wrapS = THREE.RepeatWrapping
				texture.wrapT = THREE.RepeatWrapping
				//表示在x、y上的重复次数
				texture.repeat.set(param.alphaMap.repeat.u, param.alphaMap.repeat.v);
				//表示在x、y上的偏移
				texture.offset.set(param.alphaMap.offset.u, param.alphaMap.offset.v);
			}) : null //混合贴图
	}
}
//合并模型
export function mergeModel(Scene) {
	var models = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
	var meshs = [];
	for (var model of models) {
		for (var o of model.meshs) {
			meshs.push(o);
		}
		Scene.remove(model);
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
			dbid: ElementInfoArray.length,
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
	Scene.add(singleMergeMesh);
	// console.log("加载完成")
}

//批量加载glb模型，json - 大量相同模型合并
export function LoadGlbJsonList(Scene, relativePath, path = "/file/gis/fl/bim/100004", option, callback) {
	let loadCompleteSize = 0
	LoadZipJson(path + '/modelList.zip', res => {
		let glbList = JSON.parse(res)
		if (glbList && glbList.length) {
			let currentIndex = 0;
			let loadsAll = async () => {
				let getGLB = item => {
					return new Promise((resolve, reject) => {
						option.Point = item.Point;
						option.Rotate = item.angle_a;
						LoadGLB(Scene, relativePath, path, item.fullPath, {
							name: 'modelList',
							position: option
						}, gltf => {
							currentIndex = currentIndex + 1;
							if (currentIndex == 1) {
								// window.bimEngine.ViewCube.cameraGoHome();
							}
							//全部加载完成，然后去合并模型
							if (currentIndex == glbList.length) {
								loadCompleteSize = loadCompleteSize + 1
								// console.log('1111111111111')
								AllModelLoadComplated()
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
		} else {
			loadCompleteSize = loadCompleteSize + 1
		}
	})

	LoadZipJson(path + '/instanceList.zip', res => {
		let glbList = JSON.parse(res)
		if (glbList && glbList.length) {
			let currentIndex = 0;
			let loadsAll = async () => {
				let getGLB = item => {
					return new Promise((resolve, reject) => {
						LoadGLB(Scene, relativePath, path, item.fullPath, {
							name: 'instanceList',
							children: item.children
						}, gltf => {
							currentIndex = currentIndex + 1;
							if (currentIndex == 1) {
								window.bimEngine.ViewCube.cameraGoHome();
							}
							//全部加载完成，然后去合并模型
							if (currentIndex == glbList.length) {
								loadCompleteSize = loadCompleteSize + 1
								// console.log('222222222222222')
								AllModelLoadComplated()
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
		} else {
			loadCompleteSize = loadCompleteSize + 1
		}
	})

	function AllModelLoadComplated() {
		// ModelOctree(window.bimEngine, path);
		// return
		//同一个目录下的模型加载完成
		if (loadCompleteSize == 2) {
			window.bimEngine.doneModels.push(path);
			window.bimEngine.loadedDone('glbModelsLoadedNum');
			return;
			// console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
			let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel" && o.basePath == path);
			let modelsList = []
			for (let i = 0; i < rootmodels.length; i++) {
				let model = {
					TypeName: rootmodels[i].TypeName,
					ElementInfos: []
				}
				if (rootmodels[i].TypeName == "Mesh") {
					for (let j = 0; j < rootmodels[i].ElementInfos.length; j++) {
						let ele = {
							geometry: [...rootmodels[i].meshs[j].geometry.attributes.position.array],
							indexA: [...rootmodels[i].meshs[j].geometry.index.array],
							matrix: [...rootmodels[i].meshs[j].matrix.elements]
						}
						model.ElementInfos.push(ele)
					}
					modelsList.push(model)
				} else if (rootmodels[i].TypeName == "InstancedMesh") {
					for (let j = 0; j < rootmodels[i].ElementInfos.length; j++) {
						let ele = {
							geometry: [...rootmodels[i].meshs.geometry.attributes.position.array],
							indexA: [...rootmodels[i].meshs.geometry.index.array],
							matrix: [...rootmodels[i].ElementInfos[j].matrix.elements]
						}
						model.ElementInfos.push(ele)
					}
					modelsList.push(model)
				}
			}
			// console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
			//计算边线-并存储，用于测量捕捉
			var worker = new Worker('static/js/file.worker.js');
			worker.postMessage(modelsList); //将复杂计算交给子线程,可以理解为给参数让子线程去操作。
			worker.onmessage = function(e) {
				// console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
				let backList = e.data
				for (let i = 0; i < backList.length; i++) {
					if (backList[i].TypeName == "Mesh") {
						for (let j = 0; j < backList[i].ElementInfos.length; j++) {
							rootmodels[i].ElementInfos[j].EdgeList = backList[i].ElementInfos[j].EdgeList
						}
					} else if (backList[i].TypeName == "InstancedMesh") {
						for (let j = 0; j < backList[i].ElementInfos.length; j++) {
							rootmodels[i].ElementInfos[j].EdgeList = backList[i].ElementInfos[j].EdgeList
						}
					}

				}
				// console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
				worker.terminate()
			}
			worker.onerror = function(event) {
				worker.terminate()
			}
		}
	}

}

export function LoadModelBeforeStart(path) { //模型加载之前
	window.bimEngine.MaterialMapList = window.bimEngine.MaterialMapList ? window.bimEngine.MaterialMapList : []
	window.bimEngine.MaterialList = window.bimEngine.MaterialList ? window.bimEngine.MaterialList : []
	return new Promise((resolve, reject) => {
		LoadJSON(path + '/materialMapList.json', result => { //加载模型材质映射列表
			result && window.bimEngine.MaterialMapList.push(JSON.parse(result))
			if (result) {
				LoadJSON(path + '/materialList.json', res => { //加载模型属性列表
					if (res) {
						let MaterialList = JSON.parse(res) ? (JSON.parse(res)).map(item => {
							item.Param = JSON.parse(item.Param)
							if (item.Param) {
								if (item.Param.envMap && item.Param.envMap.url) {
									item.Param.envMap.url = '/materialFile' + item.Param
										.envMap.url.split('/api/file')[1]
								}
								if (item.Param.map && item.Param.map.url) {
									item.Param.map.url = '/materialFile' + item.Param
										.map.url.split('/api/file')[1]
								}
								if (item.Param.normalMap && item.Param.normalMap.url) {
									item.Param.normalMap.url = '/materialFile' + item
										.Param.normalMap.url.split('/api/file')[1]
								}
								if (item.Param.roughnessMap && item.Param.roughnessMap
									.url) {
									item.Param.roughnessMap.url = '/materialFile' + item
										.Param.roughnessMap.url.split('/api/file')[1]
								}
								if (item.Param.alphaMap && item.Param.alphaMap.url) {
									item.Param.alphaMap.url = '/materialFile' + item
										.Param.alphaMap.url.split('/api/file')[1]
								}
							}
							return item
						}) : [];
						window.bimEngine.MaterialList = [...window.bimEngine.MaterialList, ...
							MaterialList
						]
					}
					resolve('材质映射列表不为空');
				})
			} else {
				resolve('材质映射列表为空');
			}
		})
	});
}

export function CreateHighLightGroup(scene) {
	let HighLightGroupList = scene.children.filter(o => o.name == "HighLightGroup");
	let HighLightGroup = HighLightGroupList[0];
	if (!HighLightGroup) {
		HighLightGroup = new THREE.Group();
		HighLightGroup.name = "HighLightGroup"
		scene.add(HighLightGroup)
	}
}
