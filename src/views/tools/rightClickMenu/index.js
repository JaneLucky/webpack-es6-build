import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js"
import QuantitiesList from "@/views/components/PCView/DialogView/Buis/quantities/QuantitiesList.vue";
import { create } from "@/utils/create"
import {
	HandleModelSelect
} from "@/views/tools/handleModels/index.js"
// import { GetModelCategory, GetModelLevel } from "@/api/modelTreeService"

export function CreateRightClickMenu(bimengine){
  require('@/views/tools/style/'+SetDeviceStyle()+'/RightClickMenu.scss')
	var _rightClickMenu = new Object();
  _rightClickMenu.Show = false

	let right_click_menu_container;
	let _container = bimEngine.scene.renderer.domElement.parentElement;
  let CAMERA_POSITION;
  _rightClickMenu.MenuList = [//右键菜单列表
    // {
    // value: '1',
    // label: '查看属性',
    // domItem: null,
    // childContain: null,
    // alwaysShow: false
    // },
    {
      value: '2',
      label: '工程量',
      domItem: null,
      childContain: null,
			alwaysShow: false
    },  
    {
      value: '3',
      label: '隔离',
      domItem: null,
      childContain: null,
			alwaysShow: false
    },  {
      value: '4',
      label: '隐藏',
      domItem: null,
      childContain: null,
			alwaysShow: false
    },  {
      value: '5',
      label: '显示全部',
      domItem: null,
      childContain: null,
			alwaysShow: true
    },  
    // {
    // 	value: '6',
    // 	label: '隐藏全部',
    // 	domItem: null,
    // 	childContain: null,
    // 	alwaysShow: true
    // }, 
    // {
    // 	value: '7',
    // 	label: '快速选择',
    // 	domItem: null,
    // 	childContain: null,
    // 	alwaysShow: false,
    // 	children: [{
    // 		value: '71',
    // 		label: '同类构建'
    // 	}, {
    // 		value: '72',
    // 		label: '同层构建'
    // 	}, {
    // 		value: '73',
    // 		label: '同类同层构建'
    // 	}]
    // }
  ];
	_rightClickMenu.Actived = []

  CreateUI()

	//鼠标移动坐标2D坐标
	bimEngine.scene.renderer.domElement.addEventListener('pointerdown', function(event) {
		event.preventDefault(); // 阻止默认的点击事件执行
		CAMERA_POSITION = {
			x: event.x,
			y: event.y
		}
    _rightClickMenu.HideMenu()
	}, false);

	//点击了鼠标右键
	bimEngine.scene.renderer.domElement.addEventListener('contextmenu', function(event) {
		if (event.button === 2) {
			event.preventDefault(); // 阻止默认的点击事件执行
			if (Math.abs(event.x - CAMERA_POSITION.x) < 2 && Math.abs(event.y - CAMERA_POSITION.y) < 2) {
				_rightClickMenu.ShowMenu(event)
			} else {
				_rightClickMenu.HideMenu()
			}
		}
	}, false);


  _rightClickMenu.ShowMenu = function(event){
		right_click_menu_container && (right_click_menu_container.style.display = "block");//关闭弹框UI
		right_click_menu_container && (right_click_menu_container.style.top = event.y+'px');//关闭弹框UI
		right_click_menu_container && (right_click_menu_container.style.left = event.x+'px');//关闭弹框UI
		for(let i=0;i<_rightClickMenu.MenuList.length;i++){
			if(!_rightClickMenu.MenuList[i].alwaysShow){
				_rightClickMenu.MenuList[i].domItem.style.display = window.bimEngine.SelectedModels.indexesModels.length ?"block":"none"
			}
		}
    right_click_menu_container.style.display = "block"
		_rightClickMenu.Show = true
  }
  _rightClickMenu.HideMenu = function(){
    right_click_menu_container.style.display = "none"
		_rightClickMenu.Show = false
  }

	// _bimEngine.RightClickMenu.AddItem(
	// 	{
	// 	 value: '7',
	// 	 label: '快速选择',
	// 	 domItem: null,
	// 	 childContain: null,
	// 	 alwaysShow: false,
	// 	 children: [{
	// 		 value: '71',
	// 		 label: '同类构建', 
	// 		 callback : (val)=>{
	// 			//执行点击操作
	// 		 }
	// 	 }, {
	// 		 value: '72',
	// 		 label: '同层构建', 
	// 		 callback : (val)=>{
	// 			//执行点击操作
	// 		 }
	// 	 }, {
	// 		 value: '73',
	// 		 label: '同类同层构建', 
	// 		 callback : (val)=>{
	// 			//执行点击操作
	// 		 }
	// 	 }], 
	// 		 callback : (val)=>{
	// 			//执行点击操作
	// 		 }
	//  }
	// )
	_rightClickMenu.AddItem = function (item) {
		CreateItem(item, true)
	}

  //创建右键UI
  function CreateUI() {
		if(right_click_menu_container){
			right_click_menu_container.style.display = "block";//关闭弹框UI
			return
		}
		right_click_menu_container = document.createElement("div");
		right_click_menu_container.className = "Right-Click-Menu-Container"

		for(let i=0;i<_rightClickMenu.MenuList.length;i++){
			CreateItem(_rightClickMenu.MenuList[i])
		}
		_container.appendChild(right_click_menu_container);
  }

	function CreateItem(item, add = false){
		let menu_item = document.createElement("div");
		menu_item.className = "Menu-Item"
		if(item.children && item.children.length){
			let menu_item_span = document.createElement("span");
			menu_item_span.innerHTML = item.label
			menu_item.appendChild(menu_item_span)
			let menu_item_icon = document.createElement("span");
			menu_item_icon.className = "Menu-Item-Icon"
			menu_item_icon.innerHTML = ">";
			menu_item.appendChild(menu_item_icon)

			let menu_child_container = document.createElement("div");
			menu_child_container.className = "Menu_Child_Container"
			for(let j=0;j<item.children.length;j++){
				let menu_child_item = document.createElement("div");
				menu_child_item.className = "Menu-Item"
				menu_child_item.dataset.value = item.value + "," + item.children[j].value

				let menu_child_item_span = document.createElement("span");
				menu_child_item_span.innerHTML = item.children[j].label
				menu_child_item_span.dataset.value = item.value + "," + item.children[j].value
				menu_child_item.appendChild(menu_child_item_span)
				menu_child_item.onclick = (e)=>{
					e.stopPropagation();
					if(add){
						let checked = e.target.dataset.value.split(",")
						item.children[j].callback(checked)
						_rightClickMenu.HideMenu()
					}else{
						handleChange(e.target.dataset.value)
					}
				}
				menu_child_container.appendChild(menu_child_item)
			}
			menu_item.addEventListener("mouseover", (e)=> {
				menu_child_container.style.display = "block";
				menu_item.style.background = "#ffffff";
				menu_item.style.color = "#409EFF";
			})
			menu_item.appendChild(menu_child_container)
			item.childContain = menu_child_container
			item.domItem = menu_item
		}else{
			let menu_item_span = document.createElement("span");
			menu_item_span.innerHTML = item.label
			menu_item.appendChild(menu_item_span)
			item.domItem = menu_item
			menu_item.addEventListener("mouseover", (e)=> {
				for(let k=0;k<_rightClickMenu.MenuList.length;k++){
					if(_rightClickMenu.MenuList[k].childContain){
						_rightClickMenu.MenuList[k].childContain.style.display = "none"
						_rightClickMenu.MenuList[k].domItem.style.background = "transparent";
						_rightClickMenu.MenuList[k].domItem.style.color = "#ffffff";
					}
				}
			})
		}
		menu_item.dataset.value = item.value
		menu_item.onclick = (e)=>{
			if(add){
				item.callback(item.value)
				_rightClickMenu.HideMenu()
			}else{
				handleChange(e.target.dataset.value)
			}
		}
		right_click_menu_container.appendChild(menu_item)
		add && _rightClickMenu.MenuList.push(item)
	}


  function handleChange(val) {
		_rightClickMenu.Actived = val
		ClearSelect()
		bimEngine.UpdateRender();
		let indexesList
		switch (val) {
			case '1':
				
				break;
			case '2':
				let dom = document.getElementById("threejs-sence-container")
				create(dom, QuantitiesList, { show:true, item: {} })
				break;
			case '3'://隔离
				// if(window.bimEngine.SelectedModels.loadedModels.length){
				// 	//隐藏所有
				// 	HandleModelSelect(null,[{key:'visible',val:false}])
				// 	//显示选中的
				// 	HandleModelSelect(window.bimEngine.SelectedModels.loadedModels,[{key:'visible',val:true}])
				// }
				//隐藏所有
				indexesList = window.bimEngine.GetAllIndexesModel()
				indexesList.length && window.bimEngine.ResetSelectedModels_('visible', indexesList, false)
				//显示选中的
				window.bimEngine.SelectedModels.indexesModels.length && window.bimEngine.ResetSelectedModels_('visible', window.bimEngine.SelectedModels.indexesModels, true)
				break;
			case '4'://隐藏
				window.bimEngine.SelectedModels.indexesModels.length && window.bimEngine.ResetSelectedModels_('visible', window.bimEngine.SelectedModels.indexesModels, false)
				// if(window.bimEngine.SelectedModels.loadedModels.length){
				// 	HandleModelSelect(window.bimEngine.SelectedModels.loadedModels,[{key:'visible',val:false}])
				// }
				break;
			case '5'://显示全部
				indexesList = window.bimEngine.GetAllIndexesModel()
				indexesList.length && window.bimEngine.ResetSelectedModels_('visible', indexesList, true)
				sessionStorage.setItem("ShowAllModel",'true')
				// HandleModelSelect(null,[{key:'visible',val:false}])
				break;
			case '6'://隐藏全部
				indexesList = window.bimEngine.GetAllIndexesModel()
				indexesList.length && window.bimEngine.ResetSelectedModels_('visible', indexesList, false)
				// HandleModelSelect(null,[{key:'visible',val:false}])
				sessionStorage.setItem("ShowAllModel",'false')
				break;
			case '71'://同类构建
				// if(window.bimEngine.SelectedModels.loadedModels.length){
				// 	GetModelCategory(window.bimEngine.ModelPaths, (data) => {
				// 		let SameTypeList = getSameTypeORSameLevelModels(data, window.bimEngine.SelectedModels.loadedModels)
				// 		SameTypeList && SameTypeList.length && window.bimEngine.ResetSelectedModels("required", SameTypeList)
				// 	});
				// }
				break;
			case '72'://同层构建
				// if(window.bimEngine.SelectedModels.loadedModels.length){
				// 	GetModelLevel(window.bimEngine.ModelPaths, (data) => {
				// 		let SameLevelList = getSameTypeORSameLevelModels(data, window.bimEngine.SelectedModels.loadedModels)
				// 		SameLevelList && SameLevelList.length && window.bimEngine.ResetSelectedModels("required", SameLevelList)
				// 	});
				// }
				break;
			case '73'://同类同层构建
				// if(window.bimEngine.SelectedModels.loadedModels.length){
				// 	GetModelCategory(window.bimEngine.ModelPaths, (data) => {
				// 		let SameTypeList = getSameTypeORSameLevelModels(data, window.bimEngine.SelectedModels.loadedModels)
				// 		if(SameTypeList && SameTypeList.length){
				// 			GetModelLevel(window.bimEngine.ModelPaths, (data) => {
				// 				let SameLevelList = getSameTypeORSameLevelModels(data, window.bimEngine.SelectedModels.loadedModels)
				// 				let FinalList = []
				// 				for (let SameType of SameTypeList) {
				// 					for(let SameLevel of SameLevelList){
				// 						if(SameType.relativePath === SameLevel.relativePath){
				// 							let sameList = getRepeat([...SameType.children, ...SameLevel.children])
				// 							if(sameList && sameList.length){
				// 								let item = {
				// 									path: SameType.path,
				// 									children:sameList
				// 								}
				// 								FinalList.push(item)
				// 							}
				// 						}
				// 					}
				// 				}
				// 				FinalList && FinalList.length && window.bimEngine.ResetSelectedModels("required", FinalList)
								
				// 			});
				// 		}
						
				// 	});
				// }
				break;
			default:
				break;
		}
		_rightClickMenu.HideMenu()
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
								if(selectedGroup.TypeName === "InstancedMesh" || selectedGroup.TypeName === "InstancedMesh-Pipe"){
									for (let select of selectedGroup.children) {
										if(models.models.findIndex(x=>select.name.indexOf(x) != -1) !== -1){
											itemGroup.children = noRepeat([...itemGroup.children,...models.models])
										}
									}

								}else if(selectedGroup.TypeName === "Mesh" || selectedGroup.TypeName == "Mesh-Structure" || selectedGroup.TypeName === "PipeMesh"){
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
		for(let i=0;i<_rightClickMenu.MenuList.length;i++){
			if(_rightClickMenu.MenuList[i].domItem){
				_rightClickMenu.MenuList[i].domItem.style.background = "#656565";
				_rightClickMenu.MenuList[i].domItem.style.color = "#ffffff";
			}
			if(_rightClickMenu.MenuList[i].childContain){
				_rightClickMenu.MenuList[i].childContain.style.display = "none";
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

  return _rightClickMenu
}



