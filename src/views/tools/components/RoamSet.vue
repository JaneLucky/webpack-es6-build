<template>
  <div class="Roam_Dialog" v-show="dialogVisible" v-drag>
    <div class="Header_Contain">
      <div class="Header_Title">漫游设置</div>
      <div class="Header_Btns">
        <div class="Header_Min Btn" v-if="showForm" @click="onClickShowForm(false)"><div class="Header_Min_Inside"></div></div>
        <div class="Header_Max Btn" v-else @click="onClickShowForm(true)"></div>
        <div class="Header_Close Btn" v-if="DeviceOS === 'PC'" @click="Close()">×</div>
      </div>
    </div>
    <div class="Header_Main Btn" v-show="showForm">
      <div class="Form_Contain">
        <div class="Form-Row">
          <div class="Form_Item">
            <div class="Form_Item_Label">小地图</div>
            <el-switch v-model="form.minMap"></el-switch>
          </div>
          <div class="Form_Item">
            <div class="Form_Item_Label">重力</div>
            <el-switch v-model="form.gravity"></el-switch>
          </div>
          <div class="Form_Item">
            <div class="Form_Item_Label">碰撞</div>
            <el-switch v-model="form.collision"></el-switch>
          </div>
          <div class="Form_Item">
            <div class="Form_Item_Label">速度</div>
            <div class="Btn_Contain" @click="onSpeedChange('sub')">
              <svg aria-hidden="true" class="Svg-Icon"><use xlink:href="#icon-jianhao"></use></svg>
            </div>
            <div class="Speed_Text">{{ form.speedUnit }}X</div>
            <div class="Btn_Contain" @click="onSpeedChange('add')">
              <svg aria-hidden="true" class="Svg-Icon"><use xlink:href="#icon-jiahao"></use></svg>
            </div>
          </div>
        </div>
        <div class="Form-Row-One">
          <div class="Form_Item">
            <div class="Form_Item_Label">相机广角</div>
            <div class="Form_Item_Right" @mousedown.stop>
              <el-slider v-model="form.cameraFov"></el-slider>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import drag from "@/directive/drag.js";
