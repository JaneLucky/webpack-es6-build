const THREE = require('three')
import LoadJSON from "@/utils/LoadJSON.js"
import * as BufferGeometryUtils from "@/three/utils/BufferGeometryUtils.js"

export function LoadGLB(GroupBox, basePath, path, option, callback) {
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
		if(option==null){
			 
			GroupBox.add(gltf.scene);
			// mergeBufferModel(GroupBox, allMeshs);
		}
		if (option&&option.name === 'modelList') {
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
		} else if (option&&option.name === 'instanceList') {
			let instanceMeshs = []
			for (let item of option.children) {
				for (var i = 0; i < allMeshs.length; i++) {
					if (item.meshId === allMeshs[i].userData.name) {
						let _childs = new THREE.InstancedMesh(allMeshs[i].geometry, allMeshs[i].material, item
							.children.length);
						let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
						window.color = new THREE.Color();
						for (var j = 0; j < item.children.length; j++) {
							//平移
							let child = item.children[j];
							let matrix = new THREE.Matrix4();
							matrix = matrix.clone().makeRotationY(child.angle_a);
							matrix.elements[12] = child.Point.X * 0.3048;
							matrix.elements[13] = child.Point.Z * 0.3048;
							matrix.elements[14] = -child.Point.Y * 0.3048;
							_childs.setMatrixAt(j, matrix);
							_childs.setColorAt(j, window.color);

							let _min = allMeshs[i].geometry.boundingBox.min.clone().applyMatrix4(matrix
								.clone());
							let _max = allMeshs[i].geometry.boundingBox.max.clone().applyMatrix4(matrix
								.clone());
							let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math
								.min(_min.z, _max.z));
							let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math
								.max(_min.z, _max.z));
							let center = min.clone().add(max.clone()).multiplyScalar(0.5);
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
								EdgeList:[],
								matrix:matrix,
								basePath:basePath
							});
						}
						_childs.ElementInfos = ElementInfoArray;
						_childs.name = "rootModel";
						_childs.TypeName = "InstancedMesh";
						_childs.MeshId = item.meshId;
						_childs.cloneMaterialArray = allMeshs[i].material.clone();
						_childs.basePath = basePath;
						_childs.meshs = allMeshs[i];
						_childs.url = path;
						GroupBox.add(_childs);
						// instanceMeshs.push(_childs)
						// break
					}
				}
			}
			// mergeBufferModel(GroupBox, instanceMeshs);
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
				
				// o.material.transparent = true //是否透明
				// o.material.opacity = 1 //透明度
				// o.material.side = THREE.DoubleSide //渲染面
				// o.material.color = new THREE.Color("rgb(255,255,255)") //颜色
				// o.material.emissive = new THREE.Color("rgb(0,0,0)") //自发光
				// o.material.roughness = 0 //粗糙度 
				// o.material.metalness = 0 //金属度 
				// o.material.reflectivity = 0 //反射率 
				// o.material.clearcoat = 0 //清漆/透明图层
				// o.material.clearcoatRoughness = 0 //清漆粗糙度 
				// o.material.flatShading = false //平面着色
				// o.material.vertexColors = false //顶点颜色
	
				// o.material.envMap = new THREE.TextureLoader().load(this.materialForm.envMap.url, (texture)=>{
				// 	texture.wrapS = THREE.RepeatWrapping
				// 	texture.wrapT = THREE.RepeatWrapping
				// 	//表示在x、y上的重复次数
				// 	texture.repeat.set(this.materialForm.envMap.repeat.u, this.materialForm.envMap.repeat.v);
				// 	//表示在x、y上的偏移
				// 	texture.offset.set(this.materialForm.envMap.offset.u, this.materialForm.envMap.offset.v);
				// }) //环境贴图
				// o.material.map = new THREE.TextureLoader().load("/tietu/Image/material/20230201_390284751371502853.jpg", (texture)=>{
				// 	texture.wrapS = THREE.RepeatWrapping
				// 	texture.wrapT = THREE.RepeatWrapping
				// 	//表示在x、y上的重复次数
				// 	texture.repeat.set(1, 1);
				// 	//表示在x、y上的偏移
				// 	texture.offset.set(0, 0);
				// })//纹理贴图
				// o.material.normalMap = new THREE.TextureLoader().load("/tietu/Image/material/20230201_390370401605125381.png", (texture)=>{
				// 	texture.wrapS = THREE.RepeatWrapping
				// 	texture.wrapT = THREE.RepeatWrapping
				// 	//表示在x、y上的重复次数
				// 	texture.repeat.set(1, 1);
				// 	//表示在x、y上的偏移
				// 	texture.offset.set(0, 0);
				// })//法线贴图


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
					EdgeList:[], 
					basePath:basePath
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
	GroupBox.add(singleMergeMesh);
	// console.log("加载完成")
}

