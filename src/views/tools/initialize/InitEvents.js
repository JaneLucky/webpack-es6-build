const THREE = require('@/three/three.js')
//控制操作加载库
import "@/three/controls/OrbitControls"
//控制操作加载库
import "@/three/effects/AnaglyphEffect"
import '@/three/controls/TransformControls.js';


//定义窗口的设置
export function SceneResize() {
	//加入事件监听器,窗口自适应
	window.addEventListener('resize', function() {
		const WIDTH = (window.bimEngine.scene.renderer.domElement.parentElement.clientWidth)// * window.devicePixelRatio;
		const HEIGHT = (window.bimEngine.scene.renderer.domElement.parentElement.clientHeight)// * window.devicePixelRatio;
		window.bimEngine.scene.renderer.domElement.width = WIDTH
		window.bimEngine.scene.renderer.domElement.height = HEIGHT
		window.bimEngine.scene.renderer.setSize(WIDTH, HEIGHT);
		const ASPECT_RATIO = WIDTH / HEIGHT;
		window.bimEngine.scene.camera.aspect = ASPECT_RATIO;
		window.bimEngine.scene.camera.viewport = new THREE.Vector4(0, 0, Math.ceil(WIDTH), Math.ceil(HEIGHT));
		window.bimEngine.scene.camera.updateProjectionMatrix();
		var doms = document.getElementsByClassName("ViewControlPanel");
		if(doms){
			doms[0].style.width = WIDTH + "px";
			doms[0].style.height = HEIGHT + "px";
		}
		window.bimEngine.RenderUpdata()
	});
}

