import Vue from 'vue'
import ElementUI from 'element-ui';
Vue.use(ElementUI); 
import 'element-ui/lib/theme-chalk/index.css';
require("@/views/tools/style/element-reset.scss");

/**
 * 
 * @param {*} Root 组件需要插入到哪个dom标签中
 * @param {*} Component 需要引用的组件
 * @param {*} props 传入组件中的参数
 * @returns 
 */
export function create(Root, Component, props) {
  // 借鸡生蛋new Vue({render() {}}),在render中把Component作为根组件
  const vm = new Vue({
    // h是createElement函数，它可以返回虚拟dom
    render(h) {
      console.log(h(Component,{ props }));
      
      // 将Component作为根组件渲染出来
      // h(标签名称或组件配置对象，传递属性、事件等，孩子元素)
      return h(Component, { props })
    }
  }).$mount() // 挂载是为了把虚拟dom变成真实dom
  // 不挂载就没有真实dom
  // 手动追加至body
  // 挂载之后$el可以访问到真实dom
  // document.body.appendChild(vm.$el)
  Root.appendChild(vm.$el)

  console.log(vm.$children);
  
  // 实例
  const comp = vm.$children[0]

  // 淘汰机制
  comp.remove = () => {
    // 删除dom
    // document.body.removeChild(vm.$el)
    Root.removeChild(vm.$el)

    // 销毁组件
    vm.$destroy()
  }

  // 返回Component组件实例
  return comp
}

