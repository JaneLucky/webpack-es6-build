import { CreateSvg } from "@/views/tools/common/index.js";
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";
import { getDeviceType } from "@/utils/device";
import { handleScreenResize } from "@/views/tools/common/screenResize.js";

export function CreateTopMenu(_Engine) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/TopMenu.scss");
  var _topMenu = new Object();
  _topMenu.Show = true;
  _topMenu.Actived = [];
  let _container = _Engine.scene.renderer.domElement.parentElement;
  let menu_container, list_contain, menu_list;
  let currentMenu = [],
    currentBtn = null,
    showChild = null,
    beforeBtn = null;
  let AllMenuList = [
    //顶部菜单列表
    {
      pId: "0",
      value: "8",
      label: "视角",
      icon: "icon-View-All",
      status: false,
      showType: "Mobile",
      disabled: false,
      children: [
        {
          pId: "8",
          value: "81",
          label: "俯视图",
          icon: "icon-View-Top",
          status: false,
          disabled: false,
          dir: "top"
        },
        {
          pId: "8",
          value: "82",
          label: "仰视图",
          icon: "icon-View-Bottom",
          status: false,
          disabled: false,
          dir: "down"
        },
        {
          pId: "8",
          value: "83",
          label: "右视图",
          icon: "icon-View-East",
          status: false,
          disabled: false,
          dir: "right"
        },
        {
          pId: "8",
          value: "84",
          label: "前视图",
          icon: "icon-View-South",
          status: false,
          disabled: false,
          dir: "front"
        },
        {
          pId: "8",
          value: "85",
          label: "左视图",
          icon: "icon-View-West",
          status: false,
          disabled: false,
          dir: "left"
        },
        {
          pId: "8",
          value: "86",
          label: "后视图",
          icon: "icon-View-North",
          status: false,
          disabled: false,
          dir: "back"
        }
      ]
    },
    {
      pId: "0",
      value: "1",
      label: "漫游",
      icon: "icon-roam",
      status: false,
      showType: "PC Mobile",
      disabled: false
    },
    {
      pId: "0",
      value: "2",
      label: "框选",
      icon: "icon-kuangxuan",
      status: false,
      showType: "PC",
      disabled: false
    },
    {
      pId: "0",
      value: "3",
      label: "截面分析",
      icon: "icon-pouqie",
      status: false,
      showType: "PC Mobile",
      disabled: false,
      children: [
        {
          pId: "3",
          value: "31",
          label: "剖切",
          icon: "icon-codepen",
          status: false,
          disabled: false
        },
        {
          pId: "3",
          value: "32",
          label: "添加X平面",
          icon: "icon-xalxe",
          status: false,
          disabled: false
        },
        {
          pId: "3",
          value: "33",
          label: "添加Y平面",
          icon: "icon-zaxle",
          status: false,
          disabled: false
        },
        {
          pId: "3",
          value: "34",
          label: "添加Z平面",
          icon: "icon-yaxle",
          status: false,
          disabled: false
        }
      ]
    },
    {
      pId: "0",
      value: "6",
      label: "测量",
      icon: "icon-celianggongju",
      status: false,
      showType: "PC Mobile",
      disabled: false,
      children: [
        {
          pId: "6",
          value: "61",
          label: "点点测量",
          icon: "icon-celiang",
          status: false,
          disabled: false
        },
        {
          pId: "6",
          value: "62",
          label: "净高",
          icon: "icon-arrowsv",
          status: false,
          disabled: false
        },
        {
          pId: "6",
          value: "63",
          label: "净距",
          icon: "icon-arrowsh",
          status: false,
          disabled: false
        },
        {
          pId: "6",
          value: "64",
          label: "坐标",
          icon: "icon-dingwei",
          status: false,
          disabled: false
        },
        {
          pId: "6",
          value: "65",
          label: "标高",
          icon: "icon-biaogao",
          status: false,
          disabled: false
        }
      ]
    },
    {
      pId: "0",
      value: "4",
      label: "引擎设置",
      icon: "icon-setting",
      status: false,
      showType: "PC Mobile",
      disabled: false
    },
    {
      pId: "0",
      value: "5",
      label: "锁定视图",
      icon: "icon-lock-screen",
      status: false,
      showType: "Mobile",
      disabled: false
    },
    {
      pId: "0",
      value: "7",
      label: "版本对比",
      icon: "icon-window-restore",
      status: false,
      showType: "PC",
      disabled: false
    }
  ];
  let DeviceType = getDeviceType();
  _topMenu.MenuList = AllMenuList.filter(item => {
    if (item.value === "7" || item.value === "1" || item.value === "2" || item.value === "3") {
      return item.showType.includes(DeviceType) && _Engine.IsMainScene;
    } else {
      return item.showType.includes(DeviceType);
    }
  });

  CreateUI();

  _topMenu.ShowMenu = function () {
    list_contain.style.display = "block";
    _topMenu.Show = true;
  };
  _topMenu.HideMenu = function () {
    list_contain.style.display = "none";
    _topMenu.Show = false;
  };

  // _Engine.TopMenu.AddItem(
  //   {
  //     pId: '0',
  //     value: '8',
  //     label: '视角',
  //     icon: 'icon-View-All',
  //     status: false,
  //     showType: 'Mobile',
  //     callback : (val)=>{
  //      //执行点击操作
  //     },
  //     children: [{
  //       pId: '8',
  //       value: '81',
  //       label: '俯视图',
  //       icon: 'icon-View-Top',
  //       status: false,
  //       dir: 'top',
  //       callback : (val)=>{
  //        //执行点击操作
  //       }
  //     }, {
  //       pId: '8',
  //       value: '82',
  //       label: '仰视图',
  //       icon: 'icon-View-Bottom',
  //       status: false,
  //       dir: 'down',
  //       callback : (val)=>{
  //        //执行点击操作
  //       }
  //     }
  //     ]
  //   }
  // )
  _topMenu.AddItem = function (item) {
    CreateItem(item, true);
  };
  _topMenu.ClickItem = function (pLabel, cLabel) {
    let itemMenuList, itemMenu;
    itemMenuList = _topMenu.MenuList.filter(menu => menu.label === pLabel);
    let itemParent = itemMenuList && itemMenuList.length ? itemMenuList[0] : null;
    if (cLabel) {
      let itemMenuChildList = itemParent
        ? itemParent.children.filter(menu => menu.label === cLabel)
        : null;
      itemMenu = itemMenuChildList && itemMenuChildList.length ? itemMenuChildList[0] : null;
    } else {
      itemMenu = itemParent;
    }
    itemMenu && itemMenu.domEl && itemMenu.domEl.click();
  };

  _topMenu.DisabledItem = function (pLabel, cLabel, disabled) {
    let itemMenuList, itemMenu;
    itemMenuList = _topMenu.MenuList.filter(menu => menu.label === pLabel);
    let itemParent = itemMenuList && itemMenuList.length ? itemMenuList[0] : null;
    if (disabled && itemParent.domEl.className.includes("Actived")) {
      itemParent && itemParent.domEl && itemParent.domEl.click();
    }
    if (cLabel) {
      let itemMenuChildList = itemParent
        ? itemParent.children.filter(menu => menu.label === cLabel)
        : null;
      itemMenu = itemMenuChildList && itemMenuChildList.length ? itemMenuChildList[0] : null;
    } else {
      itemMenu = itemParent;
    }
    if (itemMenu) {
      itemMenu.disabled = disabled;
      if (disabled) {
        if (!itemMenu.domEl.className.includes("DisabledItem")) {
          itemMenu.domEl.className = itemMenu.domEl.className + " DisabledItem";
        }
      } else {
        itemMenu.domEl.className = itemMenu.domEl.className.replace("DisabledItem", "");
      }
    }
  };

  function CreateUI() {
    menu_container = document.createElement("div");
    menu_container.className = "Top-Menu-Container-Mask Show-Menu-Contain";

    let close_btn = document.createElement("div");
    close_btn.className = "Close-Menu-Btn";
    let close_svg = CreateSvg("icon-close-btn");
    close_btn.appendChild(close_svg);
    menu_container.appendChild(close_btn);
    close_btn.onclick = e => {
      beforeBtn = currentBtn;
      currentBtn = null;
      currentMenu = [];
      showChild = null;
      clearActived();
      handelEvent();
    };

    list_contain = document.createElement("div");
    list_contain.className = "Top-Menu-Container";

    menu_list = document.createElement("div");
    menu_list.className = "Menu-List";
    for (let i = 0; i < _topMenu.MenuList.length; i++) {
      CreateItem(_topMenu.MenuList[i]);
    }
    list_contain.appendChild(menu_list);
    menu_container.appendChild(list_contain);
    _container.appendChild(menu_container);
  }

  function CreateItem(menuItem, add = false) {
    let item = document.createElement("div");
    item.className = menuItem.disabled ? "Item DisabledItem" : "Item";
    item.dataset.value = menuItem.value;
    let item_contain = document.createElement("div");
    item_contain.className = "Icon-Contain";
    item_contain.dataset.value = menuItem.value;
    item.appendChild(item_contain);
    let icon = CreateSvg(menuItem.icon);
    icon.dataset.value = menuItem.value;
    icon.children[0].dataset.value = menuItem.value;
    item_contain.appendChild(icon);
    menuItem.domEl = item;
    item.onclick = e => {
      e.stopPropagation();
      if (menuItem.disabled) {
        return;
      }
      if (e.target.dataset.value === "7") {
        //版本对比
        if (item.className == "Item") {
          item.className = "Item Actived";
          document.getElementById("threejs-main-sence-container").style.width = "50%";
          document.getElementById("compare-version-container").style.display = "block";
          window.VersionCompareWatcher.List = true;
        } else {
          item.className = "Item";
          document.getElementById("threejs-main-sence-container").style.width = "100%";
          document.getElementById("compare-version-container").style.display = "none";
          window.VersionCompareWatcher.Show = false;
          window.VersionCompareWatcher.List = false;
        }
        handleScreenResize(_Engine);
      } else if (
        menuItem.label === "漫游" &&
        !_Engine.FirstPersonControls.isActive &&
        closeOtherActive()
      ) {
        // 设置漫游和视点互斥
        return;
      } else {
        handleChange(menuItem, null, add);
      }
    };
    menu_list.appendChild(item);

    if (menuItem.children) {
      let child_list = document.createElement("div");
      child_list.className = "Child-List";
      child_list.style.display = "none";
      item.childShow = false;
      item.appendChild(child_list);
      item.childEls = child_list;
      for (let j = 0; j < menuItem.children.length; j++) {
        let child_item = document.createElement("div");
        child_item.className = child_item.disabled ? "Item DisabledItem" : "Item";
        child_item.dataset.value = menuItem.children[j].pId + "," + menuItem.children[j].value;
        child_list.appendChild(child_item);
        let child_item_contain = document.createElement("div");
        child_item_contain.className = "Icon-Contain";
        child_item_contain.dataset.value =
          menuItem.children[j].pId + "," + menuItem.children[j].value;
        child_item.appendChild(child_item_contain);
        let child_icon = CreateSvg(menuItem.children[j].icon);
        child_icon.dataset.value = menuItem.children[j].pId + "," + menuItem.children[j].value;
        child_icon.children[0].dataset.value =
          menuItem.children[j].pId + "," + menuItem.children[j].value;
        child_item_contain.appendChild(child_icon);
        menuItem.children[j].domEl = child_item;
        child_item.onclick = e => {
          e.stopPropagation();
          if (menuItem.children[j].disabled) {
            return;
          }
          handleChange(menuItem.children[j], menuItem, add);
        };
      }
    }

    add && _topMenu.MenuList.push(menuItem);
  }

  function handleChange(item, parent, add) {
    // console.log(item)
    // console.log(parent)
    if (item.pId === "0") {
      //第一层
      if (item.children) {
        //存在子集
        if (currentMenu.includes(item.value)) {
          let index = item.children.findIndex(child => child.value === currentBtn);
          if (index < 0) {
            //子集没有选中的，取消自己的选中
            beforeBtn = currentBtn;
            currentBtn = null;
            currentMenu = [];
            showChild = null;
          } else {
            beforeBtn = currentBtn;
            showChild = item.value;
          }
        } else {
          beforeBtn = currentBtn;
          currentMenu = [item.value];
          showChild = item.value;
          clearActived();
        }
      } else {
        //不存在子集
        if (currentBtn === item.value) {
          beforeBtn = currentBtn;
          currentBtn = null;
          currentMenu = [];
          showChild = null;
        } else {
          beforeBtn = currentBtn;
          currentBtn = item.value;
          currentMenu = [item.value];
          showChild = null;
        }
        clearActived();
      }
      item.domEl.className = currentMenu.includes(item.value) ? "Item Actived" : "Item";
    } else {
      //第二层
      if (currentBtn === item.value) {
        beforeBtn = currentBtn;
        currentBtn = null;
        currentMenu = [];
        showChild = null;
      } else {
        beforeBtn = currentBtn;
        currentBtn = item.value;
        currentMenu = [item.pId, item.value];
        showChild = null;
      }
      clearActived();
      item.domEl.className = currentBtn === item.value ? "Item Actived" : "Item";
      parent.domEl.className = currentBtn === item.value ? "Item Actived" : "Item";
    }

    //收起其所有子集
    for (let i = 0; i < _topMenu.MenuList.length; i++) {
      if (_topMenu.MenuList[i].children && _topMenu.MenuList[i].children.length) {
        _topMenu.MenuList[i].domEl.childEls.style.display = "none";
      }
    }
    //按条件展示当前子集
    if (item && item.children && showChild === item.value) {
      item.domEl.childEls.style.display = "block";
    } else {
      item.domEl.childEls && (item.domEl.childEls.style.display = "none");
    }
    _topMenu.Actived = currentMenu;
    if (add) {
      item.callback(currentBtn);
    } else {
      handelEvent();
    }
  }

  function handelEvent() {
    if (beforeBtn !== currentBtn) {
      switch (beforeBtn) {
        case "1": //漫游
          _Engine.FirstPersonControls && _Engine.FirstPersonControls.DisActive();
          break;
        case "2": //框选
          _Engine.SelectionBox && _Engine.SelectionBox.DisActive();
          window.WatcherScreenLock.Lock = false;
          break;
        case "31": //
          _Engine.Clipping && _Engine.Clipping.MultiSideClose();
          break;
        case "32": //
          _Engine.Clipping && _Engine.Clipping.SingleSideClose();
          break;
        case "33": //
          _Engine.Clipping && _Engine.Clipping.SingleSideClose();
          break;
        case "34": //
          _Engine.Clipping && _Engine.Clipping.SingleSideClose();
          break;
        case "4": //
          _Engine.Render && _Engine.Render.DisActive();
          break;
        case "5": //
          _Engine.scene.controls.enabled = !_Engine.scene.controls.enabled;
          break;
        case "61": //
          _Engine.Measures && _Engine.Measures.SimpleMeasure.DisActive();
          break;
        case "62": //
          _Engine.Measures && _Engine.Measures.HeightMeasure.DisActive();
          break;
        case "63": //
          _Engine.Measures && _Engine.Measures.DistanceMeasure.DisActive();
          break;
        case "64": //
          _Engine.Measures && _Engine.Measures.PointMeasure.DisActive();
          break;
        case "65": //
          _Engine.Measures && _Engine.Measures.ElevationHeightMeasure.DisActive();
          break;
        default:
          break;
      }

      switch (currentBtn) {
        case "81": //视角- 俯视图
          _Engine.ViewCube && _Engine.ViewCube.cameraGoToSpecialView("top");
          break;
        case "82": //视角- 仰视图
          _Engine.ViewCube && _Engine.ViewCube.cameraGoToSpecialView("down");
          break;
        case "83": //视角- 右视图
          _Engine.ViewCube && _Engine.ViewCube.cameraGoToSpecialView("right");
          break;
        case "84": //视角- 前视图
          _Engine.ViewCube && _Engine.ViewCube.cameraGoToSpecialView("front");
          break;
        case "85": //视角- 左视图
          _Engine.ViewCube && _Engine.ViewCube.cameraGoToSpecialView("left");
          break;
        case "86": //视角- 后视图
          _Engine.ViewCube && _Engine.ViewCube.cameraGoToSpecialView("back");
          break;
        case "1": //漫游
          _Engine.FirstPersonControls && _Engine.FirstPersonControls.Active();
          break;
        case "2": //框选
          _Engine.SelectionBox && _Engine.SelectionBox.Active();
          window.WatcherScreenLock.Lock = true;
          break;
        case "31": //剖切多面
          _Engine.Clipping && _Engine.Clipping.MultiSideOpen();
          break;
        case "32": //添加X平面
          _Engine.Clipping && _Engine.Clipping.SingleSideOpen("X轴");
          break;
        case "33": //添加Y平面
          _Engine.Clipping && _Engine.Clipping.SingleSideOpen("Y轴");
          break;
        case "34": //添加Z平面
          _Engine.Clipping && _Engine.Clipping.SingleSideOpen("Z轴");
          break;
        case "4": //
          _Engine.Render && _Engine.Render.Active();
          break;
        case "5": //
          _Engine.scene.controls.enabled = !_Engine.scene.controls.enabled;
          break;
        case "61": //
          _Engine.Measures && _Engine.Measures.SimpleMeasure.Active();
          break;
        case "62": //
          _Engine.Measures && _Engine.Measures.HeightMeasure.Active();
          break;
        case "63": //
          _Engine.Measures && _Engine.Measures.DistanceMeasure.Active();
          break;
        case "64": //
          _Engine.Measures && _Engine.Measures.PointMeasure.Active();
          break;
        case "65": //
          _Engine.Measures && _Engine.Measures.ElevationHeightMeasure.Active();
          break;
        default:
          break;
      }
    }

    let DeviceType = getDeviceType();
    if (DeviceType === "Mobile") {
      if (
        currentBtn &&
        currentBtn !== "81" &&
        currentBtn !== "82" &&
        currentBtn !== "83" &&
        currentBtn !== "84" &&
        currentBtn !== "85" &&
        currentBtn !== "86"
      ) {
        menu_container.className = "Top-Menu-Container-Mask Hide-Menu-Contain";
      } else {
        menu_container.className = "Top-Menu-Container-Mask Show-Menu-Contain";
      }
    }
  }

  function clearActived() {
    for (let i = 0; i < _topMenu.MenuList.length; i++) {
      if (_topMenu.MenuList[i].value == "7") {
        continue;
      }
      _topMenu.MenuList[i].domEl.className = _topMenu.MenuList[i].domEl.className.replace(
        "Actived",
        ""
      );
      if (_topMenu.MenuList[i].children && _topMenu.MenuList[i].children.length) {
        for (let j = 0; j < _topMenu.MenuList[i].children.length; j++) {
          _topMenu.MenuList[i].children[j].domEl.className = _topMenu.MenuList[i].children[
            j
          ].domEl.className.replace("Actived", "");
        }
      }
    }
  }

  // 设置互斥操做
  function closeOtherActive() {
    if (sessionStorage.getItem("RootMenuSelect") === "视点") {
      window.DataWatcher.MenuName = "视点";
      return true;
    }
    return false;
  }

  return _topMenu;
}
