<template>
  <div class="Render-Set-Dialog" v-show="dialogVisible" v-drag>
    <div class="Feader-Contain">
      <div class="Title">引擎设置</div>
      <div class="Close-Btn" @click="Close()">×</div>
    </div>
    <div class="Main-Contain">
      <div class="Module-Header">
        <div class="Icon"></div>
        <div class="Title">模型效果</div>
      </div>
      <div class="Form_Item">
        <div class="Form_Item_Label">地面阴影</div>
        <el-switch v-model="effectForm.shadowGround" @change="onSwitchChange('shadowGround')"></el-switch>
      </div>
      <div class="Form_Item">
        <div class="Form_Item_Label">显示边线</div>
        <el-switch v-model="effectForm.displayEdge" @change="onSwitchChange('displayEdge')"></el-switch>
      </div>
      <div class="Module-Header">
        <div class="Icon"></div>
        <div class="Title">场景光照</div>
      </div>
      <div class="Form_Item">
        <div class="Form_Item_Label">显示阴影</div>
        <el-switch v-model="effectForm.displayShadow" @change="onSwitchChange('displayShadow')"></el-switch>
      </div>
      <div class="Form_Item">
        <div class="Form_Item_Label Slider-Label">阴影强度</div>
        <div class="Slider-Contain" @mousedown.stop>
          <el-slider
            v-model="effectForm.shadowIntensity"
            :min="0"
            :max="1"
            :step="0.1"
            style="width: 100%"
            @change="onSliderChange('shadowIntensity')"
          ></el-slider>
        </div>
      </div>
      <div class="Module-Header">
        <div class="Icon"></div>
        <div class="Title">环境光效果</div>
      </div>
      <div class="Form_Item">
        <div class="Form_Item_Label">环境光照</div>
        <el-switch v-model="effectForm.showAmbientLight" @change="onSwitchChange('showAmbientLight')"></el-switch>
      </div>
      <div class="Form_Item">
        <div class="Form_Item_Label Slider-Label">曝光强度</div>
        <div class="Slider-Contain" @mousedown.stop>
          <el-slider
            v-model="effectForm.exposureIntensity"
            :min="0"
            :max="1"
            :step="0.1"
            style="width: 100%"
            @change="onSliderChange('exposureIntensity')"
          ></el-slider>
        </div>
      </div>
      <div class="Form_Item">
        <div class="Form_Item_Label">光照颜色</div>
        <div class="light-color-list">
          <div
            v-for="item in lightColorList"
            :key="item.id"
            :class="['item', effectForm.lightColor === item.color ? 'actived' : '']"
            @click="effectForm.lightColor = item.color"
          >
            <div :style="`background:${item.color}`" class="legened"></div>
            <div class="title">{{ item.label }}</div>
          </div>
        </div>
      </div>
      <!-- <div class="Form_Item">
        <div class="Form_Item_Label Img_Label">环境贴图</div>
        <div class="bg-img-list">
          <div v-for="item in ambientMapList" :key="item.id" :class="['item',effectForm.ambientMap === item.img ?'actived':'']" @click="effectForm.ambientMap = item.img">
            <img :src="item.img" />
          </div>
        </div>
      </div> -->
      <div class="Module-Header">
        <div class="Icon"></div>
        <div class="Title">背景效果</div>
      </div>
      <div class="Form_Item">
        <el-switch
          v-model="effectForm.displayBgImg"
          active-text="背景图片"
          inactive-text="背景颜色"
          @change="onSwitchChange('displayBgImg')"
        ></el-switch>
      </div>
      <div class="Form_Item">
        <div class="Form_Item_Label Img_Label">背景颜色</div>
        <div class="bg-color-list">
          <div
            v-for="item in bgColorList"
            :key="item.id"
            :class="['item', effectForm.bgColor === item.color ? 'actived' : '']"
            :style="`background-image:${item.color}`"
            @click="effectForm.bgColor = item.color"
          ></div>
        </div>
      </div>
      <div class="Form_Item">
        <div class="Form_Item_Label Img_Label">背景图片</div>
        <div class="bg-img-list">
          <div
            v-for="item in bgImgList"
            :key="item.id"
            :class="['item', effectForm.bgImg === item.id ? 'actived' : '']"
            @click="onBgImgChange(item.id)"
          >
            <img :src="item.img" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import drag from "@/directive/drag.js";
