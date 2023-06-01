<template>
  <div class="mini-elevation-select">
    <el-cascader ref="elecationRef" v-model="selectVal" :options="options" size="mini" @change="handleChange"></el-cascader>
  </div>
</template>

<script>
export default {
  props: {
    _Engine: {
      type: Object,
      default: null
    }
  },
  components: {},
  data() {
    return {
      selectVal: [],
      options: []
    };
  },
  mounted() {
    if (window.bimEngine) {
      window.bimEngine.LoadModelElevation();
      this.options = window.bimEngine.ElevationList.filter(item => item.children && item.children.length);
    }
  },
  methods: {
    handleChange(value) {
      let ckeckedNode = this.$refs.elecationRef.getCheckedNodes();
      if (ckeckedNode) {
        let item = ckeckedNode[0].data;
        item.Elevation && (window.bimEngine.scene.camera.position.y = item.Elevation * 0.3048);
        window.bimEngine.UpdateRender();
      }
    },
    Close() {
      this.Clear();
    },
    Clear() {}
  }
};
</script>

<style lang="scss" scoped>
.PCView-page-container {
  .mini-elevation-select {
    position: absolute;
    top: 5px;
    left: 5px;
  }
}
.MobileView-page-container {
  .mini-elevation-select {
    position: absolute;
    top: 5px;
    left: 5px;
  }
}
</style>
