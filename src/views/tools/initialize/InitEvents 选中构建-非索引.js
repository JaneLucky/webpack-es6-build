const THREE = require('@/three/three.js')
//控制操作加载库
import "@/three/controls/OrbitControls"
//控制操作加载库
import "@/three/effects/AnaglyphEffect"
import '@/three/controls/TransformControls.js';
import {
	HandleModelSelect
} from "@/views/tools/handleModels/index.js"
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js"
import { GetModelCategory, GetModelLevel } from "@/api/modelTreeService"


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
		bimEngine.UpdateRender();
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
				let BeforeSelection = JSON.parse(JSON.stringify(bimEngine.SelectedModels.loadedModels)) //选中的构建列表
				let BEFORE_SELECT = bimEngine.CurrentSelect ? bimEngine.CurrentSelect : {
					dbid: null,
					name: null,
					glb: null,
					TypeName: null,
					basePath: null,
					relativePath: null,
					indexs:[]
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
									if (clickObj != null && intersect.object.material[clickObj.dbid].visible) {
											console.log(intersect.object.material[clickObj.dbid])
										let GroupIndex = BeforeSelection.findIndex(item => item.path ===
											intersect
											.object.url)
										if (GroupIndex < 0) { //不存在
											let GroupModel = {
												path: intersect.object.url,
												children: [clickObj.name],
												TypeName: intersect.object.TypeName,
												relativePath: clickObj.relativePath,
												index: intersect.object.index
											}
											BEFORE_SELECT = {
												dbid: clickObj.dbid,
												name: clickObj.name,
												glb: intersect.object.url,
												TypeName: intersect.object.TypeName,
												basePath: clickObj.basePath,
												relativePath: clickObj.relativePath,
												indexs:[intersect.object.index, clickObj.dbid]
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
													TypeName: intersect.object.TypeName,
													basePath: clickObj.basePath,
													relativePath: clickObj.relativePath,
													indexs:[intersect.object.index, clickObj.dbid]
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
														TypeName: null,
														basePath: null,
														relativePath: null,
														indexs:[]
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
										.object.url)
									if (GroupIndex < 0) { //不存在
										let GroupModel = {
											path: intersect.object.url,
											TypeName: intersect.object.TypeName,
											children: [{
												instanceId: intersect.instanceId,
												name: intersect.object.MeshId,
												relativePath: intersect.object.relativePath
											}],
											index: intersect.object.index
										}
										BEFORE_SELECT = {
											dbid: intersect.instanceId,
											name: intersect.object.MeshId,
											glb: intersect.object.url,
											TypeName: intersect.object.TypeName,
											basePath: intersect.object.basePath,
											relativePath: intersect.object.relativePath,
											indexs:[intersect.object.index, intersect.instanceId]
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
												TypeName: intersect.object.TypeName,
												basePath: intersect.object.basePath,
												relativePath: intersect.object.relativePath,
												indexs:[intersect.object.index, intersect.instanceId]
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
													TypeName: null,
													basePath: null,
													relativePath: null,
													indexs:[]
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
										.name != BEFORE_SELECT.name && intersect.object.material[clickObj.dbid].visible) {
											console.log(intersect.object.material[clickObj.dbid])
										let currentModel = {
											path: intersect.object.url,
											TypeName: intersect.object.TypeName,
											children: [clickObj.name],
											relativePath: clickObj.relativePath,
											index:intersect.object.index
										}
										 
										BEFORE_SELECT = {
											dbid: clickObj.dbid,
											name: clickObj.name,
											glb: intersect.object.url,
											TypeName: intersect.object.TypeName,
											basePath:clickObj.basePath,
											relativePath:clickObj.relativePath,
											indexs:[intersect.object.index, clickObj.dbid]
										}
										BeforeSelection.push(currentModel) //给选中数据赋值
										break;
									}
								} else if (intersect.object.TypeName == "InstancedMesh") {
									let currentModel = {
										path: intersect.object.url,
										TypeName: intersect.object.TypeName,
										children: [{
											instanceId: intersect.instanceId,
											name: intersect.object.MeshId
										}],
										relativePath: intersect.object.ElementInfos[0].relativePath,
										index: intersect.object.index
									} 
									 
									BEFORE_SELECT = {
										dbid: intersect.instanceId,
										name: intersect.object.MeshId,
										glb: intersect.object.url,
										TypeName: intersect.object.TypeName,
										basePath:intersect.object.ElementInfos[0].basePath,
										relativePath:intersect.object.ElementInfos[0].relativePath,
										indexs:[intersect.object.index, intersect.instanceId]
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
								TypeName: null,
								basePath:null,
								relativePath:null,
								indexs:[]
							};
						}
						break;
				}

				bimEngine.CurrentSelect = BEFORE_SELECT
				bimEngine.Selection = BeforeSelection
				bimEngine.ResetSelectedModels("loaded", BeforeSelection)
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
				menuList[i].domItem.style.display = window.bimEngine.SelectedModels.loadedModels.length ?"block":"none"
			}
		}
	}

	function CloseMenu() {
		right_click_menu_container && (right_click_menu_container.style.display = "none");//关闭弹框UI
	}

	function CreatorRightClickMenu() {
		require('@/views/tools/style/'+SetDeviceStyle()+'/RightClickMenu.scss')
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
					menu_child_item.dataset.value = menuList[i].children[j].value

					let menu_child_item_span = document.createElement("span");
					menu_child_item_span.innerHTML = menuList[i].children[j].label
					menu_child_item_span.dataset.value = menuList[i].children[j].value
					menu_child_item.appendChild(menu_child_item_span)
					menu_child_item.onclick = (e)=>{
						e.stopPropagation();
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
				// console.log(e.target.dataset.value)
				handleMenuClickChange(e.target.dataset.value)
			}
			right_click_menu_container.appendChild(menu_item)
		}
		_container.appendChild(right_click_menu_container);
	}

	function handleMenuClickChange(val) {
		ClearSelect()
		bimEngine.UpdateRender();
		switch (val) {
			case '1':
				
				break;
			case '2':
				
				break;
			case '3'://隔离
				if(window.bimEngine.SelectedModels.loadedModels.length){
					//隐藏所有
					HandleModelSelect(null,[{key:'visible',val:false}])
					//显示选中的
					HandleModelSelect(window.bimEngine.SelectedModels.loadedModels,[{key:'visible',val:true}])
				}
				break;
			case '4'://隐藏
				if(window.bimEngine.SelectedModels.loadedModels.length){
					HandleModelSelect(window.bimEngine.SelectedModels.loadedModels,[{key:'visible',val:false}])
				}
				break;
			case '5'://显示全部
				HandleModelSelect(null,[{key:'visible',val:true}])
				break;
			case '6'://隐藏全部
				HandleModelSelect(null,[{key:'visible',val:false}])
				break;
			case '71'://同类构建
				if(window.bimEngine.SelectedModels.loadedModels.length){
					GetModelCategory(window.bimEngine.ModelPaths, (data) => {
						let SameTypeList = getSameTypeORSameLevelModels(data, window.bimEngine.SelectedModels.loadedModels)
						SameTypeList && SameTypeList.length && window.bimEngine.ResetSelectedModels("required", SameTypeList)
					});
				}
				break;
			case '72'://同层构建
				if(window.bimEngine.SelectedModels.loadedModels.length){
					GetModelLevel(window.bimEngine.ModelPaths, (data) => {
						let SameLevelList = getSameTypeORSameLevelModels(data, window.bimEngine.SelectedModels.loadedModels)
						SameLevelList && SameLevelList.length && window.bimEngine.ResetSelectedModels("required", SameLevelList)
					});
				}
				break;
			case '73'://同类同层构建
				if(window.bimEngine.SelectedModels.loadedModels.length){
					GetModelCategory(window.bimEngine.ModelPaths, (data) => {
						let SameTypeList = getSameTypeORSameLevelModels(data, window.bimEngine.SelectedModels.loadedModels)
						if(SameTypeList && SameTypeList.length){
							GetModelLevel(window.bimEngine.ModelPaths, (data) => {
								let SameLevelList = getSameTypeORSameLevelModels(data, window.bimEngine.SelectedModels.loadedModels)
								let FinalList = []
								for (let SameType of SameTypeList) {
									for(let SameLevel of SameLevelList){
										if(SameType.relativePath === SameLevel.relativePath){
											let sameList = getRepeat([...SameType.children, ...SameLevel.children])
											if(sameList && sameList.length){
												let item = {
													path: SameType.path,
													children:sameList
												}
												FinalList.push(item)
											}
										}
									}
								}
								FinalList && FinalList.length && window.bimEngine.ResetSelectedModels("required", FinalList)
								
							});
						}
						
					});
				}
				break;
			default:
				break;
		}
		CloseMenu()
	}

	//获得同类或同层构建 - 接口获得
	function getSameTypeORSameLevelModels(data, selectedModels){
		let list = []
		if(data && data.length){
			for (let selectedGroup of selectedModels) {
				for (let group of data) {
					if(group.models && group.models.length){
						for (const models of group.models) {
							let itemGroup = {
								path: models.modelId,
								children:[]
							}
							let index = list.findIndex(item => item.path === models.modelId)
							if (index != -1) { //不存在
								itemGroup = JSON.parse(JSON.stringify(list[index]))
								list.splice(index, 1)
							}
							if(selectedGroup.relativePath === models.modelId){
								if(selectedGroup.TypeName === "InstancedMesh"){
									for (let select of selectedGroup.children) {
										if(models.models.findIndex(x=>select.name.indexOf(x) != -1) !== -1){
											itemGroup.children = noRepeat([...itemGroup.children,...models.models])
										}
									}

								}else if(selectedGroup.TypeName === "Mesh" || selectedGroup.TypeName === "PipeMesh"){
									for (let select of selectedGroup.children) {
										if(models.models.findIndex(x=>select.indexOf(x) != -1) !== -1){
											itemGroup.children = noRepeat([...itemGroup.children,...models.models])
										}
									}
								}

							}
							if(itemGroup.children && itemGroup.children.length){
								list.push(itemGroup)
							}
							
						}
					}

					
				}
			}
		}
		return list
	}

	// 清除选中样式
	function ClearSelect(){
		for(let i=0;i<menuList.length;i++){
			if(menuList[i].domItem){
				menuList[i].domItem.style.background = "#656565";
				menuList[i].domItem.style.color = "#ffffff";
			}
			if(menuList[i].childContain){
				menuList[i].childContain.style.display = "none";
			}
		}
	}

	// 数组去重
	function noRepeat(arr){
		var list = [];
		var tempSet = new Set(arr);//利用了Set结构不能接收重复数据的特点
		for(var val of tempSet){
			list.push(val)
		}
		return list
	}

	// 数组保留重复
	function getRepeat(arr){
		let list = []
		for (let i = 0; i < arr.length; i++) {
			if (list.indexOf(arr[i]) !== -1) continue
			for (let j = 0; j < arr.length; j++) {
				if (i === j) continue
				if (arr[i] === arr[j]) {
					list.push(arr[i])
					break
				}
			}
		}
		return list
	}

}

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