export default {
  props: {
    _Engine: {
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
      dialogVisible: true,
      effectForm: {
        shadowGround: false,
        displayShadow: false,
        displayEdge: false,
        showAmbientLight: true,
        cameraType: "透视",
        shadowIntensity: 1,
        exposureIntensity: 0.6,
        bgColor: "",
        lightColor: "",
        displayBgImg: false,
        bgImg: require("@/assets/zt.png"),
        ambientMap: require("@/assets/zt.png")
      },
      bgColorList: [
        {
          id: "1",
          color: "linear-gradient(rgb(241, 243, 244), rgb(241, 243, 244))",
          status: false
        },
        {
          id: "2",
          color: "linear-gradient(rgb(40, 44, 53), rgb(248, 249, 249))",
          status: false
        },
        {
          id: "3",
          color: "linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
          status: false
        },
        {
          id: "4",
          color: "linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0))",
          status: false
        },
        {
          id: "5",
          color: "linear-gradient(rgb(127, 191, 225), rgb(198, 226, 255))",
          status: false
        }
      ],
      lightColorList: [
        {
          id: "1",
          label: "照相亭",
          color: "rgb(226, 227, 224)"
        },
        {
          id: "2",
          label: "游泳池",
          color: "rgb(170, 168, 165)"
        },
        {
          id: "3",
          label: "户外",
          color: "rgb(152, 160, 176)"
        },
        {
          id: "4",
          label: "照相亭",
          color: "rgb(225, 227, 223)"
        },
        {
          id: "5",
          label: "田野",
          color: "rgb(199, 213, 227)"
        },
        {
          id: "6",
          label: "蓝天",
          color: "rgb(235, 235, 234)"
        },
        {
          id: "7",
          label: "暖光",
          color: "rgb(203, 204, 208)"
        },
        {
          id: "8",
          label: "冷光",
          color: "rgb(202, 203, 208)"
        }
      ],
      bgImgList: [
        {
          id: "cloudy",
          img: "static/img/skybox/cloudy/pz.png",
          status: false
        },
        {
          id: "star",
          img: "static/img/skybox/star/pz.png",
          status: false
        },
        {
          id: "city",
          img: "static/img/skybox/city/pz.png",
          status: false
        },
        {
          id: "city02",
          img: "static/img/skybox/city02/pz.png",
          status: false
        },
        {
          id: "sky01",
          img: "static/img/skybox/sky01/pz.png",
          status: false
        },
        {
          id: "sky02",
          img: "static/img/skybox/sky02/pz.png",
          status: false
        }
      ],
      // ambientMapList: [
      //   {
      //     id: "1",
      //     img: require("@/assets/logo.png"),
      //     status: false
      //   },
      //   {
      //     id: "2",
      //     img: require("@/assets/logo.png"),
      //     status: false
      //   },
      //   {
      //     id: "3",
      //     img: require("@/assets/zt.png"),
      //     status: false
      //   },
      //   {
      //     id: "4",
      //     img: require("@/assets/logo.png"),
      //     status: false
      //   },
      //   {
      //     id: "5",
      //     img: require("@/assets/logo.png"),
      //     status: false
      //   },
      //   {
      //     id: "6",
      //     img: require("@/assets/logo.png"),
      //     status: false
      //   }
      // ]
    };
  },
  watch: {
    "effectForm.bgColor"(val) {
      //背景颜色
      this._Engine.Render.SetBackGroundColor(this.effectForm.displayBgImg ? null : val);
    },
    "effectForm.lightColor"(val) {
      //环境光颜色
      this._Engine.Render.SetAmbientLightColor(val);
    }
  },
  mounted() {},
  methods: {
    onBgImgChange(val) {
      this.effectForm.bgImg = val;
      this._Engine.Render.SetSceneSky(this.effectForm.displayBgImg ? this.effectForm.bgImg : null);
      this._Engine.RenderUpdate();
    },
    onSwitchChange(type) {
      switch (type) {
        case "shadowGround": //显隐地面阴影
          break;
        case "displayShadow": //显示阴影
          this._Engine.RenderSAO.enableRenderSAO(this.effectForm.displayShadow);
          this._Engine.RenderSAO.saoPass.params.output = 0;
          this._Engine.RenderSAO.saoPass.params.saoBias = 1;
          this._Engine.RenderSAO.saoPass.params.saoBlur = 0;
          this._Engine.RenderSAO.saoPass.params.saoBlurDepthCutoff = 0.1;
          this._Engine.RenderSAO.saoPass.params.saoBlurRadius = 1;
          this._Engine.RenderSAO.saoPass.params.saoBlurStdDev = 5;
          this._Engine.RenderSAO.saoPass.params.saoIntensity = this.effectForm.shadowIntensity;
          this._Engine.RenderSAO.saoPass.params.saoKernelRadius = 5;
          this._Engine.RenderSAO.saoPass.params.saoMinResolution = 0;
          this._Engine.RenderSAO.saoPass.params.saoScale = 2;
          break;
        case "displayEdge": //显示边线
          this._Engine.Render.DisplayEdge(this.effectForm.displayEdge);
          break;
        case "showAmbientLight": //启动环境光
          this._Engine.scene.ambientLight.visible = this.effectForm.showAmbientLight;
          this._Engine.RenderUpdate();
          break;
        case "displayBgImg": //启动背景
          this._Engine.Render.SetBackGroundColor(this.effectForm.displayBgImg ? null : this.effectForm.bgColor);
          this.onBgImgChange(this.effectForm.bgImg);
          this._Engine.RenderUpdate();
          break;
      }
    },
    onSliderChange(type) {
      switch (type) {
        case "shadowIntensity": // 阴影强度
          this.effectForm.displayShadow && (this._Engine.RenderSAO.saoPass.params.saoIntensity = this.effectForm.shadowIntensity);
          break;
        case "exposureIntensity": // 曝光强度
          this._Engine.Render.SetAmbientLightIntensity(this.effectForm.exposureIntensity);
          break;
      }
    },
    Close() {
      this._Engine && this._Engine.TopMenu.ClickItem("引擎设置");
    }
  }
};
</script>