//定义鼠标事件
export function setEventsMouse(bimEngine, callBack) {
	let CAMERA_POSITION;


	// 判断但双击的参数
	let clickid = 1;
	let timer = null;
	let startTime, endTime;
	//点击了鼠标左键 - 高亮选中的构建，并返回选中的构建
	bimEngine.scene.renderer.domElement.addEventListener('pointerup', function(event) {
		click()
		// if(clickid == 1) {
		// 	startTime = new Date().getTime();
		// 	clickid++;
		// 	timer = setTimeout(function () {
		// 		click(); // 单击事件触发
		// 		clickid = 1;
		// 	}, 300)
		// }
		// if(clickid == 2) {
		// 	clickid ++ ;
		// } else {
		// 	endTime = new Date().getTime();
		// 	if ((endTime - startTime) < 300) {
		// 		click(); // 单击事件触发
		// 		// dblclick(); // 双击事件
		// 		clickid = 1;
		// 		clearTimeout(timer);
		// 	}
		// }
		function click() { // 单击
			bimEngine.UpdateRender();
			let keyType = (event.ctrlKey || event.shiftKey) ? "keyEnter" : ""
			if (event.button === 0 && !bimEngine.StopClick) {
				event.preventDefault(); // 阻止默认的点击事件执行
				if (CAMERA_POSITION && Math.abs(event.x - CAMERA_POSITION.x) < 2 && Math.abs(event.y -
						CAMERA_POSITION.y) < 2) {
					//声明 rayCaster 和 mouse 变量
					let rayCaster = new THREE.Raycaster();
					let mouse = new THREE.Vector2();
					//通过鼠标点击位置，计算出raycaster所需点的位置，以屏幕为中心点，范围-1到1
					// mouse.x = ((event.clientX - document.body.getBoundingClientRect().left) / document.body
					// 	.offsetWidth) * 2 - 1;
					// mouse.y = -((event.clientY - document.body.getBoundingClientRect().top) / document.body
					// 	.offsetHeight) * 2 + 1; //这里为什么是-号，没有就无法点中
					mouse.x = ((event.clientX - bimEngine.scene.camera.viewport.x) / bimEngine.scene.camera.viewport.z) * 2 - 1;
					mouse.y = -((event.clientY - bimEngine.scene.camera.viewport.y) / bimEngine.scene.camera.viewport.w) * 2 + 1; //这里为什么是-号，没有就无法点中
						 
					//通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
					rayCaster.setFromCamera(mouse, bimEngine.scene.camera);
					//获取与射线相交的对象数组， 其中的元素按照距离排序，越近的越靠前。
					//+true，是对其后代进行查找，这个在这里必须加，因为模型是由很多部分组成的，后代非常多。
					let intersects = (rayCaster.intersectObjects(bimEngine.GetAllVisibilityModel(), true));
					let BeforeSelection = JSON.parse(JSON.stringify(bimEngine.SelectedModels.indexesModels)) //选中的构建列表
					let BEFORE_SELECT = bimEngine.CurrentSelect ? bimEngine.CurrentSelect : {
						dbid: null,
						name: null,
						glb: null,
						TypeName: null,
						basePath: null,
						relativePath: null,
						indexs:[],
						min: null,
						center: null,
						max: null,
						materialName: null
					} //当前选中的构建位置信息，用于记录上一次选中的模型，也用于模型属性查询
					//存储选中构建 
					switch (keyType) {
						case "keyEnter": //ctrlClick/shiftClick
							if (intersects.length > 0) {
								for (var intersect of intersects) {
									if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName == "Mesh-Structure" || intersect.object.TypeName == "PipeMesh") {
										var clickObj = IncludeElement(intersect.object, intersect
											.point); //选中的构建位置信息
										if (clickObj && intersect.object.geometry.groups[clickObj.dbid].visibility !== false) {
											let indexes = [intersect.object.index, clickObj.dbid]
											let GroupIndex = BeforeSelection.findIndex(item => item.toString() == indexes.toString())
											if (GroupIndex < 0) { //不存在
												BEFORE_SELECT = {
													dbid: clickObj.dbid,
													name: clickObj.name,
													glb: intersect.object.url,
													TypeName: intersect.object.TypeName,
													basePath: clickObj.basePath,
													relativePath: clickObj.relativePath,
													indexs: [intersect.object.index, clickObj.dbid],
													min: intersect.object.ElementInfos[clickObj.dbid].min,
													center: intersect.object.ElementInfos[clickObj.dbid].center,
													max: intersect.object.ElementInfos[clickObj.dbid].max,
													materialName: intersect.object.ElementInfos[clickObj.dbid].materialName
												}
												BeforeSelection.push(indexes)
											} else { //存在
												BEFORE_SELECT = {
													dbid: null,
													name: null,
													glb: null,
													TypeName: null,
													basePath: null,
													relativePath: null,
													indexs:[],
													min: null,
													center: null,
													max: null,
													materialName: null
												}
												BeforeSelection.splice(GroupIndex, 1)
											}
											break;
										}
									} else if (intersect.object.TypeName == "InstancedMesh" || intersect.object.TypeName == "InstancedMesh-Pipe") {
										if(!ClipInclude(intersect.object.ElementInfos[intersect.instanceId].min, intersect.object.ElementInfos[intersect.instanceId].max, intersect.object.material.clippingPlanes, intersect.point)){
											let indexes = [intersect.object.index, intersect.instanceId]
											let GroupIndex = BeforeSelection.findIndex(item => item.toString() == indexes.toString())
											if (GroupIndex < 0) { //不存在
												BEFORE_SELECT = {
													dbid: intersect.instanceId,
													name: intersect.object.ElementInfos[intersect.instanceId].name,
													glb: intersect.object.url,
													TypeName: intersect.object.TypeName,
													basePath: intersect.object.basePath,
													relativePath: intersect.object.relativePath,
													indexs:[intersect.object.index, intersect.instanceId],
													min: intersect.object.ElementInfos[intersect.instanceId].min,
													center: intersect.object.ElementInfos[intersect.instanceId].center,
													max: intersect.object.ElementInfos[intersect.instanceId].max,
													materialName: intersect.object.ElementInfos[intersect.instanceId].materialName
												}
												BeforeSelection.push(indexes)
											} else { //存在
												BEFORE_SELECT = {
													dbid: null,
													name: null,
													glb: null,
													TypeName: null,
													basePath: null,
													relativePath: null,
													indexs:[],
													min: null,
													center: null,
													max: null,
													materialName: null
												}
												BeforeSelection.splice(GroupIndex, 1)
											}
											break;
										}
									}
								}
							}
							break;
						default: //click
							BeforeSelection = [];
							if (intersects.length > 0 && bimEngine.LockingSelect!=true) {
								for (var intersect of intersects) {
									if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName ==  "Mesh-Structure" || intersect.object.TypeName == "PipeMesh") {
										var clickObj = IncludeElement(intersect.object, intersect.point); //选中的构建位置信息
										if(clickObj && intersect.object.geometry.groups[clickObj.dbid].visibility !== false){
											let indexes = [intersect.object.index, clickObj.dbid]
	
											if(BEFORE_SELECT.toString() == indexes.toString()){
												BEFORE_SELECT = {
													dbid: null,
													name: null,
													glb: null,
													TypeName: null,
													basePath: null,
													relativePath: null,
													indexs:[],
													min: null,
													center: null,
													max: null,
													materialName: null
												}
											}else{
												BEFORE_SELECT = {
													dbid: clickObj.dbid,
													name: clickObj.name,
													glb: intersect.object.url,
													TypeName: intersect.object.TypeName,
													basePath:clickObj.basePath,
													relativePath:clickObj.relativePath,
													indexs:[intersect.object.index, clickObj.dbid],
													min: intersect.object.ElementInfos[clickObj.dbid].min,
													center: intersect.object.ElementInfos[clickObj.dbid].center,
													max: intersect.object.ElementInfos[clickObj.dbid].max,
													materialName: intersect.object.ElementInfos[clickObj.dbid].materialName
												}
												BeforeSelection.push(indexes) //给选中数据赋值
											}
											break;
										}
									} else if (intersect.object.TypeName == "InstancedMesh" || intersect.object.TypeName == "InstancedMesh-Pipe") {
										if(!ClipInclude(intersect.object.ElementInfos[intersect.instanceId].min, intersect.object.ElementInfos[intersect.instanceId].max, intersect.object.material.clippingPlanes, intersect.point)){
											let indexes = [intersect.object.index, intersect.instanceId]
											if(BEFORE_SELECT.toString() == indexes.toString()){
												BEFORE_SELECT = {
													dbid: null,
													name: null,
													glb: null,
													TypeName: null,
													basePath: null,
													relativePath: null,
													indexs:[],
													min: null,
													center: null,
													max: null,
													materialName: null
												}
											}else{
												BEFORE_SELECT = {
													dbid: intersect.instanceId,
													name: intersect.object.ElementInfos[intersect.instanceId].name,
													glb: intersect.object.url,
													TypeName: intersect.object.TypeName,
													basePath: intersect.object.ElementInfos[0].basePath,
													relativePath: intersect.object.ElementInfos[0].relativePath,
													indexs: [intersect.object.index, intersect.instanceId],
													min: intersect.object.ElementInfos[intersect.instanceId].min,
													center: intersect.object.ElementInfos[intersect.instanceId].center,
													max: intersect.object.ElementInfos[intersect.instanceId].max,
													materialName: intersect.object.ElementInfos[intersect.instanceId].materialName
												}
												BeforeSelection.push(indexes) //给选中数据赋值
											}
											break;
										}
									}
								}
							} else {
								BEFORE_SELECT = {
									dbid: null,
									name: null,
									glb: null,
									TypeName: null,
									basePath: null,
									relativePath: null,
									indexs:[],
									min: null,
									center: null,
									max: null,
									materialName: null
								}
							}
							break;
					}
					if(BEFORE_SELECT.dbid && BEFORE_SELECT.center){
						window.bimEngine.scene.controls.origin = BEFORE_SELECT.center
					}else{
						// window.bimEngine.scene.controls.origin = new THREE.Vector3(0, 0, 0);
					}
					bimEngine.CurrentSelect = BEFORE_SELECT
					bimEngine.Selection = BeforeSelection
					bimEngine.ResetSelectedModels_('highlight', BeforeSelection, true)
					sessionStorage.setItem('SelectedSingleModelInfo',JSON.stringify(BEFORE_SELECT))
				}
			}
			function GetAdjacentModel(start, index, total) {
				let indexs = [start];
				return indexs;
				for (let i = 0; i < index + 1; i++) {
					indexs.push(start - i);
				}
				for (let i = index + 1; i < total; i++) {
					indexs.push(start + i);
				}
				return indexs;
			}
		}
		function dblclick() { //双击
			if(bimEngine.CurrentSelect && bimEngine.CurrentSelect.dbid){
				let min = bimEngine.CurrentSelect.min
				let center = bimEngine.CurrentSelect.center
				let max = bimEngine.CurrentSelect.max
				var target = min.clone().add(max.clone()).multiplyScalar(0.5);
				let dir = new THREE.Vector3(1, 1, 1);
				var tergetCamera = center.clone().add(dir.multiplyScalar(1 * max.distanceTo(min)));
				window.bimEngine.ViewCube.animateCamera(window.bimEngine.scene.camera.position,
					tergetCamera, window.bimEngine.scene.controls.target
					.clone(), target)
			}
		}

	}, false);

	//模型双击-相机移动到模型位置
	bimEngine.scene.renderer.domElement.addEventListener('dblclick', ()=>{
		if(bimEngine.CurrentSelect && bimEngine.CurrentSelect.dbid){
			let min = bimEngine.CurrentSelect.min
			let center = bimEngine.CurrentSelect.center
			let max = bimEngine.CurrentSelect.max
			var target = min.clone().add(max.clone()).multiplyScalar(0.5);
			let dir = new THREE.Vector3(1, 1, 1);
			var tergetCamera = center.clone().add(dir.multiplyScalar(1 * max.distanceTo(min)));
			window.bimEngine.ViewCube.animateCamera(window.bimEngine.scene.camera.position,
				tergetCamera, window.bimEngine.scene.controls.target
				.clone(), target)
		}
	})


	//鼠标移动坐标2D坐标
	bimEngine.scene.renderer.domElement.addEventListener('pointerdown', function(event) {
		event.preventDefault(); // 阻止默认的点击事件执行
		CAMERA_POSITION = {
			x: event.x,
			y: event.y
		}
	}, false);
}


