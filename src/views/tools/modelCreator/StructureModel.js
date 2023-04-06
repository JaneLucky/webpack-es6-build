const THREE = require('@/three/three.js')
import {
	LoadZipJson
} from "@/utils/LoadJSON.js"
import {
	UpdateMaterialAttribute
} from "@/views/tools/modelCreator/UpdateMaterial.js"
export function CreatorStructureModel(scene, relativePath, url, infos) {
	//加载json文件
	var currentMaterials = [];
	var allMesh = [];
	var defaultMat = new THREE.MeshStandardMaterial({
		color: new THREE.Color(`rgb(220,220,220)`),
		side: THREE.DoubleSide,
	})
	defaultMat.EId = 0;
	defaultMat.name = 0;
	LoadZipJson(url + '/semantics.zip', res => {
		let model = JSON.parse(res);
		//创建材质
		var materials = model.materials;
		CreatorMaterial(materials);
		//创建模型
		var columns = model.models.columns;
		CreatorColumn(columns);
		var beams = model.models.beams;
		CreatorColumn(beams);
		var floors = model.models.floors;
		CreatorColumn(floors);
		var walls = model.models.walls;
		CreatorColumn(walls);
		//创建空心剪切
		var cuts = model.cuts;

		if (allMesh && allMesh.length) {
			//按材质对模型进行拆分
			function splitArray(arr, n) {
				const result = [];
				for (let i = 0; i < arr.length; i += n) {
					result.push(arr.slice(i, i + n));
				}
				return result;
			}

			function splitMaterial(array) {
				var results = [];
				for (var mat of materials) {
					results.push(array.filter(o => o.material.EId == mat.Id))
				}
				return results;
			}
			var meshs = splitMaterial(allMesh);
			for (var ms of meshs) {
				var meshs_ = splitArray(ms, 2000);
				for (var ms_ of meshs_) {
					mergeBufferModel(scene, ms_, url + '/semantics.json', url, relativePath, currentMaterials);
				}
			}
			setLoaded(url + '/semantics.json', relativePath);
		} else {
			setLoaded(url + '/semantics.json', relativePath);
		}

	})

	//创建材质
	function CreatorMaterial(eles) {
		for (var i = 0; i < eles.length; i++) {
			var material = new THREE.MeshStandardMaterial({
				color: new THREE.Color(`rgb(${eles[i].color})`),
				side: THREE.DoubleSide,
				// depthTest: true 
			});
			material.name = eles[i].Id
			material.map = eles[i].materialImage ? new THREE.TextureLoader().load(url + "/" + eles[i].materialImage, (
				texture) => {
				texture.wrapS = THREE.RepeatWrapping
				texture.wrapT = THREE.RepeatWrapping
				//表示在x、y上的重复次数
				// texture.repeat.set(param.map.repeat.u, param.map.repeat.v);
				//表示在x、y上的偏移
				// texture.offset.set(param.map.offset.u, param.map.offset.v);
			}) : null; //纹理贴图 
			material.name = eles[i].Id;
			material.EId = eles[i].Id;
			currentMaterials.push(material);
		}
	}
	//创建柱子
	function CreatorColumn(eles) {
		for (let i = 0; i < eles.length; i++) {
			var ele = eles[i];
			//定义路径
			var routes = [];
			for (var j = 0; j < ele.routes.length; j++) {
				routes.push(getPosition(ele.routes[j]));
			}
			//计算轮廓

			for (let j = 0; j < ele.outline.length; j++) {
				let BaseShape = new THREE.Shape();
				//定义轮廓线 
				BaseShape.moveTo(getPosition_2D(ele.outline[j][0]).x, getPosition_2D(ele.outline[j][0]).y)
				for (let k = ele.outline[j].length - 1; k >= 0; k--) {
					var point = ele.outline[j][k];
					BaseShape.lineTo(getPosition_2D(ele.outline[j][k]).x, getPosition_2D(ele.outline[j][k]).y);
				}
				if (ele.cutline != null) {
					for (let jj = 0; jj < ele.cutline.length; jj++) {
						//定义轮廓线  
						let Shape = new THREE.Path();
						Shape.moveTo(getPosition_2D(ele.cutline[jj][0]).x, getPosition_2D(ele.cutline[jj][0]).y);
						for (let ks = ele.cutline[jj].length - 1; ks >= 0; ks--) {
							var point = ele.cutline[jj][ks];
							Shape.lineTo(getPosition_2D(ele.cutline[jj][ks]).x, getPosition_2D(ele.cutline[jj][ks]).y);
						}
						BaseShape.holes.push(Shape);
					}
				}
				//创建模型
				for (let kk = 0; kk < routes.length - 1; kk++) {
					let start = routes[kk];
					let end = routes[kk + 1];
					const extrudeSettings = {
						depth: start.distanceTo(end), //拉伸长度
						bevelEnabled: false
					};
					var param = {
						startPoint: start,
						endPoint: end,
						// base_x: new THREE.Vector3(1, 0, 0),
						name: ele.Name
					};
					var mesh = addShape(BaseShape, extrudeSettings, ele.MaterialId, start, param);
					// scene.add(mesh);
					allMesh.push(mesh);
				}
			}
		}
	}
	//创建梁
	function CreatorBeam(eles) {
		for (var i = 0; i < eles.length; i++) {
			var ele = eles[i];

		}
	}
	//创建板
	function CreatorFloor(eles) {

	}
	//窗间墙
	function CreatorWall(eles) {
		for (var i = 0; i < eles.length; i++) {
			var ele = eles[i];

		}
	}

	function d(geometry) {
		return geometry;
		// 单独指定顶点坐标属性
		const positions = geometry.attributes.position;
		const positionAttribute = new THREE.BufferAttribute(positions, 3);
		// 将非索引数据转换为索引数据
		const indices = [];
		for (let i = 0; i < positionAttribute.length / 3; i += 3) {
			indices.push(i, i + 1, i + 2);
		}
		const indexAttribute = new THREE.BufferAttribute(new Uint16Array(indices), 1);
		geometry.setIndex(indexAttribute);
		return geometry;
	}

	//通用方法
	//获取创建拉伸模型
	function addShape(shape, extrudeSettings, mId, position, param) {
		// const geometry = new THREE.BoxGeometry(1, 1, 1);
		let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		// geometry=d(geometry);
		let matIndex = currentMaterials.findIndex(x => x.EId == mId);
		// mesh.name = "rootModel";  
		var mat = defaultMat;

		if (matIndex == -1) {
			mat = defaultMat;
		} else {
			mat = currentMaterials[matIndex];
		}
		let mesh = new THREE.Mesh(geometry, mat);


		let start = new THREE.Vector3(param.startPoint.x, 0, param.startPoint.z);
		let end = new THREE.Vector3(param.endPoint.x, 0, param.endPoint.z);

		let start_ = new THREE.Vector3(param.startPoint.x, param.startPoint.y, param.startPoint.z);
		let end_ = new THREE.Vector3(param.endPoint.x, param.endPoint.y, param.endPoint.z);

		let angle_x = 0;
		let angle_y = 0;
		let angle_z = 0;
		//end.clone().sub(start.clone())是起点到终点的投影向量
		if (Math.abs(end.clone().sub(start.clone()).z) < 0.0001 && Math.abs(end.clone().sub(start.clone()).x) <
			0.0001) {
			//立管
			let dir = param.startPoint.y > param.endPoint.y ? 1 : -1; //判断立管是向上还是向下的
			angle_x = dir * Math.PI * 0.5; //旋转90度，让管子竖起来
			if (param.base_x != null) {
				var basex = new THREE.Vector3(param.base_x.x, 0, param.base_x.y);
				let dir_ = basex.clone().cross(new THREE.Vector3(1, 0, 1)).y < 0 ? 1 : -1;
				angle_z = dir_ * basex.angleTo(new THREE.Vector3(1, 0, 0));
			}
		} else {
			//普通管道
			let dir = end.clone().sub(start.clone()).cross(new THREE.Vector3(0, 0, 1)).y >= 0 ? -1 : 1;
			angle_y = dir * end.clone().sub(start.clone()).angleTo(new THREE.Vector3(0, 0, 1));
			//倾斜管道
			let dir_ = param.startPoint.y > param.endPoint.y ? 1 : -1;
			angle_x = dir_ * end.clone().sub(start.clone()).angleTo(end_.clone().sub(start_.clone()));
		}
		//力官的方向


		mesh.position.set(position.x, position.y, position.z);
		mesh.rotation._order = "YXZ"
		mesh.rotation.set(angle_x, angle_y, angle_z);


		mesh.name = param.name;
		mesh.IsMerge = false;
		mesh.MergeIndex = 0;
		mesh.MergeCount = 1;
		mesh.MergeName = param.name;
		mesh.startPoint = param.startPoint;
		mesh.endPoint = param.endPoint;
		mesh.materialId = mId;
		// scene.add(mesh);
		return mesh
	}
	//获取坐标点
	function getPosition(point) {
		var p = new THREE.Vector3(point.X * 0.3048, point.Z * 0.3048, -point.Y * 0.3048);
		return p;
	}

	function getPosition_(point) {
		var p = new THREE.Vector3(point.X * 0.3048, point.Z * 0.3048, point.Y * 0.3048);
		return p;
	}

	function getPosition_2D(point) {
		if (point == null) {
			return new THREE.Vector2(0, 0, 0);
		}
		var p = new THREE.Vector2(point.X * 0.3048, point.Y * 0.3048);
		return p;
	}
}

