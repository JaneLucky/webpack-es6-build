<template>
  <div class="reviewer-img-contain" v-if="showMask" >
    <div class="img-contain" @click="closeMask">
      <img v-if="item.status==='success'" :src="'/downLoad'+item.url" @click.stop/>
      <img v-else :src="item.url" @click.stop/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show:{
        type: Boolean,
        default: false
    },
    item:{
      type:Object,
      default: null
    }
  },
  data() {
    return {
      data: "我是a组件",
      showMask: this.show
    };
  },
  created() {
  },
  methods:{
    closeMask(){
      // 创建A组件，并挂载到body上
      this.showMask=false
    }
  }
};
</script>

<style lang="scss" scoped>
.reviewer-img-contain{
  position: fixed;
  width: 100vw;
  height: 100vh;
  background: rgba($color: #000000, $alpha: 0.3);
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
  margin: 0;
  z-index: 2007;
  .img-contain{
    width: 100%;
    height: 100%;
    position: relative;
    img{
      position: absolute;
      min-width: 250px;
      height: auto;
      overflow: hidden;
      left: 50%;
      top:50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>