//包含关系
export function IncludeElement(mesh, point) {
	let elements = mesh.ElementInfos
	if (elements == null || elements.length == 0) {
		return null;
	}
	let eles = []
	for(let i=0;i<mesh.meshs.length;i++){
		let clip = ClipInclude(elements[i].min, elements[i].max, mesh.material.clippingPlanes, point)
		if(boxInclude(elements[i].min, elements[i].max, point) && !clip){
			eles.push(elements[i])
		}
	}
	// var eles = elements.filter(o => boxInclude(o.min, o.max, point));
	//再判断间距最小 
	if (eles.length == 0) {
		return null;
	}
	//找到距离点击位置最近的box
	eles.sort(function(a, b) {
		return a.center.distanceTo(point) - b.center.distanceTo(point);
	});
	return eles[0]
}

export function boxInclude(min, max, point) {
	if (point.x >= min.x - 0.001 && point.y >= min.y - 0.001 && point.z >= min.z - 0.001 && point
		.x <=
		max
		.x + 0.001 && point.y <= max.y + 0.001 &&
		point.z <= max.z + 0.001) {
		return true;
	} else {
		return false;
	}
}

export function ClipInclude(min, max, clipPlanes, point) {//构建剖切了全部，才不能点选中
	let clip = false
	if(clipPlanes && clipPlanes.length){
		if(clipPlanes.length === 1){// 单面剖切
			let clipItem = clipPlanes[0]
			if(clipItem.normal.x == -1 && (min.x >=  clipItem.constant || point.x > clipItem.constant)){//X轴剖切
				clip = true
			}else if(clipItem.normal.y == -1 && (min.y >=  clipItem.constant || point.y > clipItem.constant)){//Y轴剖切
				clip = true
			} else if(clipItem.normal.z == -1 && (min.z >=  clipItem.constant || point.z > clipItem.constant)){//Z轴剖切
				clip = true
			}
		}else if(clipPlanes.length === 6){// 多面剖切 0: z+ / 1: z- / 2: x+ / 3: x- / 4: y+ / 5: y-
			if((max.z <= clipPlanes[1].constant*-1 || point.z < clipPlanes[1].constant*-1) || (min.z >= clipPlanes[0].constant || point.z > clipPlanes[0].constant) || 
			(max.x <= clipPlanes[3].constant*-1 || point.x < clipPlanes[3].constant*-1) || (min.x >= clipPlanes[2].constant || point.x > clipPlanes[2].constant) || 
			(max.y <= clipPlanes[5].constant*-1 || point.y < clipPlanes[5].constant*-1) || (min.y >= clipPlanes[4].constant || point.y > clipPlanes[4].constant)){
				clip = true
			}
		}
	}else{
		clip = false
	}
	return clip
}

