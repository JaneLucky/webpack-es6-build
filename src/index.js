import { BIMEngine } from '@/views/tools/BIMEngine.js';
//你可以通过'需要向window挂载的变量名'来调用本函数(构造函数名称)
console.log(`引入格式:import '自定义名称一般用(webpack.config.js中output.library的名称)',{'工具函数中导出的名字'} from '包名称';\n
<srcipt src='路径'></script>\n
例:import happycookie,{hc} from 'happycookie'`);

//测试高级的js语法是否已经成了ES5语法
// export default {//这个格式不要改！
//   BIMEngine
// };

export default BIMEngine