//批量加载glb模型，json - 大量相同模型合并
export function LoadGlbJsonList(GroupBox, path = "/file/gis/fl/bim/100004", option, callback) {
	let loadCompleteSize = 0
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
					LoadGLB(GroupBox, path, item.fullPath, {
						name: 'modelList',
						position: option
					}, gltf => {
						currentIndex = currentIndex + 1;
						if (currentIndex == 1) {
							window.bimEngine.ViewCube.cameraGoHome();
						}
						//全部加载完成，然后去合并模型
						if (currentIndex == glbList.length) {
							loadCompleteSize = loadCompleteSize+1
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
	})

	LoadJSON(path + '/instanceList.json', res => {
		let glbList = JSON.parse(res)
		let currentIndex = 0;
		let loadsAll = async () => {
			let getGLB = item => {
				return new Promise((resolve, reject) => {
					LoadGLB(GroupBox, path, item.fullPath, {
						name: 'instanceList',
						children: item.children
					}, gltf => {
						currentIndex = currentIndex + 1;
						if (currentIndex == 1) {
							window.bimEngine.ViewCube.cameraGoHome();
						}
						//全部加载完成，然后去合并模型
						if (currentIndex == glbList.length) {
							loadCompleteSize = loadCompleteSize+1
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
	})

	function AllModelLoadComplated() {
		//同一个目录下的模型加载完成
		if(loadCompleteSize == 2){
			let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel" && o.basePath == path);
			for(let i=0; i<rootmodels.length;i++){
				if(rootmodels[i].TypeName == "Mesh"){
					for(let j=0;j<rootmodels[i].ElementInfos.length;j++){
						//计算边线-并存储，用于测量捕捉
						var edges = new THREE.EdgesGeometry(rootmodels[i].meshs[j].geometry, 89); //大于89度才添加线条 
						var ps = edges.attributes.position.array;
						let positions = []
						for (var ii = 0; ii < ps.length; ii = ii + 3) {
							let point = new THREE.Vector3(ps[ii],ps[ii+1],ps[ii+2]);
							let newpoint = point.clone().applyMatrix4(rootmodels[i].meshs[j].matrix.clone());
							positions.push(newpoint.x);
							positions.push(newpoint.y);
							positions.push(newpoint.z);
						}
						rootmodels[i].ElementInfos[j].EdgeList = positions
					}
				}else if(rootmodels[i].TypeName == "InstancedMesh"){
					for(let j=0;j<rootmodels[i].ElementInfos.length;j++){
						//计算边线-并存储，用于测量捕捉
						var edges = new THREE.EdgesGeometry(rootmodels[i].meshs.geometry, 89); //大于89度才添加线条 
						var ps = edges.attributes.position.array;
						let positions = []
						for (var ii = 0; ii < ps.length; ii = ii + 3) {
							let point = new THREE.Vector3(ps[ii],ps[ii+1],ps[ii+2]);
							let newpoint = point.clone().applyMatrix4(rootmodels[i].ElementInfos[j].matrix.clone());
							positions.push(newpoint.x);
							positions.push(newpoint.y);
							positions.push(newpoint.z);
						}
						rootmodels[i].ElementInfos[j].EdgeList = positions
					}
				}
				
			}
		}
	}

}
