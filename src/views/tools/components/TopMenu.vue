<template>
  <div class="Top-Menu-Container">
    <div class="Menu-List">
      <div
        v-for="item in MenuList"
        :key="item.value"
        :class="['Item', item.status || item.activeChild ? 'Actived' : '']"
        @click.stop="OnMenuClick(item, null)"
      >
        <div class="Icon-Contain">
          <svg-icon :icon-file-name="item.icon"></svg-icon>
        </div>
        <div class="Child-List" v-if="item.children && item.status">
          <div
            v-for="child in item.children"
            :key="child.value"
            :class="['Item', item.activeChild === child.value ? 'Actived' : '']"
            @click.stop="OnMenuClick(child, item)"
          >
            <div class="Icon-Contain">
              <svg-icon :icon-file-name="child.icon"></svg-icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDeviceOS } from "@/utils/device";
import { getArrDifference, getArrSame, getArrNotIn } from "@/utils/common";
import { handleScreenResize } from "@/views/tools/common/screenResize.js";
export default {
  props: {
    _Engine: {
      type: Object,
      default: null
    },
    Param: {
      type: Object,
      default: null
    }
  },
  components: {},
  data() {
    return {
      DeviceOS: "PC",
      AllMenuList: [
        //顶部菜单列表
        {
          pId: "0",
          value: "1",
          label: "视角",
          icon: "View-All",
          showType: "Phone",
          status: false,
          disabled: false,
          activeChild: null,
          children: [
            {
              pId: "1",
              value: "11",
              label: "俯视图",
              icon: "View-Top",
              showType: "Phone",
              status: false,
              disabled: false,
              dir: "top"
            },
            {
              pId: "1",
              value: "12",
              label: "仰视图",
              icon: "View-Bottom",
              showType: "Phone",
              status: false,
              disabled: false,
              dir: "down"
            },
            {
              pId: "1",
              value: "13",
              label: "右视图",
              icon: "View-East",
              showType: "Phone",
              status: false,
              disabled: false,
              dir: "right"
            },
            {
              pId: "1",
              value: "14",
              label: "前视图",
              icon: "View-South",
              showType: "Phone",
              status: false,
              disabled: false,
              dir: "front"
            },
            {
              pId: "1",
              value: "15",
              label: "左视图",
              icon: "View-West",
              showType: "Phone",
              status: false,
              disabled: false,
              dir: "left"
            },
            {
              pId: "1",
              value: "16",
              label: "后视图",
              icon: "View-North",
              showType: "Phone",
              status: false,
              disabled: false,
              dir: "back"
            }
          ]
        },
        {
          pId: "0",
          value: "2",
          label: "漫游",
          icon: "roam",
          showType: "PC Pad Phone",
          status: false,
          disabled: false,
          exclusion: ["3", "41", "42", "43", "44"]
        },
        {
          pId: "0",
          value: "3",
          label: "框选",
          icon: "kuangxuan",
          showType: "PC Pad",
          status: false,
          disabled: false,
          exclusion: ["2", "41", "42", "43", "44", "51", "52", "53", "54", "55"]
        },
        {
          pId: "0",
          value: "4",
          label: "截面分析",
          icon: "pouqie",
          showType: "PC Pad Phone",
          status: false,
          disabled: false,
          activeChild: null,
          children: [
            {
              pId: "4",
              value: "41",
              label: "剖切",
              icon: "codepen",
              showType: "PC Pad Phone",
              status: false,
              disabled: false,
              exclusion: ["2", "3", "51", "52", "53", "54", "55"]
            },
            {
              pId: "4",
              value: "42",
              label: "添加X平面",
              icon: "xalxe",
              showType: "PC Pad Phone",
              status: false,
              disabled: false,
              exclusion: ["2", "3", "51", "52", "53", "54", "55"]
            },
            {
              pId: "4",
              value: "43",
              label: "添加Y平面",
              icon: "zaxle",
              showType: "PC Pad Phone",
              status: false,
              disabled: false,
              exclusion: ["2", "3", "51", "52", "53", "54", "55"]
            },
            {
              pId: "4",
              value: "44",
              label: "添加Z平面",
              icon: "yaxle",
              showType: "PC Pad Phone",
              status: false,
              disabled: false,
              exclusion: ["2", "3", "51", "52", "53", "54", "55"]
            }
          ]
        },
        {
          pId: "0",
          value: "5",
          label: "测量",
          icon: "celianggongju",
          showType: "PC Pad Phone",
          status: false,
          disabled: false,
          activeChild: null,
          children: [
            {
              pId: "5",
              value: "51",
              label: "点点测量",
              icon: "celiang",
              showType: "PC Pad Phone",
              status: false,
              disabled: false,
              exclusion: ["3", "41", "42", "43", "44"]
            },
            {
              pId: "5",
              value: "52",
              label: "净高",
              icon: "arrowsv",
              showType: "PC Pad Phone",
              status: false,
              disabled: false,
              exclusion: ["3", "41", "42", "43", "44"]
            },
            {
              pId: "5",
              value: "53",
              label: "净距",
              icon: "arrowsh",
              showType: "PC Pad Phone",
              status: false,
              disabled: false,
              exclusion: ["3", "41", "42", "43", "44"]
            },
            {
              pId: "5",
              value: "54",
              label: "坐标",
              icon: "dingwei",
              showType: "PC Pad Phone",
              status: false,
              disabled: false,
              exclusion: ["3", "41", "42", "43", "44"]
            },
            {
              pId: "5",
              value: "55",
              label: "标高",
              icon: "biaogao",
              showType: "PC Pad Phone",
              status: false,
              disabled: false,
              exclusion: ["3", "41", "42", "43", "44"]
            }
          ]
        },
        {
          pId: "0",
          value: "6",
          label: "版本对比",
          icon: "window-restore",
          showType: "PC",
          status: false,
          disabled: false
        },
        {
          pId: "0",
          value: "7",
          label: "引擎设置",
          icon: "setting",
          showType: "PC Pad Phone",
          status: false,
          disabled: false
        },
        {
          pId: "0",
          value: "8",
          label: "视点",
          icon: "camera",
          showType: "Phone",
          status: false,
          disabled: false
        },
        {
          pId: "0",
          value: "9",
          label: "其他",
          icon: "list",
          showType: "Phone",
          status: false,
          disabled: false,
          activeChild: null,
          children: [
            {
              pId: "9",
              value: "91",
              label: "构件树",
              icon: "file-tree",
              showType: "Phone",
              status: false,
              disabled: false
            },
            {
              pId: "9",
              value: "92",
              label: "模型属性",
              icon: "attribute",
              showType: "Phone",
              status: false,
              disabled: false
            },
            {
              pId: "9",
              value: "93",
              label: "定点漫游",
              icon: "point-roam-view",
              showType: "Phone",
              status: false,
              disabled: false
            }
          ]
        }
      ],
      ActivedList: [],
      AcrivedJSON: "[]"
    };
  },
  computed: {
    MenuList() {
      for (let i = 0; i < this.AllMenuList.length; i++) {
        if (this.AllMenuList[i].showType.includes(this.DeviceOS) && this.AllMenuList[i].children) {
          this.AllMenuList[i].children = this.AllMenuList[i].children.filter(item => item.showType.includes(this.DeviceOS));
        }
      }
      return this.AllMenuList.filter(
        item =>
          item.showType.includes(this.DeviceOS) && this._Engine.IsMainScene && (!item.children || (item.children && item.children.length))
      );
    }
  },
  watch: {
    AcrivedJSON(newV, oldV) {
      // let newList = JSON.parse(newV);
      // let oldList = JSON.parse(oldV);
      // let current;
      // window.bimEngine.TopMenu.ActivedMenu = newList;
      // let diff = getArrDifference(newList, oldList);
      // if (newList.length === oldList.length) {
      //   diff = getArrSame(newList, diff);
      //   current = diff[0];
      // } else {
      //   current = diff[0];
      // }
    }
  },
  mounted() {
    this.DeviceOS = getDeviceOS();
    this.InitData();
  },
  methods: {
    InitData() {},
    // 设置互斥操做
    closeOtherActive() {
      if (sessionStorage.getItem("RootMenuSelect") === "视点") {
        window.DataWatcher.MenuName = "视点";
        return true;
      }
      return false;
    },
    //按钮点击事件
    OnMenuClick(node, parent) {
      if (node.label === "漫游" && !this._Engine.FirstPersonControls.isActive && this.closeOtherActive()) {
        return;
      }
      this.ClearMenuActive(node);
      if (parent) {
        if (parent.activeChild) {
          if (parent.activeChild === node.value) {
            parent.activeChild = null;
          } else {
            // 二层是单选，先取消同层其他功能
            let index = parent.children.findIndex(item => item.value === parent.activeChild);
            this.DisActivedHandle(parent.children[index]);
            parent.activeChild = node.value;
          }
        } else {
          parent.activeChild = node.value;
        }
        parent.status = false;
      } else {
        //根列表
        node.status = !node.status;
      }
      this.HandleMenuClick(node, parent);
    },
    HandleMenuClick(node, parent) {
      let current = node.value;
      let actived;
      if (parent) {
        actived = parent.activeChild === current ? true : false;
      } else {
        actived = node.status;
      }
      this.GetActivedList();
      if (actived) {
        this.ExclusionSet(node);
        this.ActivedHandle(node);
      } else {
        this.DisActivedHandle(node);
      }
    },
    // 功能互斥处理
    ExclusionSet(node) {
      if (node.exclusion) {
        for (let excVal of node.exclusion) {
          if (this.ActivedList.findIndex(item => item === excVal) > -1) {
            for (let i = 0; i < this.MenuList.length; i++) {
              if (this.MenuList[i].value === excVal) {
                this.OnMenuClick(this.MenuList[i], null);
                break;
              } else {
                if (this.MenuList[i].children && this.MenuList[i].children.length) {
                  let childIndex = this.MenuList[i].children.findIndex(item => item.value === excVal);
                  if (childIndex > -1) {
                    this.OnMenuClick(this.MenuList[i].children[childIndex], this.MenuList[i]);
                    break;
                  }
                }
              }
            }
          }
        }
      }
    },
    // 功能激活处理
    ActivedHandle(node) {
      switch (node.value) {
        case "11": //视角- 俯视图
          this._Engine.ViewCube && this._Engine.ViewCube.cameraGoToSpecialView(node.dir);
          break;
        case "12": //视角- 仰视图
          this._Engine.ViewCube && this._Engine.ViewCube.cameraGoToSpecialView(node.dir);
          break;
        case "13": //视角- 右视图
          this._Engine.ViewCube && this._Engine.ViewCube.cameraGoToSpecialView(node.dir);
          break;
        case "14": //视角- 前视图
          this._Engine.ViewCube && this._Engine.ViewCube.cameraGoToSpecialView(node.dir);
          break;
        case "15": //视角- 左视图
          this._Engine.ViewCube && this._Engine.ViewCube.cameraGoToSpecialView(node.dir);
          break;
        case "16": //视角- 后视图
          this._Engine.ViewCube && this._Engine.ViewCube.cameraGoToSpecialView(node.dir);
          break;
        case "2": //漫游
          this._Engine.FirstPersonControls && this._Engine.FirstPersonControls.Active();
          break;
        case "3": //框选
          this._Engine.SelectionBox && this._Engine.SelectionBox.Active();
          window.WatcherScreenLock && (window.WatcherScreenLock.Lock = true);
          break;
        case "41": //剖切多面
          this._Engine.Clipping &&
            this._Engine.Clipping.MultiSideOpen(this._Engine.OriginalData.clip && this._Engine.OriginalData.clip.data);
          break;
        case "42": //添加X平面
          this._Engine.Clipping &&
            this._Engine.Clipping.SingleSideOpen("X轴", this._Engine.OriginalData.clip && this._Engine.OriginalData.clip.data[0].constant);
          break;
        case "43": //添加Y平面
          this._Engine.Clipping &&
            this._Engine.Clipping.SingleSideOpen("Y轴", this._Engine.OriginalData.clip && this._Engine.OriginalData.clip.data[0].constant);
          break;
        case "44": //添加Z平面
          this._Engine.Clipping &&
            this._Engine.Clipping.SingleSideOpen("Z轴", this._Engine.OriginalData.clip && this._Engine.OriginalData.clip.data[0].constant);
          break;
        case "51": //点点测量
          this._Engine.Measures && this._Engine.Measures.SimpleMeasure.Active();
          break;
        case "52": //净高
          this._Engine.Measures && this._Engine.Measures.HeightMeasure.Active();
          break;
        case "53": //净距
          this._Engine.Measures && this._Engine.Measures.DistanceMeasure.Active();
          break;
        case "54": //坐标
          this._Engine.Measures && this._Engine.Measures.PointMeasure.Active();
          break;
        case "55": //标高
          this._Engine.Measures && this._Engine.Measures.ElevationHeightMeasure.Active();
          break;
        case "6": //版本对比
          document.getElementById("threejs-main-sence-container").style.width = "50%";
          document.getElementById("compare-version-container").style.display = "block";
          window.VersionCompareWatcher.List = true;
          handleScreenResize(this._Engine);
          break;
        case "7": //引擎设置
          this._Engine.Render && this._Engine.Render.Active();
          break;
      }
    },
    // 功能灭活处理
    DisActivedHandle(node) {
      switch (node.value) {
        case "2": //漫游
          this._Engine.FirstPersonControls && this._Engine.FirstPersonControls.DisActive();
          break;
        case "3": //框选
          this._Engine.SelectionBox && this._Engine.SelectionBox.DisActive();
          window.WatcherScreenLock && (window.WatcherScreenLock.Lock = false);
          break;
        case "41": //添加全平面剖切
          this._Engine.Clipping && this._Engine.Clipping.MultiSideClose();
          break;
        case "42": //添加X平面剖切
          this._Engine.Clipping && this._Engine.Clipping.SingleSideClose();
          break;
        case "43": //添加Y平面剖切
          this._Engine.Clipping && this._Engine.Clipping.SingleSideClose();
          break;
        case "44": //添加Z平面剖切
          this._Engine.Clipping && this._Engine.Clipping.SingleSideClose();
          break;
        case "51": //点点测量
          this._Engine.Measures && this._Engine.Measures.SimpleMeasure.DisActive();
          break;
        case "52": //净高
          this._Engine.Measures && this._Engine.Measures.HeightMeasure.DisActive();
          break;
        case "53": //净距
          this._Engine.Measures && this._Engine.Measures.DistanceMeasure.DisActive();
          break;
        case "54": //坐标
          this._Engine.Measures && this._Engine.Measures.PointMeasure.DisActive();
          break;
        case "55": //标高
          this._Engine.Measures && this._Engine.Measures.ElevationHeightMeasure.DisActive();
          break;
        case "6": //版本对比
          document.getElementById("threejs-main-sence-container").style.width = "100%";
          document.getElementById("compare-version-container").style.display = "none";
          window.VersionCompareWatcher.Show = false;
          window.VersionCompareWatcher.List = false;
          handleScreenResize(this._Engine);
          break;
        case "7": //引擎设置
          this._Engine.Render && this._Engine.Render.DisActive();
          break;
      }
    },
    // 获得激活的按钮列表
    GetActivedList() {
      let list = [];
      for (let item of this.MenuList) {
        if (item.children) {
          item.activeChild && list.push(item.activeChild);
        } else {
          item.status && list.push(item.value);
        }
      }
      this.ActivedList = list;
      this.AcrivedJSON = JSON.stringify(this.ActivedList);
    },
    // 关闭按钮子集
    ClearMenuActive(node) {
      for (let item of this.MenuList) {
        if (item.children && node.value !== item.value) {
          item.status = false;
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.PCView-page-container {
  .Top-Menu-Container {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 10;
  }
}
.MobileView-page-container {
  .Top-Menu-Container {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translate(-50%, 0);
    z-index: 10;
  }
}
</style>
