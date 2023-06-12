import { CreateSvg } from "@/views/tools/common/index.js";
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";
import { getDeviceOS } from "@/utils/device";
import { handleScreenResize } from "@/views/tools/common/screenResize.js";
import TopMenu from "@/views/tools/components/TopMenu.vue";
import { create } from "@/utils/create";

export function CreateTopMenu(_Engine) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/TopMenu.scss");
  var _topMenu = new Object();
  _topMenu.Show = true;
  _topMenu.ActivedMenu = [];
  let _container = _Engine.scene.renderer.domElement.parentElement;
  let AllMenuList = [
    //顶部菜单列表
    {
      pId: "0",
      value: "8",
      label: "视角",
      icon: "icon-View-All",
      status: false,
      showType: "Phone",
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
      showType: "PC Pad Phone",
      disabled: false
    },
    {
      pId: "0",
      value: "2",
      label: "框选",
      icon: "icon-kuangxuan",
      status: false,
      showType: "PC Pad",
      disabled: false
    },
    {
      pId: "0",
      value: "3",
      label: "截面分析",
      icon: "icon-pouqie",
      status: false,
      showType: "PC Pad Phone",
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
      showType: "PC Pad Phone",
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
      value: "7",
      label: "版本对比",
      icon: "icon-window-restore",
      status: false,
      showType: "PC",
      disabled: false
    },
    {
      pId: "0",
      value: "4",
      label: "引擎设置",
      icon: "icon-setting",
      status: false,
      showType: "PC Pad Phone",
      disabled: false
    },
    {
      pId: "0",
      value: "5",
      label: "锁定视图",
      icon: "icon-lock-screen",
      status: false,
      showType: "Phone",
      disabled: false
    }
  ];

  CreateUI();

  _topMenu.ShowMenu = function () {
    _topMenu.Show = true;
  };
  _topMenu.HideMenu = function () {
    _topMenu.Show = false;
  };

  // _Engine.TopMenu.AddItem(
  //   {
  //     pId: '0',
  //     value: '8',
  //     label: '视角',
  //     icon: 'icon-View-All',
  //     status: false,
  //     showType: 'Phone',
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

  // 给顶部menu列表添加一项
  _topMenu.AddItem = function (item) {
    CreateItem(item, true);
  };

  // 代码调用点击顶部menu列表
  _topMenu.ClickItem = function (label) {
    let MenuList = _topMenu.Component.MenuList;
    let child = null,
      parent = null;
    for (let i = 0; i < MenuList.length; i++) {
      if (MenuList[i].label === label) {
        child = MenuList[i];
        break;
      } else {
        if (MenuList[i].children) {
          for (let j = 0; j < MenuList[i].children.length; j++) {
            if (MenuList[i].children[j].label === label) {
              child = MenuList[i].children[j];
              parent = MenuList[i];
              break;
            }
          }
        }
        if (child) {
          break;
        }
      }
    }
    if (child) {
      _topMenu.Component.OnMenuClick(child, parent);
    }
  };

  // 设置顶部menu列表不可选
  _topMenu.DisabledItem = function (pLabel, cLabel, disabled) {};

  // 创建顶部menu列表
  function CreateUI() {
    if (_topMenu.Component) {
      return;
    }
    _topMenu.Component = create(_container, TopMenu, { _Engine: _Engine, Param: {} });
  }

  // 清除不需要的信息
  function Clear() {
    const nodeList = document.querySelectorAll(".el-tooltip__popper");
    for (var i = 0; i < nodeList.length; i++) {
      nodeList[i].remove();
    }
  }

  return _topMenu;
}
