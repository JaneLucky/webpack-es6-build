const THREE = require('three')
//控制操作加载库
import "@/three/controls/OrbitControls"
//控制操作加载库
import "@/three/effects/AnaglyphEffect"
import '@/three/controls/TransformControls.js';
import {
	HandleModelSelect
} from "@/views/tools/handleModels/index.js"
import "../style/RightClickMenu.scss"


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
	let right_click_menu_container;
	let _container = bimEngine.scene.renderer.domElement.parentElement;
	let menuList = [{//右键菜单列表
		value: '1',
		label: '查看属性',
		domItem: null,
		childContain: null
	}, {
		value: '2',
		label: '工程量',
		domItem: null,
		childContain: null
	},  {
		value: '3',
		label: '隔离',
		domItem: null,
		childContain: null
	},  {
		value: '4',
		label: '隐藏',
		domItem: null,
		childContain: null
	},  {
		value: '5',
		label: '显示全部',
		domItem: null,
		childContain: null
	},  {
		value: '6',
		label: '隐藏全部',
		domItem: null,
		childContain: null
	}, {
		value: '7',
		label: '快速选择',
		domItem: null,
		childContain: null,
		children: [{
			value: '71',
			label: '同类构建'
		}, {
			value: '72',
			label: '同层构建'
		}, {
			value: '73',
			label: '同类同层构建'
		}]
	}];
	CreatorRightClickMenu()
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
				CloseMenu()
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
				OpenMenu()
			} else {
				callBack({
					type: 'LeftClick'
				})
				CloseMenu()
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

	function OpenMenu() {
		right_click_menu_container && (right_click_menu_container.style.display = "block");//关闭弹框UI
		right_click_menu_container && (right_click_menu_container.style.top = event.y+'px');//关闭弹框UI
		right_click_menu_container && (right_click_menu_container.style.left = event.x+'px');//关闭弹框UI
		for(let i=0;i<menuList.length;i++){
			if(menuList[i].value !== '5' && menuList[i].value !== '6' ){
				menuList[i].domItem.style.display = window.bimEngine.Selection && window.bimEngine.Selection.length ?"block":"none"
			}
		}
	}

	function CloseMenu() {
		right_click_menu_container && (right_click_menu_container.style.display = "none");//关闭弹框UI
	}

	function CreatorRightClickMenu() {
		if(right_click_menu_container){
			right_click_menu_container.style.display = "block";//关闭弹框UI
			return
		}
		right_click_menu_container = document.createElement("div");
		right_click_menu_container.className = "Right-Click-Menu-Container"

		for(let i=0;i<menuList.length;i++){
			let menu_item = document.createElement("div");
			menu_item.className = "Menu-Item"
			if(menuList[i].children && menuList[i].children.length){
				let menu_item_span = document.createElement("span");
				menu_item_span.innerHTML = menuList[i].label
				menu_item.appendChild(menu_item_span)
				let menu_item_icon = document.createElement("span");
				menu_item_icon.className = "Menu-Item-Icon"
				menu_item_icon.innerHTML = ">";
				menu_item.appendChild(menu_item_icon)

				let menu_child_container = document.createElement("div");
				menu_child_container.className = "Menu_Child_Container"
				for(let j=0;j<menuList[i].children.length;j++){
					let menu_child_item = document.createElement("div");
					menu_child_item.className = "Menu-Item"

					let menu_child_item_span = document.createElement("span");
					menu_child_item_span.innerHTML = menuList[i].children[j].label
					menu_child_item_span.dataset.value = menuList[i].children[j].value
					menu_child_item.appendChild(menu_child_item_span)
					menu_child_item.onclick = (e)=>{
						handleMenuClickChange(e.target.dataset.value)
					}
					menu_child_container.appendChild(menu_child_item)
				}
				menu_item.addEventListener("mouseover", (e)=> {
					menu_child_container.style.display = "block";
					menu_item.style.background = "#ffffff";
					menu_item.style.color = "#409EFF";
				})
				menu_item.appendChild(menu_child_container)
				menuList[i].childContain = menu_child_container
				menuList[i].domItem = menu_item
			}else{
				let menu_item_span = document.createElement("span");
				menu_item_span.innerHTML = menuList[i].label
				menu_item.appendChild(menu_item_span)
				menuList[i].domItem = menu_item
				menu_item.addEventListener("mouseover", (e)=> {
					for(let k=0;k<menuList.length;k++){
						if(menuList[k].childContain){
							menuList[k].childContain.style.display = "none"
							menuList[k].domItem.style.background = "transparent";
							menuList[k].domItem.style.color = "#ffffff";
						}
					}
				})
			}
			menu_item.dataset.value = menuList[i].value
			menu_item.onclick = (e)=>{
				console.log(e.target.dataset.value)
				handleMenuClickChange(e.target.dataset.value)
			}
			right_click_menu_container.appendChild(menu_item)
		}
		_container.appendChild(right_click_menu_container);
	}

	function handleMenuClickChange(val) {
		switch (val) {
			case '1':
				
				break;
			case '2':
				
				break;
			case '3'://隔离
				if(window.bimEngine.Selection && window.bimEngine.Selection.length){
					//隐藏所有
					HandleModelSelect(null,[{key:'visible',val:false}])
					//显示选中的
					HandleModelSelect(window.bimEngine.Selection,[{key:'visible',val:true}])
				}
				break;
			case '4'://隐藏
				if(window.bimEngine.Selection && window.bimEngine.Selection.length){
					HandleModelSelect(window.bimEngine.Selection,[{key:'visible',val:false}])
				}
				break;
			case '5'://显示全部
				HandleModelSelect(null,[{key:'visible',val:true}])
				break;
			case '6'://隐藏全部
				HandleModelSelect(null,[{key:'visible',val:false}])
				break;
		
			default:
				break;
		}
		CloseMenu()
	}
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
