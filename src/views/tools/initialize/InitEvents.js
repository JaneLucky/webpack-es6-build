const THREE = require('three')
//控制操作加载库
import "@/three/controls/OrbitControls"
//控制操作加载库
import "@/three/effects/AnaglyphEffect"
import '@/three/controls/TransformControls.js';
import {
	HandleModelSelect
} from "@/views/tools/handleModels/index.js"


//定义窗口的设置
export function setWindown() {
	//加入事件监听器,窗口自适应
	window.addEventListener('resize', function() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	});
}

//定义鼠标事件
export function setEventsMouse(bimEngine, callBack) {
	let CAMERA_POSITION
	//点击了鼠标左键 - 高亮选中的构建，并返回选中的构建
	bimEngine.scene.renderer.domElement.addEventListener('click', function(event) {
		// console.log(event);
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
				let BeforeSelection = bimEngine.Selection ? JSON.parse(JSON.stringify(bimEngine.Selection)) :
				[] //选中的构建列表
				let BEFORE_SELECT = bimEngine.CurrentSelect ? bimEngine.CurrentSelect : {
					dbid: null,
					name: null,
					glb: null,
					TypeName: null
				} //当前选中的构建位置信息，用于记录上一次选中的模型，也用于模型属性查询
				//存储选中构建
				// console.log(intersects)
				switch (keyType) {
					case "keyEnter": //ctrlClick/shiftClick
						if (intersects.length > 0) {
							for (var intersect of intersects) {
								if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName ==
									"PipeMesh") {
									var clickObj = IncludeElement(intersect.object.ElementInfos, intersect
										.point); //选中的构建位置信息
									if (clickObj != null && (intersect.object.hideElements == null || !intersect
											.object.hideElements.includes(clickObj.dbid))) {
										let GroupIndex = BeforeSelection.findIndex(item => item.path ===
											intersect
											.object.url.match(/\/(\S*)\//)[1])
										if (GroupIndex < 0) { //不存在
											let GroupModel = {
												path: intersect.object.url.match(/\/(\S*)\//)[1],
												children: [clickObj.name],
												TypeName: intersect.object.TypeName
											}
											BEFORE_SELECT = {
												dbid: clickObj.dbid,
												name: clickObj.name,
												glb: intersect.object.url,
												TypeName: intersect.object.TypeName
											}
											BeforeSelection.push(GroupModel)

										} else { //存在
											let index = BeforeSelection[GroupIndex].children.findIndex(item =>
												item === clickObj.name)
											if (index < 0) { //不存在
												BEFORE_SELECT = {
													dbid: clickObj.dbid,
													name: clickObj.name,
													glb: intersect.object.url,
													TypeName: intersect.object.TypeName
												}
												BeforeSelection[GroupIndex].children.push(clickObj.name)
											} else { //存在
												BeforeSelection[GroupIndex].children.splice(index, 1)
												if (BeforeSelection[GroupIndex].children.length === 0) {
													BeforeSelection.splice(GroupIndex, 1)
													BEFORE_SELECT = {
														dbid: null,
														name: null,
														glb: null,
														TypeName: null
													}
												} else {
													BEFORE_SELECT = BeforeSelection[0].children[0]
												}
											}
										}
										break;
									}
								} else if (intersect.object.TypeName == "InstancedMesh") {
									let GroupIndex = BeforeSelection.findIndex(item => item.path === intersect
										.object.url.match(/\/(\S*)\//)[1])
									if (GroupIndex < 0) { //不存在
										let GroupModel = {
											path: intersect.object.url.match(/\/(\S*)\//)[1],
											TypeName: intersect.object.TypeName,
											children: [{
												instanceId: intersect.instanceId,
												name: intersect.object.MeshId
											}]
										}
										BEFORE_SELECT = {
											dbid: intersect.instanceId,
											name: intersect.object.MeshId,
											glb: intersect.object.url,
											TypeName: intersect.object.TypeName
										}
										BeforeSelection.push(GroupModel)

									} else { //存在
										let index = BeforeSelection[GroupIndex].children.findIndex(item =>
											item.instanceId === intersect.instanceId && item.name ===
											intersect.object.MeshId)
										if (index < 0) { //不存在
											BEFORE_SELECT = {
												dbid: intersect.instanceId,
												name: intersect.object.MeshId,
												glb: intersect.object.url,
												TypeName: intersect.object.TypeName
											}
											BeforeSelection[GroupIndex].children.push({
												instanceId: intersect.instanceId,
												name: intersect.object.MeshId
											})
										} else { //存在
											BeforeSelection[GroupIndex].children.splice(index, 1)
											if (BeforeSelection[GroupIndex].children.length === 0) {
												BeforeSelection.splice(GroupIndex, 1)
												BEFORE_SELECT = {
													dbid: null,
													name: null,
													glb: null,
													TypeName: null
												}
											} else {
												BEFORE_SELECT = BeforeSelection[0].children[0]
											}
										}
									}
									break;
								}
							}
						}
						break;
					default: //click
						BeforeSelection = [];
						if (intersects.length > 0 && bimEngine.LockingSelect!=true) {
							window.bimEngine.scene.controls.origin = intersects[0].point;
							for (var intersect of intersects) {
								if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName ==
									"PipeMesh") {
									var clickObj = IncludeElement(intersect.object.ElementInfos, intersect
										.point); //选中的构建位置信息
									if (clickObj != null && clickObj.dbid != BEFORE_SELECT.dbid && clickObj
										.name !=
										BEFORE_SELECT.name &&
										(intersect.object.hideElements == null || !intersect.object.hideElements
											.includes(clickObj.dbid))) {
										let currentModel = {
											path: intersect.object.url.match(/\/(\S*)\//)[1],
											TypeName: intersect.object.TypeName,
											children: [clickObj.name]
										}
										BEFORE_SELECT = {
											dbid: clickObj.dbid,
											name: clickObj.name,
											glb: intersect.object.url,
											TypeName: intersect.object.TypeName
										}
										BeforeSelection.push(currentModel) //给选中数据赋值
										break;
									}
								} else if (intersect.object.TypeName == "InstancedMesh") {
									let currentModel = {
										path: intersect.object.url.match(/\/(\S*)\//)[1],
										TypeName: intersect.object.TypeName,
										children: [{
											instanceId: intersect.instanceId,
											name: intersect.object.MeshId
										}]
									}
									BEFORE_SELECT = {
										dbid: intersect.instanceId,
										name: intersect.object.MeshId,
										glb: intersect.object.url,
										TypeName: intersect.object.TypeName
									}
									BeforeSelection.push(currentModel) //给选中数据赋值
									break;
								}
							}
						} else { 
							BEFORE_SELECT = {
								dbid: null,
								name: null,
								glb: null,
								TypeName: null
							};
						}
						break;
				}
				//恢复之前选中的构建
				if (bimEngine.Selection && bimEngine.Selection.length) {
					HandleModelSelect(bimEngine.Selection, [{
						key: 'material'
					}])
				}
				// 针对现在选中的构建改变材质
				if (BeforeSelection && BeforeSelection.length) {
					let material = new THREE.MeshStandardMaterial({
						color: new THREE.Color(0.375, 0.63, 1),
						side: THREE.DoubleSide
					});
					HandleModelSelect(BeforeSelection, [{
						key: 'material',
						val: material
					}])
				}
				bimEngine.CurrentSelect = BEFORE_SELECT
				bimEngine.Selection = BeforeSelection
				sessionStorage.setItem('SelectedSingleModelInfo',JSON.stringify(BEFORE_SELECT))
				//回调
				callBack({
					type: 'LeftClick'
				})
			}
		}
		//包含关系
		function IncludeElement(elements, point) {
			if (elements == null || elements.length == 0) {
				return null;
			}
			var eles = elements.filter(o => boxInclude(o.min, o.max, point));
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

		function boxInclude(min, max, point) {

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

	}, false);

	//点击了鼠标右键
	bimEngine.scene.renderer.domElement.addEventListener('contextmenu', function(event) {
		if (event.button === 2) {
			event.preventDefault(); // 阻止默认的点击事件执行
			if (Math.abs(event.x - CAMERA_POSITION.x) < 2 && Math.abs(event.y - CAMERA_POSITION.y) < 2) {
				callBack({
					type: 'RightClick',
					position: {
						x: event.x,
						y: event.y
					}
				})
			} else {
				callBack({
					type: 'LeftClick'
				})
			}
		}
	}, false);

	//鼠标移动坐标2D坐标
	bimEngine.scene.renderer.domElement.addEventListener('pointerdown', function(event) {
		event.preventDefault(); // 阻止默认的点击事件执行
		CAMERA_POSITION = {
			x: event.x,
			y: event.y
		}
	}, false);

}

//定义键盘按键事件
export function setKeyEvents() {
	window.addEventListener('keydown', function(e) {
		console.log(e);
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
