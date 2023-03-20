const THREE = require('@/three/three.js')
import LoadJSON from "@/utils/LoadJSON.js" 
//绘制管道
export function CreatorPipe(scene, url, infos) {

	LoadJSON(url + '/sysmodelList.json', res => {
		let sysmodelList = JSON.parse(res)
		// console.log("管道模型",sysmodelList)
		let circularMepsList = sysmodelList.circularMeps //圆形管道
		let rectMepsList = sysmodelList.rectMeps.filter(item => item.type === "风管") //矩形风管
		let bridgeMepsList = sysmodelList.rectMeps.filter(item => item.type === "桥架") //矩形桥架
		let ellipseMepsList = sysmodelList.ellipseMeps //椭圆管道
		let meshList = [] //所有mesh

		//绘制圆形管道
		for (let Mep of circularMepsList) {
			let item = Mep
			item.color = new THREE.Color(`rgb(${Mep.color})`)
			item.position = {
					x: Mep.startPoint.X * 0.3048,
					y: Mep.startPoint.Z * 0.3048,
					z: -Mep.startPoint.Y * 0.3048
				},
				item.rotation = {
					x: 0,
					y: 0,
					z: 0
				},
				item.scale = 1
			let mesh = DrawPipes('Circle', item, scene)
			meshList.push(mesh)
		}


		//绘制矩形风管
		for (let Mep of rectMepsList) {
			let item = Mep
			item.color = new THREE.Color(`rgb(${Mep.color})`)
			item.position = {
					x: Mep.startPoint.X * 0.3048,
					y: Mep.startPoint.Z * 0.3048,
					z: -Mep.startPoint.Y * 0.3048
				},
				item.rotation = {
					x: 0,
					y: 0,
					z: 0
				},
				item.scale = 1
			let mesh = DrawPipes('Rect', item, scene)
			meshList.push(mesh)
		}

		//绘制矩形桥架
		for (let Mep of bridgeMepsList) {
			let item = Mep
			item.color = new THREE.Color(`rgb(${Mep.color})`)
			item.position = {
					x: Mep.startPoint.X * 0.3048,
					y: Mep.startPoint.Z * 0.3048,
					z: -Mep.startPoint.Y * 0.3048
				},
				item.rotation = {
					x: 0,
					y: 0,
					z: 0
				},
				item.scale = 1
			let mesh = DrawPipes('Bridge', item, scene)
			meshList.push(mesh)
		}

		if(meshList && meshList.length){
			mergeBufferModel(scene, meshList, url + '/sysmodelList.json', url)
		}else{
			window.bimEngine.loadedDone('pipeModelsLoadedNum')
		}
		
	})

}
var mats = [];
//绘制矩形管道
function DrawPipes(type, param, scene) {
	let Shape = new THREE.Shape()
	param.width = param.width * 0.3048;
	param.height = param.height * 0.3048;
	param.diameter = param.diameter * 0.3048;
	switch (type) {
		case 'Rect':
			Shape.moveTo(-param.width / 2, -param.height / 2) //绘制直线
			Shape.lineTo(-param.width / 2, param.height / 2)
			Shape.lineTo(param.width / 2, param.height / 2)
			Shape.lineTo(param.width / 2, -param.height / 2);
			Shape.lineTo(-param.width / 2, -param.height / 2)
			break;
		case 'Bridge':
			Shape.moveTo(-param.width / 2, -param.height / 2);
			Shape.lineTo(-param.width / 2, param.height / 2);
			Shape.lineTo(-param.width / 2 + 0.01, param.height / 2);
			Shape.lineTo(-param.width / 2 + 0.01, -param.height / 2 + 0.01);
			Shape.lineTo(param.width / 2 - 0.01, -param.height / 2 + 0.01);
			Shape.lineTo(param.width / 2 - 0.01, param.height / 2);
			Shape.lineTo(param.width / 2, param.height / 2);
			Shape.lineTo(param.width / 2, -param.height / 2);
			Shape.lineTo(-param.width / 2, -param.height / 2);
			break;
		case 'Circle':
			// .absarc ( x : Float, y : Float, radius : Float, startAngle : Float, endAngle : Float, clockwise : Boolean ) : this
			// x, y -- 弧线的绝对中心。
			// radius -- 弧线的半径。
			// startAngle -- 起始角，以弧度来表示。
			// endAngle -- 终止角，以弧度来表示。
			// clockwise -- 以顺时针方向创建（扫过）弧线。默认值为false。
			Shape.moveTo(0, 0)
			Shape.absarc(0, 0, param.diameter * 0.5, 0, Math.PI * 2, false);

			break;
	}

	const extrudeSettings = {
		depth: param.length * 0.3048, //拉伸长度
		bevelEnabled: false
	};
	return addShape(Shape, extrudeSettings, param.color, param.position, param.rotation, param.scale);




	function addShape(shape, extrudeSettings, color, position, rotation, scale) {
		let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		let mat = null;
		// mesh.name = "rootModel";

		let matIndex = mats.findIndex(x => x.color.r == color.r && x.color.b == color.b && x.color.g == color.g);
		if (matIndex == -1) {
			mat = new THREE.MeshPhongMaterial({
				color: color
			})
			mats.push(mat)
		} else {
			mat = mats[matIndex];
		}

		let mesh = new THREE.Mesh(geometry, mat);
		let start = new THREE.Vector3(param.startPoint.X, 0, -param.startPoint.Y);
		let end = new THREE.Vector3(param.endPoint.X, 0, -param.endPoint.Y);

		let start_ = new THREE.Vector3(param.startPoint.X, param.startPoint.Z, -param.startPoint.Y);
		let end_ = new THREE.Vector3(param.endPoint.X, param.endPoint.Z, -param.endPoint.Y);

		let angle_x = 0;
		let angle_y = 0;
		let angle_z = 0;
		//end.clone().sub(start.clone())是起点到终点的投影向量
		if (Math.abs(end.clone().sub(start.clone()).z) < 0.01 && Math.abs(end.clone().sub(start.clone()).x) < 0.01) {
			//立管
			let dir = param.startPoint.Z > param.endPoint.Z ? 1 : -1; //判断立管是向上还是向下的
			angle_x = dir * Math.PI * 0.5; //旋转90度，让管子竖起来
			if (param.base_x != null) {
				var basex = new THREE.Vector3(param.base_x.X, 0, -param.base_x.Y);
				let dir_ = basex.clone().cross(new THREE.Vector3(0, 0, 1)).y < 0 ? 1 : -1;
				angle_z = dir_ * basex.angleTo(new THREE.Vector3(1, 0, 0));
			}


		} else {
			//普通管道
			let dir = end.clone().sub(start.clone()).cross(new THREE.Vector3(0, 0, 1)).y > 0 ? -1 : 1;
			angle_y = dir * end.clone().sub(start.clone()).angleTo(new THREE.Vector3(0, 0, 1));
			//倾斜管道
			let dir_ = param.startPoint.Z > param.endPoint.Z ? 1 : -1;
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
		// mesh.extrudeParam = param;
		// scene.add(mesh);
		return mesh
	}
}


//合并模型 
function mergeBufferModel(scene, meshs, path, basePath) {
	let geometryArray = []; // 将你的要合并的多个geometry放入到该数组
	let materialArray = []; // 将你的要赋值的多个material放入到该数组
	let cloneMaterialArray = []; // 将你的要赋值的多个material放入到该数组
	let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
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

			//计算边线-并存储，用于测量捕捉
			// var edges = new THREE.EdgesGeometry(o.geometry, 89); //大于89度才添加线条 
			// var ps = edges.attributes.position.array;
			// let positions = []
			// for (var ii = 0; ii < ps.length; ii = ii + 3) {
			// 	let point = new THREE.Vector3(ps[ii], ps[ii + 1], ps[ii + 2]);
			// 	let newpoint = point.clone().applyMatrix4(matrix.clone());
			// 	positions.push(newpoint.x);
			// 	positions.push(newpoint.y);
			// 	positions.push(newpoint.z);
			// }
			// 绘制边线
			// let geometry = new THREE.BufferGeometry()
			// geometry.setAttribute(
			// 	'position',
			// 	new THREE.Float32BufferAttribute(positions, 3)
			// )
			// const bufferline = new THREE.LineSegments(
			// 	geometry,
			// 	new THREE.LineBasicMaterial({
			// 		color: '#000000'
			// 	})
			// )
			// scene.add(bufferline);

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
				EdgeList: [],
				basePath: basePath
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
	singleMergeMesh.TypeName = "PipeMesh";
	singleMergeMesh.meshs = meshs;
	singleMergeMesh.url = path;
	singleMergeMesh.basePath = basePath
	// console.log(singleMergeMesh)
	scene.add(singleMergeMesh);
	window.bimEngine.doneModels.push(path);
	window.bimEngine.loadedDone('pipeModelsLoadedNum')
	console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())


	let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel" && o.TypeName == "PipeMesh");
	console.log(rootmodels)
	if(rootmodels && rootmodels.length){
		let modelsList = []
		for (let i = 0; i < rootmodels.length; i++) {
			let model = {
				TypeName: rootmodels[i].TypeName,
				ElementInfos: []
			}
			for (let j = 0; j < rootmodels[i].ElementInfos.length; j++) {
				let ele = {
					geometry: [...rootmodels[i].meshs[j].geometry.attributes.position.array],
					matrix: [...rootmodels[i].meshs[j].matrix.elements],
					position: rootmodels[i].meshs[j].position.clone(),
					rotation: rootmodels[i].meshs[j].rotation.clone(),
					// extrudeParam:rootmodels[i].meshs[j].extrudeParam,
				}
				model.ElementInfos.push(ele)
			}
			modelsList.push(model)
		}
		console.log(modelsList)
		console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
		// return
		//计算边线-并存储，用于测量捕捉
		var worker = new Worker('static/js/filePipe.worker.js');
		worker.postMessage(modelsList); //将复杂计算交给子线程,可以理解为给参数让子线程去操作。
		worker.onmessage = function(e) {
			// console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
			let backList = e.data
			for (let i = 0; i < backList.length; i++) {
				for (let j = 0; j < backList[i].ElementInfos.length; j++) {
					rootmodels[i].ElementInfos[j].EdgeList = backList[i].ElementInfos[j].EdgeList
				}
			}
			console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
			worker.terminate()
		}
		worker.onerror = function(event) {
			worker.terminate()
		}

	}

}