import { getDeviceOS } from "@/utils/device";
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
  directives: {
    drag: drag
  },
  data() {
    return {
      DeviceOS: "PC",
      dialogVisible: true,
      showForm: true,
      form: {
        minMap: false,
        gravity: false,
        collision: false,
        speedUnit: 1,
        cameraFov: 50
      }
    };
  },
  watch: {
    form: {
      handler(val) {
        this._Engine.FirstPersonControls.UpdateSet(val);
      },
      deep: true
    }
  },
  mounted() {
    this.DeviceOS = getDeviceOS();
    this.InitData();
  },
  methods: {
    InitData() {
      if (this.Param) {
        this.form.minMap = this.Param.minMap;
        this.form.gravity = this.Param.gravity;
        this.form.collision = this.Param.collision;
        this.form.speedUnit = this.Param.speedUnit;
        this.form.cameraFov = this.Param.cameraFov;
      }
    },
    onClickShowForm(val) {
      this.showForm = val;
      this.$nextTick(() => {});
    },
    onSpeedChange(type) {
      switch (type) {
        case "sub":
          if (this.form.speedUnit > 1) {
            this.form.speedUnit = this.form.speedUnit / 2;
          }
          break;
        case "add":
          if (this.form.speedUnit < 32) {
            this.form.speedUnit = this.form.speedUnit * 2;
          }
          break;
      }
    },
    Close() {
      this.Clear();
      this._Engine.TopMenu && this._Engine.TopMenu.ClickItem("漫游");
    },
    Clear() {
      const nodeList = document.querySelectorAll(".el-tooltip__popper");
      for (var i = 0; i < nodeList.length; i++) {
        nodeList[i].remove();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.PCView-page-container {
  .Roam_Dialog {
    position: absolute;
    bottom: 10px;
    left: calc(50% - 250px);
    width: 500px;
    height: fit-content;
    border: 1px solid #656565;
    box-sizing: border-box;
    user-select: none;
    .Header_Contain {
      display: flex;
      width: 100%;
      background: #656565;
      border-bottom: 0.0625rem solid rgb(255, 255, 255, 0.5);
      box-sizing: border-box;
      height: 36px;
      line-height: 36px;
      padding: 0 10px;
      color: #dddddd;
      .Header_Title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
      }
      .Header_Btns {
        display: flex;
        align-items: center;
        height: 36px;
        .Btn {
          font-size: 25px;
          cursor: pointer;
          margin-left: 10px;
        }
        .Header_Min {
          width: 12px;
          height: 12px;
          .Header_Min_Inside {
            width: 12px;
            height: 3px;
            background: #dddddd;
            margin-top: 4.5px;
          }
        }
        .Header_Max {
          width: 12px;
          height: 12px;
          box-sizing: border-box;
          border: 3px solid #dddddd;
          border-radius: 2px;
        }
      }
    }
    .Form_Contain {
      width: 100%;
      height: fit-content;
      background: #ffffff;
      padding: 15px 0;
      .Form-Row {
        display: flex;
        font-size: 16px;
        width: 100%;
        justify-content: space-around;
        align-items: center;
        .Form_Item {
          display: flex;
          align-items: center;
          .Form_Item_Label {
            padding-right: 5px;
          }
          .Btn_Contain {
            border: 1px solid #aaaaaa;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            border-radius: 4px;
          }
          .Speed_Text {
            text-align: center;
            width: 50px;
          }
        }
      }
      .Form-Row-One {
        width: 100%;
        padding: 0 30px 0 15px;
        box-sizing: border-box;
        .Form_Item {
          margin-top: 10px;
          display: flex;
          width: 100%;
          align-items: center;
          .Form_Item_Label {
            padding-right: 20px;
          }
          .Form_Item_Right {
            flex: 1;
          }
        }
      }
    }
  }
}
.MobileView-page-container {
  .Roam_Dialog {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 200px;
    height: fit-content;
    border: 1px solid #656565;
    box-sizing: border-box;
    user-select: none;
    .Header_Contain {
      display: flex;
      width: 100%;
      background: #656565;
      border-bottom: 0.0625rem solid rgb(255, 255, 255, 0.5);
      box-sizing: border-box;
      height: 36px;
      line-height: 36px;
      padding: 0 10px;
      color: #dddddd;
      .Header_Title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
      }
      .Header_Btns {
        display: flex;
        align-items: center;
        height: 36px;
        .Btn {
          font-size: 25px;
          cursor: pointer;
          margin-left: 10px;
        }
        .Header_Min {
          width: 12px;
          height: 12px;
          .Header_Min_Inside {
            width: 12px;
            height: 3px;
            background: #dddddd;
            margin-top: 4.5px;
          }
        }
        .Header_Max {
          width: 12px;
          height: 12px;
          box-sizing: border-box;
          border: 3px solid #dddddd;
          border-radius: 2px;
        }
      }
    }
    .Form_Contain {
      background: #ffffff;
      font-size: 16px;
      height: fit-content;
      padding: 10px 10px;
      .Form-Row {
        .Form_Item {
          display: flex;
          align-items: center;
          padding: 5px 0;
          .Form_Item_Label {
            padding-right: 15px;
            width: 50px;
            text-align: right;
          }
          .Btn_Contain {
            border: 1px solid #aaaaaa;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            border-radius: 4px;
          }
          .Speed_Text {
            text-align: center;
            width: 50px;
          }
        }
      }
      .Form-Row-One {
        width: 100%;
        padding: 0 15px 0 10px;
        box-sizing: border-box;
        .Form_Item {
          display: flex;
          width: 100%;
          align-items: center;
          .Form_Item_Label {
            padding-right: 10px;
          }
          .Form_Item_Right {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
