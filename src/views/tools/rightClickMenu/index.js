import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";
import QuantitiesList from "@/views/components/PCView/DialogView/Buis/quantities/QuantitiesList.vue";
import { create } from "@/utils/create";
import { GetModelCategory, GetModelLevel } from "@/api/modelTreeService";

export function CreateRightClickMenu(_Engine) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/RightClickMenu.scss");
  var _rightClickMenu = new Object();
  _rightClickMenu.Show = false;

  let right_click_menu_container;
  let _container = _Engine.scene.renderer.domElement.parentElement;
  let CAMERA_POSITION;
  let isShowAll = true; //是否显示全部
  _rightClickMenu.MenuList = [
    //右键菜单列表
    // {
    // value: '1',
    // label: '查看属性',
    // domItem: null,
    // childContain: null,
    // alwaysShow: false
    // },
    {
      value: "2",
      label: "工程量",
      domItem: null,
      childContain: null,
      alwaysShow: false
    },
    {
      value: "3",
      label: "隔离",
      domItem: null,
      childContain: null,
      alwaysShow: false
    },
    {
      value: "4",
      label: "隐藏",
      domItem: null,
      childContain: null,
      alwaysShow: false
    },
    {
      value: "5",
      label: "显示全部",
      domItem: null,
      childContain: null,
      alwaysShow: true
    },
    {
      value: "6",
      label: "隐藏全部",
      domItem: null,
      childContain: null,
      alwaysShow: false
    },
    {
      value: "7",
      label: "快速选择",
      domItem: null,
      childContain: null,
      alwaysShow: false,
      children: [
        {
          value: "71",
          label: "同类构件"
        },
        {
          value: "72",
          label: "同层构件"
        },
        {
          value: "73",
          label: "同类同层构件"
        }
      ]
    },
    {
      value: "8",
      label: "构件框",
      domItem: null,
      childContain: null,
      alwaysShow: false
    }
  ];
  _rightClickMenu.Actived = [];

  CreateUI();

  //鼠标移动坐标2D坐标
  _Engine.scene.renderer.domElement.addEventListener(
    "pointerdown",
    function (event) {
      event.preventDefault(); // 阻止默认的点击事件执行
      CAMERA_POSITION = {
        x: event.x,
        y: event.y
      };
      _rightClickMenu.HideMenu();
    },
    false
  );

  //点击了鼠标右键
  _Engine.scene.renderer.domElement.addEventListener(
    "contextmenu",
    function (event) {
      if (event.button === 2) {
        event.preventDefault(); // 阻止默认的点击事件执行
        if (Math.abs(event.x - CAMERA_POSITION.x) < 2 && Math.abs(event.y - CAMERA_POSITION.y) < 2) {
          _rightClickMenu.ShowMenu(event);
        } else {
          _rightClickMenu.HideMenu();
        }
      }
    },
    false
  );

  _rightClickMenu.ShowMenu = function (event) {
    if (right_click_menu_container) {
      right_click_menu_container.style.display = "block";
      let topSize = event.y - _Engine.scene.camera.viewport.y;
      let leftSize = event.x - _Engine.scene.camera.viewport.x;
      if (topSize > _Engine.scene.camera.viewport.w - right_click_menu_container.clientHeight) {
        topSize = _Engine.scene.camera.viewport.w - right_click_menu_container.clientHeight;
      }
      if (leftSize > _Engine.scene.camera.viewport.z - right_click_menu_container.clientWidth) {
        leftSize = _Engine.scene.camera.viewport.z - right_click_menu_container.clientWidth;
      }
      right_click_menu_container.style.top = topSize + "px";
      right_click_menu_container.style.left = leftSize + "px";
      for (let i = 0; i < _rightClickMenu.MenuList.length; i++) {
        if (!_rightClickMenu.MenuList[i].alwaysShow) {
          if (_rightClickMenu.MenuList[i].value === "8") {
            _rightClickMenu.MenuList[i].domItem.style.display =
              (_Engine.SelectedModels.indexesModels.length && isShowAll) ||
              (_Engine.Clipping && _Engine.Clipping.isActive && !_Engine.Clipping.AllClip)
                ? "block"
                : "none";
            _rightClickMenu.MenuList[i].domItem.innerText = "构件框";
            if (_Engine.Clipping.isActive && !_Engine.Clipping.AllClip) {
              _rightClickMenu.MenuList[i].domItem.innerText = "取消构件框";
            }
          } else if (_rightClickMenu.MenuList[i].value === "5") {
            _rightClickMenu.MenuList[i].domItem.style.display =
              _Engine.SelectedModels.indexesModels.length && !isShowAll ? "block" : "none";
          } else if (_rightClickMenu.MenuList[i].value === "6") {
            _rightClickMenu.MenuList[i].domItem.style.display = isShowAll ? "block" : "none";
          } else {
            _rightClickMenu.MenuList[i].domItem.style.display = _Engine.SelectedModels.indexesModels.length && isShowAll ? "block" : "none";
          }
        }
      }
      _rightClickMenu.Show = true;
    }
  };
  _rightClickMenu.HideMenu = function () {
    if (right_click_menu_container) {
      right_click_menu_container.style.display = "none";
      _rightClickMenu.Show = false;
    }
  };

  // __Engine.RightClickMenu.AddItem(
  // 	{
  // 	 value: '7',
  // 	 label: '快速选择',
  // 	 domItem: null,
  // 	 childContain: null,
  // 	 alwaysShow: false,
  // 	 children: [{
  // 		 value: '71',
  // 		 label: '同类构件',
  // 		 callback : (val)=>{
  // 			//执行点击操作
  // 		 }
  // 	 }, {
  // 		 value: '72',
  // 		 label: '同层构件',
  // 		 callback : (val)=>{
  // 			//执行点击操作
  // 		 }
  // 	 }, {
  // 		 value: '73',
  // 		 label: '同类同层构件',
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
    CreateItem(item, true);
  };

  //创建右键UI
  function CreateUI() {
    if (right_click_menu_container) {
      right_click_menu_container.style.display = "block"; //关闭弹框UI
      return;
    }
    right_click_menu_container = document.createElement("div");
    right_click_menu_container.className = "Right-Click-Menu-Container";

    for (let i = 0; i < _rightClickMenu.MenuList.length; i++) {
      CreateItem(_rightClickMenu.MenuList[i]);
    }
    _container.appendChild(right_click_menu_container);
  }

  function CreateItem(item, add = false) {
    let menu_item = document.createElement("div");
    menu_item.className = "Menu-Item";
    if (item.children && item.children.length) {
      let menu_item_span = document.createElement("span");
      menu_item_span.innerHTML = item.label;
      menu_item.appendChild(menu_item_span);
      let menu_item_icon = document.createElement("span");
      menu_item_icon.className = "Menu-Item-Icon";
      menu_item_icon.innerHTML = ">";
      menu_item.appendChild(menu_item_icon);

      let menu_child_container = document.createElement("div");
      menu_child_container.className = "Menu_Child_Container";
      for (let j = 0; j < item.children.length; j++) {
        let menu_child_item = document.createElement("div");
        menu_child_item.className = "Menu-Item";
        menu_child_item.dataset.value = item.value + "," + item.children[j].value;

        let menu_child_item_span = document.createElement("span");
        menu_child_item_span.innerHTML = item.children[j].label;
        menu_child_item_span.dataset.value = item.value + "," + item.children[j].value;
        menu_child_item.appendChild(menu_child_item_span);
        menu_child_item.onclick = e => {
          e.stopPropagation();
          let checked = e.target.dataset.value.split(",");
          _rightClickMenu.Actived = checked;
          if (add) {
            item.children[j].callback(checked);
            _rightClickMenu.HideMenu();
          } else {
            handleChange(checked[1]);
          }
        };
        menu_child_container.appendChild(menu_child_item);
      }
      menu_item.addEventListener("mouseover", e => {
        menu_child_container.style.display = "block";
        menu_item.style.background = "#ffffff";
        menu_item.style.color = "#409EFF";
        ResetListPosition(item, menu_item);
      });
      menu_item.appendChild(menu_child_container);
      item.childContain = menu_child_container;
      item.domItem = menu_item;
    } else {
      let menu_item_span = document.createElement("span");
      menu_item_span.innerHTML = item.label;
      menu_item.appendChild(menu_item_span);
      item.domItem = menu_item;
      menu_item.addEventListener("mouseover", e => {
        for (let k = 0; k < _rightClickMenu.MenuList.length; k++) {
          if (_rightClickMenu.MenuList[k].childContain) {
            _rightClickMenu.MenuList[k].childContain.style.display = "none";
            _rightClickMenu.MenuList[k].domItem.style.background = "transparent";
            _rightClickMenu.MenuList[k].domItem.style.color = "#ffffff";
          }
        }
        ResetListPosition(item);
      });
    }
    menu_item.dataset.value = item.value;
    menu_item.onclick = e => {
      _rightClickMenu.Actived = [e.target.dataset.value];
      if (add) {
        item.callback(e.target.dataset.value);
        _rightClickMenu.HideMenu();
      } else {
        handleChange(e.target.dataset.value);
      }
    };
    right_click_menu_container.appendChild(menu_item);
    add && _rightClickMenu.MenuList.push(item);
  }

  function ResetListPosition(item, dom) {
    let top = right_click_menu_container.offsetTop;
    let left = right_click_menu_container.offsetLeft;
    let width = right_click_menu_container.clientWidth;
    let height = right_click_menu_container.clientHeight;
    if (item.children && item.children.length) {
      let childWidth = dom.getElementsByClassName("Menu_Child_Container")[0].clientWidth;
      let childHeight = dom.getElementsByClassName("Menu_Child_Container")[0].clientHeight;
      if (top > _Engine.scene.camera.viewport.w - height * 0.8 - childHeight) {
        top = _Engine.scene.camera.viewport.w - height * 0.8 - childHeight;
      }
      if (left > _Engine.scene.camera.viewport.z - width - childWidth) {
        left = _Engine.scene.camera.viewport.z - width - childWidth;
      }
    } else {
      if (top > _Engine.scene.camera.viewport.w - height) {
        top = _Engine.scene.camera.viewport.w - height;
      }
      if (left > _Engine.scene.camera.viewport.z - width) {
        left = _Engine.scene.camera.viewport.z - width;
      }
    }
    right_click_menu_container.style.top = top + "px";
    right_click_menu_container.style.left = left + "px";
  }

  function handleChange(val) {
    ClearSelect();
    _Engine.UpdateRender();
    let indexesList;
    switch (val) {
      case "1":
        break;
      case "2":
        let dom = _Engine.scene.renderer.domElement.parentElement;
        create(dom, QuantitiesList, {
          show: true,
          item: {}
        });
        break;
      case "3": //隔离
        //隐藏所有
        indexesList = _Engine.GetAllIndexesModel();
        indexesList.length && _Engine.ResetSelectedModels_("visible", indexesList, false);
        //显示选中的
        _Engine.SelectedModels.indexesModels.length && _Engine.ResetSelectedModels_("visible", _Engine.SelectedModels.indexesModels, true);
        isShowAll = false;
        break;
      case "4": //隐藏
        let mids = _Engine.SelectedModels.indexesModels;
        _Engine.SelectedModels.indexesModels.length && _Engine.ResetSelectedModels_("visible", _Engine.SelectedModels.indexesModels, false);
        isShowAll = false;
        break;
      case "5": //显示全部
        indexesList = _Engine.GetAllIndexesModel();
        indexesList.length && _Engine.ResetSelectedModels_("visible", indexesList, true);
        window.WatcherAllModelShow && (window.WatcherAllModelShow.Type = "all");
        isShowAll = true;
        break;
      case "6": //隐藏全部
        indexesList = _Engine.GetAllIndexesModel();
        indexesList.length && _Engine.ResetSelectedModels_("visible", indexesList, false);
        window.WatcherAllModelShow && (window.WatcherAllModelShow.Type = "none");
        isShowAll = false;
        break;
      case "71": //同类构件
        if (_Engine.SelectedModels.indexesModels.length && _Engine.ModelClassify.length) {
          let SameTypeList = getSameTypeOrLevelModels("SameType");
          _Engine.ResetSelectedModels_("highlight", SameTypeList, true);
        }
        break;
      case "72": //同层构件
        if (_Engine.SelectedModels.indexesModels.length && _Engine.ModelClassify.length) {
          let SameLevelList = getSameTypeOrLevelModels("SameLevel");
          _Engine.ResetSelectedModels_("highlight", SameLevelList, true);
        }
        break;
      case "73": //同类同层构件
        if (_Engine.SelectedModels.indexesModels.length && _Engine.ModelClassify.length) {
          let SameTypeList = getSameTypeOrLevelModels("SameType");
          let SameLevelList = getSameTypeOrLevelModels("SameLevel");
          let NoRepeatSameList = removedup(SameTypeList, SameLevelList);
          _Engine.ResetSelectedModels_("highlight", NoRepeatSameList, true);
        }
        break;
      case "8": //构件框
        if (_Engine.Clipping) {
          let domItem = _rightClickMenu.MenuList.filter(item => item.value == val)[0].domItem;
          if (_Engine.Clipping.isActive) {
            if (_Engine.Clipping.AllClip) {
              _Engine.Clipping.MultiSideOpen(null, false);
              domItem.innerText = "取消构件框";
            } else {
              _Engine.Clipping.MultiSideClose();
              domItem.innerText = "构件框";
            }
          } else {
            _Engine.Clipping.MultiSideOpen(null, false);
            domItem.innerText = "取消构件框";
          }
        }
        break;
      default:
        break;
    }
    _rightClickMenu.HideMenu();
  }
  //获得同类或者同层构件列表
  function getSameTypeOrLevelModels(flag) {
    let TypeOrLevelList = [];
    let groupFlag = [];
    for (let model of _Engine.SelectedModels.indexesModels) {
      let mesh = _Engine.scene.children[model[0]];
      for (let group of _Engine.ModelClassify) {
        if (mesh.relativePath === group.Path) {
          for (const groupChild of group[flag]) {
            let indexG = groupFlag.findIndex(item => item.name === groupChild.Name && item.path === mesh.relativePath);

            if (indexG === -1) {
              groupChild.ModelIds = groupChild.ModelIds ? groupChild.ModelIds : [];
              let has = groupChild.ModelIds.some(gc => gc[0] === model[0] && gc[1] === model[1]);
              if (has) {
                groupFlag.push({
                  path: mesh.relativePath,
                  name: groupChild.Name
                });
                Array.prototype.splice.apply(
                  TypeOrLevelList,
                  [TypeOrLevelList.length, groupChild.ModelIds.length].concat(groupChild.ModelIds)
                );
              }
            }
          }
        }
      }
    }
    return TypeOrLevelList;
  }
  //数组对象去重
  function removedup(arr1, arr2) {
    var arr3 = arr1.filter(item1 => {
      return arr2.findIndex(item2 => item1[0] == item2[0] && item1[1] == item2[1]) != -1;
    });
    return arr3;
  }
  // 清除选中样式
  function ClearSelect() {
    for (let i = 0; i < _rightClickMenu.MenuList.length; i++) {
      if (_rightClickMenu.MenuList[i].domItem) {
        _rightClickMenu.MenuList[i].domItem.style.background = "#656565";
        _rightClickMenu.MenuList[i].domItem.style.color = "#ffffff";
      }
      if (_rightClickMenu.MenuList[i].childContain) {
        _rightClickMenu.MenuList[i].childContain.style.display = "none";
      }
    }
  }

  return _rightClickMenu;
}