function mergeBufferModel(scene, meshs, path, basePath, relativePath, currentMaterials) {
	// window.bimEngine.MaterialMapList = [
	// 	{
	// 		path: "glbs/qq",
	// 		mapList:[
	// 			// {
	// 			// 	glb: "file/glbs/qq/semantics.json",
	// 			// 	materialId: "409858960632317189",
	// 			// 	meshId: "楼板-200mm[634203][a4a3816d-3f82-4c50-b852-b5aeeb6e77af-0009ad5b]",
	// 			// 	materialName: "619355"
	// 			// },
	// 			{
	// 				glb: "file/glbs/qq/semantics.json",
	// 				materialId: "409858960632317191",
	// 				meshId:  "楼板-200mm[634203][a4a3816d-3f82-4c50-b852-b5aeeb6e77af-0009ad5b]",
	// 				materialName: "619355",
	// 				Img: "/materialFile/Image/material/20230327_409877721166906629.jpg",
	// 				param: {
	// 					color: "rgb(255,255,255)",
	// 					emissive: "rgb(255,255,255)",
	// 					emissiveIntensity: 0,
	// 					metalness: 0,
	// 					name: "木纹-01",
	// 					normalScale: 1,
	// 					opacity: 1,
	// 					roughness: 0.5,
	// 					side: "DoubleSide",
	// 					transparent: false,
	// 					//贴图
	// 					map: {
	// 						url: "",
	// 						repeat: {
	// 							u: 1,
	// 							v: 1
	// 						},
	// 						offset: {
	// 							u: 0,
	// 							v: 0
	// 						}
	// 					}, //纹理贴图
	// 					normalMap: {
	// 						url: '',
	// 						repeat: {
	// 							u: 1,
	// 							v: 1
	// 						},
	// 						offset: {
	// 							u: 0,
	// 							v: 0
	// 						}
	// 					}, //法线贴图
	// 					roughnessMap: {
	// 						url: '',
	// 						repeat: {
	// 							u: 1,
	// 							v: 1
	// 						},
	// 						offset: {
	// 							u: 0,
	// 							v: 0
	// 						}
	// 					}, //粗糙贴图
	// 				}
	// 			}
	// 		]
	// 	}
	// ]
	let geometryArray = []; // 将你的要合并的多个geometry放入到该数组
	let materialArray = []; // 将你的要赋值的多个material放入到该数组
	let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
	let MaterialMapList = window.bimEngine.MaterialMapList.filter(item => item.path === relativePath)
	//对mesh位置进行偏移
	for (var i = 0; i < meshs.length; i++) {
		let o = meshs[i];
		if (o.geometry != null && o.matrix != null) {
			//o.geometry.matrix是假的，需要自己创建4维矩阵
			var matrix = new THREE.Matrix4();
			matrix = matrix.makeRotationFromEuler(o.rotation);
			matrix.elements[12] = o.position.x;
			matrix.elements[13] = o.position.y;
			matrix.elements[14] = o.position.z;
			let matrixWorldGeometry = o.geometry.clone().applyMatrix4(matrix.clone());

			o.material.side = THREE.DoubleSide;

			let materialMap = MaterialMapList.length ? MaterialMapList[0].mapList.filter(item => item.meshId === o
				.name)[
				0] : null
			if(materialMap && materialMap.Param){
				UpdateMaterialAttribute(o.material, materialMap.Param)
				o.material.materialMap = {
					Id: materialMap.materialId,
					Name: materialMap.Param.name,
					Img: materialMap.Img,
					Param: materialMap.Param
				}
			}

			geometryArray.push(matrixWorldGeometry);
			materialArray.push(o.material)
			//如果我们直接获取boundingBox，得到的结果将会是undefined，需要先执行计算。
			o.geometry.computeBoundingBox()
			let _min = o.geometry.boundingBox.min.clone().applyMatrix4(matrix
				.clone());
			let _max = o.geometry.boundingBox.max.clone().applyMatrix4(matrix
				.clone());
			let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math
				.min(_min.z, _max.z));
			let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math
				.max(_min.z, _max.z));
			let center = min.clone().add(max.clone()).multiplyScalar(0.5);
			let positions = []
			ElementInfoArray.push({
				name: o.name,
				min: min,
				max: max,
				center: center,
				dbid: i,
				IsMerge: o.IsMerge,
				MergeIndex: o.MergeIndex,
				MergeCount: o.MergeCount,
				MergeName: o.MergeName,
				EdgeList: positions,
				basePath: basePath,
				materialName: o.material.name
			});
		}
	}
	//加载模型
	// const mergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(geometryArray,true);
	// const singleMergeMesh = new THREE.Mesh(mergedGeometries, materialArray);
	const mergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(geometryArray, true);
	const singleMergeMesh = new THREE.Mesh(mergedGeometries, materialArray[0]);


	let matIndex = currentMaterials.findIndex(x => x.EId == meshs[0].materialId);
	let cloneMaterial;
	if (matIndex == -1) {
		cloneMaterial = meshs[0].material.clone();
		cloneMaterial.materialMap = meshs[0].material.materialMap;
	} else {
		cloneMaterial = currentMaterials[matIndex].clone();
		cloneMaterial.materialMap = currentMaterials[matIndex].materialMap;
	}

	singleMergeMesh.ElementInfos = ElementInfoArray;
	singleMergeMesh.cloneMaterialArray = cloneMaterial;
	singleMergeMesh.relativePath = relativePath;
	singleMergeMesh.name = "rootModel";
	singleMergeMesh.TypeName = "Mesh";
	singleMergeMesh.meshs = meshs;
	singleMergeMesh.url = path;
	singleMergeMesh.basePath = basePath
	// console.log(singleMergeMesh)
	scene.add(singleMergeMesh);

	
}

