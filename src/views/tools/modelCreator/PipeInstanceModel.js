const THREE = require('@/three/three.js')
import {
	LoadZipJson
} from "@/utils/LoadJSON.js" 
//绘制管道
export function CreatorInstancePipe(scene, relativePath, url, infos) {
	let path = url + '/sysmodelList.zip'
	let pipeLoadNum = 0
	LoadZipJson(path, res => {
		 
		let sysmodelList = JSON.parse(res)
		// console.log("管道模型",sysmodelList)
		let circularMepsList = sysmodelList.circularMeps //圆形管道
		let rectMepsList = sysmodelList.rectMeps.filter(item => item.type === "风管") //矩形风管
		let bridgeMepsList = sysmodelList.rectMeps.filter(item => item.type === "桥架") //矩形桥架
		let ellipseMepsList = sysmodelList.ellipseMeps //椭圆管道
		let meshList = [] //所有mesh

		//绘制圆形管道
		if(circularMepsList && circularMepsList.length){
			let meshParamList = []
			for (let Mep of circularMepsList) {
				Mep.color = new THREE.Color(`rgb(${Mep.color})`)
				Mep.position = {
						x: Mep.startPoint.X * 0.3048,
						y: Mep.startPoint.Z * 0.3048,
						z: -Mep.startPoint.Y * 0.3048
					},
					Mep.rotation = {
					x: 0,
					y: 0,
					z: 0
				}
				meshParamList.push(Mep)
			}
			mergeBufferModel('Circle', scene, meshParamList, relativePath, url, path)
		}else{
			setLoaded()
		}
		
		//绘制矩形风管
		if(rectMepsList && rectMepsList.length){
			let meshParamList = []
			for (let Mep of rectMepsList) {
				Mep.color = new THREE.Color(`rgb(${Mep.color})`)
				Mep.position = {
						x: Mep.startPoint.X * 0.3048,
						y: Mep.startPoint.Z * 0.3048,
						z: -Mep.startPoint.Y * 0.3048
					},
					Mep.rotation = {
					x: 0,
					y: 0,
					z: 0
				}
				meshParamList.push(Mep)
			}
			mergeBufferModel('Rect', scene, meshParamList, relativePath, url, path)
		}else{
			setLoaded()
		}

		//绘制矩形桥架
		if(bridgeMepsList && bridgeMepsList.length){
			let meshParamList = []
			for (let Mep of bridgeMepsList) {
				Mep.color = new THREE.Color(`rgb(${Mep.color})`)
				Mep.position = {
						x: Mep.startPoint.X * 0.3048,
						y: Mep.startPoint.Z * 0.3048,
						z: -Mep.startPoint.Y * 0.3048
					},
					Mep.rotation = {
					x: 0,
					y: 0,
					z: 0
				}
				meshParamList.push(Mep)
			}
			mergeBufferModel('Bridge', scene, meshParamList, relativePath, url, path)
		}else{
			setLoaded()
		}
		

	})

	function setLoaded(){
		pipeLoadNum = pipeLoadNum+1
		if(pipeLoadNum === 3){
			window.bimEngine.doneModels.push(path);
			window.bimEngine.loadedDone('pipeModelsLoadedNum')
			
			return
		let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel" && o.TypeName == "InstancedMesh");
		// console.log(rootmodels)
		if(rootmodels && rootmodels.length){
			let modelsList = []
			for (let i = 0; i < rootmodels.length; i++) {
				let model = {
					TypeName: rootmodels[i].TypeName,
					ElementInfos: []
				}
				for (let j = 0; j < rootmodels[i].ElementInfos.length; j++) {
					let ele = {
						geometry: [...rootmodels[i].geometry.attributes.position.array],
						matrix: [...rootmodels[i].instanceMatrix.array.slice(j * 16, (j+1) * 16)]
					}
					model.ElementInfos.push(ele)
				}
				modelsList.push(model)
			}
			// console.log(modelsList)
			console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
			// return
			//计算边线-并存储，用于测量捕捉
			var worker = new Worker('static/js/filePipe.worker.js');
			worker.postMessage(modelsList); //将复杂计算交给子线程,可以理解为给参数让子线程去操作。
			worker.onmessage = function(e) {
				// console.log(new Date().getMinutes() + ":"+ new Date().getSeconds())
				let backList = e.data
				console.log(backList)
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
	}

	
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
		return addShape(Shape, extrudeSettings, param.color, param.position, param.rotation);
	
	
	
	
		function addShape(shape, extrudeSettings, color, position, rotation) {
			let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
			let mat = new THREE.MeshPhongMaterial({
				color: color,
				side: THREE.DoubleSide
			})
	
			let mesh = new THREE.Mesh(geometry, mat);
			mesh.position.set(position.x, position.y, position.z);
			mesh.rotation._order = "YXZ"
			mesh.rotation.set(rotation.x, rotation.y, rotation.z);
	
			return mesh
		}
	}
	
	
	//合并模型 
	function mergeBufferModel(type, scene, meshs, relativePath, url, path) {
		let instancedMesh, mesh;
		let Param = {
			width:1,
			height:1,
			length:1,
			diameter:1,
			color: new THREE.Color(),
			position:{
				x:0,
				y:0,
				z:0
			},
			rotation:{
				x:0,
				y:0,
				z:0
			}
		}
		switch (type) {
			case 'Rect':
				mesh = DrawPipes('Rect', Param, scene)
				instancedMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, meshs.length);
				break;
			case 'Bridge':
				mesh = DrawPipes('Bridge', Param, scene)
				instancedMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, meshs.length);
				break;
			case 'Circle':
				mesh = DrawPipes('Circle', Param, scene)
				instancedMesh = new THREE.InstancedMesh(mesh.geometry, mesh.material, meshs.length);
				break;
		}
	
	
		let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
		window.color = new THREE.Color();
		for (var j = 0; j < meshs.length; j++) {
			let param = meshs[j];
	
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
					let dir_ = basex.clone().cross(new THREE.Vector3(0, 0, 1)).y <= 0 ? 1 : -1;
					
					angle_y = dir_ * basex.angleTo(new THREE.Vector3(0, 0, 1))+Math.PI*0.5;
				}
	
	
			} else {
				//普通管道
				let dir = end.clone().sub(start.clone()).cross(new THREE.Vector3(0, 0, 1)).y > 0 ? -1 : 1;
				angle_y = dir * end.clone().sub(start.clone()).angleTo(new THREE.Vector3(0, 0, 1));
				//倾斜管道
				let dir_ = param.startPoint.Z > param.endPoint.Z ? 1 : -1;
				angle_x = dir_ * end.clone().sub(start.clone()).angleTo(end_.clone().sub(start_.clone()));
	
			}
			
			
			let matrix = new THREE.Matrix4();
			const euler = new THREE.Euler( angle_x, angle_y, angle_z, 'YXZ' );
				
			// 创建旋转矩阵
			let T1 = matrix.clone().makeRotationFromEuler(euler)
			// 创建缩放矩阵
			let width, height;
			if(type==='Circle'){
				width = param.diameter
				height = param.diameter
			}else{
				width = param.width
				height = param.height
			}
			let T2 = matrix.clone().makeScale(width,height,param.length) 
			// 旋转和缩放合并
			matrix.multiplyMatrices(T1,T2)
			//设置矩阵位置
			matrix.setPosition(param.position.x, param.position.y, param.position.z) 
			
			//更新矩阵
			instancedMesh.setMatrixAt(j, matrix.clone());
			//更新颜色
			instancedMesh.setColorAt(j, param.color);
	
			instancedMesh.geometry.computeBoundingBox()
			let _min =instancedMesh.geometry.boundingBox.min.clone().applyMatrix4(matrix
				.clone());
			let _max = instancedMesh.geometry.boundingBox.max.clone().applyMatrix4(matrix
				.clone());
			let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math
				.min(_min.z, _max.z));
			let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math
				.max(_min.z, _max.z));
			let center = min.clone().add(max.clone()).multiplyScalar(0.5);
	
			ElementInfoArray.push({
				name: param.name,
				min: min,
				max: max,
				center: center,
				dbid: j,
				IsMerge: false,
				MergeIndex: 0,
				MergeCount: 1,
				MergeName: param.MergeName,
				url: path,
				EdgeList: [],
				matrix: matrix,
				basePath: url,
				relativePath: relativePath
			});
		}
		
		instancedMesh.ElementInfos = ElementInfoArray;
		instancedMesh.name = "rootModel";
		instancedMesh.TypeName = "InstancedMesh-Pipe";
		instancedMesh.MeshId = null;
		instancedMesh.cloneMaterialArray = instancedMesh.material.clone();
		instancedMesh.basePath = url;
		instancedMesh.relativePath = relativePath;
		instancedMesh.meshs = instancedMesh;
		instancedMesh.url = path;
		instancedMesh.cloneInstanceColor = Array.from(instancedMesh.instanceColor.array)
		instancedMesh.cloneInstanceMatrix = Array.from(instancedMesh.instanceMatrix.array)
		scene.add(instancedMesh);
		
		setLoaded()
	
	}
}