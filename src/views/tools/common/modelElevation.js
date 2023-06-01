import { LoadJSON } from "@/utils/LoadJSON.js";
/**
 * 获取模型标高
 * @param {*} _Engine 引擎对象
 * @param {*} relativePath 模型路径
 */
export function GetModelElevation(_Engine) {
  //加载模型
  for (let i = 0; i < _Engine.ElevationList.length; i++) {
    let index = _Engine.treeData.findIndex(item => item.path === _Engine.ElevationList[i].path);
    let treeItem = index > -1 ? _Engine.treeData[index] : null;
    if (treeItem) {
      _Engine.ElevationList[i].label = treeItem && treeItem.Name ? treeItem.Name : _Engine.ElevationList[i].path;
    }
    if (!_Engine.ElevationList[i].load) {
      _Engine.ElevationList[i].load = true;
      LoadJSON("file/" + _Engine.ElevationList[i].path + "/" + "level.json", res => {
        let data = res ? JSON.parse(res) : null;
        let children = data && data.length ? data : [];
        _Engine.ElevationList[i].children = children.map(item => {
          item.label = item.Name;
          item.value = item.Id;
          return item;
        });
      });
    }
  }
  console.log(_Engine.ElevationList);
}