// export function ClipInclude(min, max, clipPlanes) {//构建剖切了一部分，就不能点选中
// 	let clip = false
// 	if(clipPlanes && clipPlanes.length){
// 		if(clipPlanes.length === 1){// 单面剖切
// 			let clipItem = clipPlanes[0]
// 			if(clipItem.normal.x == -1 && max.x >=  clipItem.constant){//X轴剖切
// 				clip = true
// 			}else if(clipItem.normal.y == -1 && max.y >=  clipItem.constant){//Y轴剖切
// 				clip = true
// 			} else if(clipItem.normal.z == -1 && max.z >=  clipItem.constant){//Z轴剖切
// 				clip = true
// 			}
// 		}else if(clipPlanes.length === 6){// 多面剖切
// 			if(min.z <= clipPlanes[1].constant*-1 || max.z >= clipPlanes[0].constant || 
// 				min.x <= clipPlanes[3].constant*-1 || max.x >= clipPlanes[2].constant || 
// 				min.y <= clipPlanes[5].constant*-1 || max.y >= clipPlanes[4].constant){
// 				clip = true
// 			}
// 		}
// 	}else{
// 		clip = false
// 	}
// 	return clip
// }



//定义键盘按键事件
export function setKeyEvents() {
	window.addEventListener('keydown', function(e) {
		// console.log(e);
	});
}

//定义控制
export function setControl(dom, camera, renderer) {
	var width = document.getElementById(dom).clientWidth; //窗口宽度
	var height = document.getElementById(dom).clientHeight; //窗口高度
	//轨道控制 镜头的移动
	let controls = new THREE.OrbitControls(camera, renderer.domElement);
	//物体3D化
	let effect = new THREE.AnaglyphEffect(renderer);
	effect.setSize(width, height);
	return controls
}



//定义TransformControls控制器
export function setTransformControls(scene, camera, renderer) {
	let control = new THREE.TransformControls(camera, renderer.domElement); //创建Transform控制器
	control.name = "TransformControlsClipping"
	control.visible = false
	// control.dispose()
	scene.add(control); //控制器添加到场景中
}