function mergeBufferModel_old(scene, meshs, path, basePath, relativePath) {
	let geometryArray = []; // 将你的要合并的多个geometry放入到该数组
	let materialArray = []; // 将你的要赋值的多个material放入到该数组
	let cloneMaterialArray = []; // 将你的要赋值的多个material放入到该数组
	let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
	let MaterialMapList = window.bimEngine.MaterialMapList.filter(item => item.path === relativePath)
	//对mesh位置进行偏移
	for (var i = 0; i < meshs.length; i++) {
		let o = meshs[i];
		if (o.geometry != null && o.matrix != null) {
			//o.geometry.matrix是假的，需要自己创建4维矩阵
			var matrix = new THREE.Matrix4();
			matrix = matrix.makeRotationFromEuler(o.rotation);
			matrix.elements[12] = o.position.x;
			matrix.elements[13] = o.position.y;
			matrix.elements[14] = o.position.z;
			let matrixWorldGeometry = o.geometry.clone().applyMatrix4(matrix.clone());

			o.material.side = THREE.DoubleSide;

			let materialMap = MaterialMapList.length ? MaterialMapList[0].mapList.filter(item => item.meshId === o
				.name)[
				0] : null
			let paramMaterial = materialMap ? window.bimEngine.MaterialList.filter(item => item.Id === materialMap
				.materialId)[0] : null
			if (paramMaterial && paramMaterial.Param) {
				UpdateMaterialAttribute(o.material, paramMaterial.Param)
			}

			geometryArray.push(matrixWorldGeometry);
			materialArray.push(o.material)
			cloneMaterialArray.push(o.material.clone());
			//如果我们直接获取boundingBox，得到的结果将会是undefined，需要先执行计算。
			o.geometry.computeBoundingBox()
			let _min = o.geometry.boundingBox.min.clone().applyMatrix4(matrix
				.clone());
			let _max = o.geometry.boundingBox.max.clone().applyMatrix4(matrix
				.clone());
			let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math
				.min(_min.z, _max.z));
			let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math
				.max(_min.z, _max.z));
			let center = min.clone().add(max.clone()).multiplyScalar(0.5);
			let positions = []
			ElementInfoArray.push({
				name: o.name,
				min: min,
				max: max,
				center: center,
				dbid: i,
				IsMerge: o.IsMerge,
				MergeIndex: o.MergeIndex,
				MergeCount: o.MergeCount,
				MergeName: o.MergeName,
				EdgeList: positions,
				basePath: basePath,
				materialid:o.material.name,
			});
		}
	}
	//加载模型
	// const mergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(geometryArray,true);
	// const singleMergeMesh = new THREE.Mesh(mergedGeometries, materialArray);
	const mergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(geometryArray, true);
	var mat = new THREE.MeshStandardMaterial({
		side: THREE.DoubleSide
	})
	const singleMergeMesh = new THREE.Mesh(mergedGeometries, mat);


	singleMergeMesh.ElementInfos = ElementInfoArray;
	singleMergeMesh.cloneMaterialArray = cloneMaterialArray;
	singleMergeMesh.relativePath = relativePath;
	singleMergeMesh.name = "rootModel";
	singleMergeMesh.TypeName = "Mesh";
	singleMergeMesh.meshs = meshs;
	singleMergeMesh.url = path;
	singleMergeMesh.basePath = basePath
	// console.log(singleMergeMesh)
	scene.add(singleMergeMesh);

	setLoaded(path, relativePath);
}

function setLoaded(path, relativePath) {
	window.bimEngine.doneModels.push(path);
	window.bimEngine.UpdateLoadStatus('structureModelsLoadedNum', relativePath, path);
}