<style lang="scss" scoped>
.Render-Set-Dialog {
  position: absolute;
  top: 0;
  left: 0;
  width: 360px;
  height: max-content;
  background: #ffffff;
  box-sizing: border-box;
  display: block;
  z-index: 1;
  border: 1px solid #dddddd;
  .Feader-Contain {
    width: 100%;
    height: 34px;
    padding: 10px;
    border-bottom: 1px solid #dddddd;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .Title {
      font-size: 16px;
      font-weight: 600;
      padding-right: 50px;
    }
    .Close-Btn {
      cursor: pointer;
      font-size: 20px;
    }
  }
  .Main-Contain {
    height: max-content;
    padding: 5px 15px 15px;
    box-sizing: border-box;
    .Module-Header {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin-top: 10px;
      .Icon {
        width: 4px;
        height: 16px;
        background: #409eff;
        margin-right: 8px;
      }
      .Title {
        font-size: 16px;
        font-weight: 600;
        line-height: 32px;
      }
    }
    .Form_Item {
      display: flex;
      padding: 5px 0 5px 15px;
    }
    .Form_Item_Label {
      padding-right: 10px;
    }
    .Img_Label {
      line-height: 40px;
    }
    .Slider-Label {
      line-height: 38px;
    }
    .Slider-Contain {
      flex: 1;
      padding: 0 10px 0 5px;
    }
    .input_number_contain {
      display: flex;
      .inputtext {
        margin: 0 10px;
        width: fit-content;
        text-align: center;
        display: flex;
        align-items: center;
      }
      .Btn_Contain {
        border: 1px solid #aaaaaa;
        font-size: 10px;
        display: flex;
        align-items: center;
        color: #666666;
      }
    }

    .bg-color-list {
      flex: 1;
      display: flex;
      align-items: center;
      height: 40px;
      align-items: center;
      .item {
        width: fit-content;
        width: 40px;
        height: 28px;
        box-sizing: border-box;
        border: 2px solid #dddddd;
        cursor: pointer;
      }
      .actived {
        border: 3px solid #409eff;
      }
    }
    .light-color-list {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      .item {
        width: 50%;
        display: flex;
        margin-bottom: 10px;
        cursor: pointer;
        .legened {
          width: 40px;
          height: 28px;
          box-sizing: border-box;
          border-radius: 4px;
        }
        .title {
          line-height: 28px;
          padding-left: 10px;
        }
      }
      .actived {
        .legened {
          border: 2px solid #409eff;
        }
        .title {
          color: #409eff;
        }
      }
    }
    .bg-img-list {
      flex: 1;
      display: flex;
      align-items: center;
      height: 40px;
      align-items: center;
      .item {
        width: fit-content;
        width: 34px;
        height: 26px;
        box-sizing: border-box;
        border: 2px solid #ffffff;
        cursor: pointer;
        margin: 0 2px;
        img {
          width: 100%;
          height: 100%;
          display: block;
          overflow: hidden;
        }
      }
      .actived {
        border: 3px solid #409eff;
      }
    }
  }
}
</style>
