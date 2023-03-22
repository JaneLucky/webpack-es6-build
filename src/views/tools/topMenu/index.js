import {
	CreateSvg
} from "@/views/tools/common/index.js"
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js"
// import { Message } from 'element-ui'
import { getDeviceType } from "@/utils/device"

export function CreateTopMenu(bimengine){
  require('@/views/tools/style/'+SetDeviceStyle()+'/TopMenu.scss')
	var _topMenu = new Object();
  _topMenu.ShowMenu = true
	let _container = bimengine.scene.renderer.domElement.parentElement;
  let menu_container, list_contain;
  let currentMenu = [], currentBtn = null, showChild = null, beforeBtn = null;
  let AllMenuList = [ //顶部菜单列表
    {
      pId: '0',
      value: '8',
      label: '视角',
      icon: 'icon-View-All',
      status: false,
      showType: 'Mobile',
      children: [{
        pId: '8',
        value: '81',
        label: '俯视图',
        icon: 'icon-View-Top',
        status: false,
        dir: 'top'
      }, {
        pId: '8',
        value: '82',
        label: '仰视图',
        icon: 'icon-View-Bottom',
        status: false,
        dir: 'down'
      }, {
        pId: '8',
        value: '83',
        label: '右视图',
        icon: 'icon-View-East',
        status: false,
        dir: 'right'
      }, {
        pId: '8',
        value: '84',
        label: '前视图',
        icon: 'icon-View-South',
        status: false,
        dir: 'front'
      }, {
        pId: '8',
        value: '85',
        label: '左视图',
        icon: 'icon-View-West',
        status: false,
        dir: 'left'
      }, {
        pId: '8',
        value: '86',
        label: '后视图',
        icon: 'icon-View-North',
        status: false,
        dir: 'back'
      }]
    },
    {
      pId: '0',
      value: '1',
      label: '漫游',
      icon: 'icon-roam',
      status: false,
      showType: 'PC Mobile'
    },
    {
      pId: '0',
      value: '2',
      label: '框选',
      icon: 'icon-kuangxuan',
      status: false,
      showType: 'PC'
    },
    {
      pId: '0',
      value: '3',
      label: '截面分析',
      icon: 'icon-pouqie',
      status: false,
      showType: 'PC Mobile',
      children: [{
        pId: '3',
        value: '31',
        label: '剖切',
        icon: 'icon-codepen',
        status: false,
      }, {
        pId: '3',
        value: '32',
        label: '添加X平面',
        icon: 'icon-xalxe',
        status: false,
      }, {
        pId: '3',
        value: '33',
        label: '添加Y平面',
        icon: 'icon-zaxle',
        status: false,
      }, {
        pId: '3',
        value: '34',
        label: '添加Z平面',
        icon: 'icon-yaxle',
        status: false,
      }]
    },
    {
      pId: '0',
      value: '6',
      label: '测量',
      icon: 'icon-celianggongju',
      status: false,
      showType: 'PC Mobile',
      children: [{
        pId: '6',
        value: '61',
        label: '点点测量',
        icon: 'icon-celiang',
        status: false,
      }, {
        pId: '6',
        value: '62',
        label: '净高',
        icon: 'icon-arrowsv',
        status: false,
      }, {
        pId: '6',
        value: '63',
        label: '净距',
        icon: 'icon-arrowsh',
        status: false,
      }, {
        pId: '6',
        value: '64',
        label: '坐标',
        icon: 'icon-dingwei',
        status: false,
      }, {
        pId: '6',
        value: '65',
        label: '标高',
        icon: 'icon-biaogao',
        status: false,
      }]
    },
    {
      pId: '0',
      value: '4',
      label: '引擎设置',
      icon: 'icon-setting',
      status: false,
      showType: 'PC Mobile',
    },
    {
      pId: '0',
      value: '5',
      label: '锁定视图',
      icon: 'icon-lock-screen',
      status: false,
      showType: 'Mobile',
    },
  ];
  let DeviceType = getDeviceType()
  _topMenu.MenuList = AllMenuList.filter(item=>item.showType.includes(DeviceType))


  function CreateUI() {
    menu_container = document.createElement("div")
		menu_container.className = "Top-Menu-Container-Mask Show-Menu-Contain"
    
    let close_btn = document.createElement("div")
		close_btn.className = "Close-Menu-Btn"
    let close_svg = CreateSvg('icon-close-btn')
    close_btn.appendChild(close_svg)
    menu_container.appendChild(close_btn)
    close_btn.onclick = (e)=>{
      beforeBtn = currentBtn
      currentBtn = null
      currentMenu = []
      showChild = null
      clearActived()
      handelEvent()
    }



    list_contain = document.createElement("div")
		list_contain.className = "Top-Menu-Container"

    let menu_list = document.createElement("div")
		menu_list.className = "Menu-List"
    for(let i=0;i<_topMenu.MenuList.length;i++){
      let item = document.createElement("div")
      item.className = "Item"
      let item_contain = document.createElement("div")
      item_contain.className = "Icon-Contain"
      item.appendChild(item_contain)
      let icon = CreateSvg(_topMenu.MenuList[i].icon)
      item_contain.appendChild(icon)
      _topMenu.MenuList[i].domEl = item
      item.onclick = (e)=>{
        if(_topMenu.MenuList[i].label === "漫游" && !bimengine.FirstPersonControls.isActive && closeOtherActive()){
          // 设置漫游和视点互斥
          return
        }else{
          handleChange(_topMenu.MenuList[i],null)
        }
      }
      menu_list.appendChild(item)

      if(_topMenu.MenuList[i].children){
        let child_list = document.createElement("div")
        child_list.className = "Child-List"
        child_list.style.display = "none"
        item.childShow = false
        item.appendChild(child_list)
        item.childEls = child_list
        for(let j=0;j<_topMenu.MenuList[i].children.length;j++){
          let child_item = document.createElement("div")
          child_item.className = "Item"
          child_list.appendChild(child_item)
          let child_item_contain = document.createElement("div")
          child_item_contain.className = "Icon-Contain"
          child_item.appendChild(child_item_contain)
          let child_icon = CreateSvg(_topMenu.MenuList[i].children[j].icon)
          child_item_contain.appendChild(child_icon)
          _topMenu.MenuList[i].children[j].domEl = child_item
          child_item.onclick = (e)=>{
            e.stopPropagation()
            handleChange(_topMenu.MenuList[i].children[j], _topMenu.MenuList[i])
          }
        }
      }

    }
    list_contain.appendChild(menu_list)
    menu_container.appendChild(list_contain)
		_container.appendChild(menu_container);
  }
  
  _topMenu.ShowMenu = function(){
    list_contain.style.display = "block"
  }
  _topMenu.HideMenu = function(){
    list_contain.style.display = "none"
  }
  _topMenu.ClickItem = function(label){
    let itemMenu = _topMenu.MenuList.filter(menu=>menu.label === label)
    itemMenu[0].domEl.click()
  }
  

  function handleChange(item, parent) {
    // console.log(item)
    // console.log(parent)
    if (item.pId === '0') { //第一层
      if (item.children) { //存在子集
        if (currentMenu.includes(item.value)) {
          let index = item.children.findIndex(child => child.value === currentBtn)
          if (index < 0) { //子集没有选中的，取消自己的选中
            beforeBtn = currentBtn
            currentBtn = null
            currentMenu = []
            showChild = null
          } else {
            beforeBtn = currentBtn
            showChild = item.value
          }
        } else {
          beforeBtn = currentBtn
          currentMenu = [item.value]
          showChild = item.value
          clearActived()
        }
      } else { //不存在子集
        if (currentBtn === item.value) {
          beforeBtn = currentBtn
          currentBtn = null
          currentMenu = []
          showChild = null
        } else {
          beforeBtn = currentBtn
          currentBtn = item.value
          currentMenu = [item.value]
          showChild = null
        }
        clearActived()
      }
      item.domEl.className = currentMenu.includes(item.value)?"Item Actived":"Item"
    } else { //第二层
      if (currentBtn === item.value) {
        beforeBtn = currentBtn
        currentBtn = null
        currentMenu = []
        showChild = null
      } else {
        beforeBtn = currentBtn
        currentBtn = item.value
        currentMenu = [item.pId, item.value]
        showChild = null
      }
      clearActived()
      item.domEl.className = currentBtn === item.value?"Item Actived":"Item"
      parent.domEl.className = currentBtn === item.value?"Item Actived":"Item"
      
    }

    //收起其所有子集
    for(let i=0;i<_topMenu.MenuList.length;i++){
      if(_topMenu.MenuList[i].children && _topMenu.MenuList[i].children.length){
        _topMenu.MenuList[i].domEl.childEls.style.display = "none"
      }
    }
    //按条件展示当前子集
    if(item && item.children && showChild === item.value){
      item.domEl.childEls.style.display = "block"
    }else{
      item.domEl.childEls && (item.domEl.childEls.style.display = "none")
    }
    handelEvent()
  }

  function handelEvent() {
    if(beforeBtn !== currentBtn){
      switch (beforeBtn) {
        case '1': //漫游
          bimengine.FirstPersonControls && bimengine.FirstPersonControls.DisActive()
          break;
        case '2': //框选
          bimengine.SelectionBox && bimengine.SelectionBox.DisActive()
          break;
        case '31': //
          bimengine.Clipping && bimengine.Clipping.MultiSideClose()
          break;
        case '32': //
          bimengine.Clipping && bimengine.Clipping.SingleSideClose()
          break;
        case '33': //
          bimengine.Clipping && bimengine.Clipping.SingleSideClose()
          break;
        case '34': //
          bimengine.Clipping && bimengine.Clipping.SingleSideClose()
          break;
        case '4': //
          bimengine.Render && bimengine.Render.DisActive()
          break;
        case '5': //
          bimengine.scene.controls.enabled = !bimengine.scene.controls.enabled
          break;
        case '61': //
          bimengine.Measures && bimengine.Measures.SimpleMeasure.DisActive()
          break;
        case '62': //
          bimengine.Measures && bimengine.Measures.HeightMeasure.DisActive()
          break;
        case '63': //
          bimengine.Measures && bimengine.Measures.DistanceMeasure.DisActive()
          break;
        case '64': //
          bimengine.Measures && bimengine.Measures.PointMeasure.DisActive()
          break;
        case '65': //
          bimengine.Measures && bimengine.Measures.ElevationHeightMeasure.DisActive()
          break;
        default:
          break;
      }

      switch (currentBtn) {
        case '81': //视角- 俯视图
        bimengine.ViewCube && bimengine.ViewCube.cameraGoToSpecialView('top')
        break;
        case '82': //视角- 仰视图
        bimengine.ViewCube && bimengine.ViewCube.cameraGoToSpecialView('down')
        break;
        case '83': //视角- 右视图
        bimengine.ViewCube && bimengine.ViewCube.cameraGoToSpecialView('right')
        break;
        case '84': //视角- 前视图
        bimengine.ViewCube && bimengine.ViewCube.cameraGoToSpecialView('front')
        break;
        case '85': //视角- 左视图
        bimengine.ViewCube && bimengine.ViewCube.cameraGoToSpecialView('left')
        break;
        case '86': //视角- 后视图
        bimengine.ViewCube && bimengine.ViewCube.cameraGoToSpecialView('back')
        break;
        case '1': //漫游
          bimengine.FirstPersonControls && bimengine.FirstPersonControls.Active()
          break;
        case '2': //框选
          bimengine.SelectionBox && bimengine.SelectionBox.Active()
          break;
        case '31': //剖切多面
          bimengine.Clipping && bimengine.Clipping.MultiSideOpen()
          break;
        case '32': //添加X平面
          bimengine.Clipping && bimengine.Clipping.SingleSideOpen('X轴')
          break;
        case '33': //添加Y平面
          bimengine.Clipping && bimengine.Clipping.SingleSideOpen('Y轴')
          break;
        case '34': //添加Z平面
          bimengine.Clipping && bimengine.Clipping.SingleSideOpen('Z轴')
          break;
        case '4': //
          bimengine.Render && bimengine.Render.Active()
          break;
        case '5': //
          bimengine.scene.controls.enabled = !bimengine.scene.controls.enabled
          break;
        case '61': //
          bimengine.Measures && bimengine.Measures.SimpleMeasure.Active()
          break;
        case '62': // 
          bimengine.Measures && bimengine.Measures.HeightMeasure.Active()
          break;
        case '63': //
          bimengine.Measures && bimengine.Measures.DistanceMeasure.Active()
          break;
        case '64': //
          bimengine.Measures && bimengine.Measures.PointMeasure.Active()
          break;
        case '65': //
          bimengine.Measures && bimengine.Measures.ElevationHeightMeasure.Active()
          break;
        default:
          break;
      }
    }

    let DeviceType = getDeviceType()
    if(DeviceType === "Mobile"){
      if(currentBtn && (currentBtn !== '81' && currentBtn !== '82' && currentBtn !== '83' && currentBtn !== '84' && currentBtn !== '85' && currentBtn !== '86')){
        menu_container.className = "Top-Menu-Container-Mask Hide-Menu-Contain"
      }else{
        menu_container.className = "Top-Menu-Container-Mask Show-Menu-Contain"
      }
    }
  }



  function clearActived() {
    for(let i=0;i<_topMenu.MenuList.length;i++){
      _topMenu.MenuList[i].domEl.className = "Item"
      if(_topMenu.MenuList[i].children && _topMenu.MenuList[i].children.length){
        for(let j=0;j<_topMenu.MenuList[i].children.length;j++){
          _topMenu.MenuList[i].children[j].domEl.className = "Item"
        }
      }
    }
  }
  
  // 设置互斥操做
  function closeOtherActive(){
    if(sessionStorage.getItem("RootMenuSelect") === "视点"){
      // Message({
      //   message: "请先关闭右侧视点列表！",
      //   type: "warning",
      //   duration: 2000
      // })
      return true
    }
    return false
  }
  
  CreateUI()

  return _topMenu
}



