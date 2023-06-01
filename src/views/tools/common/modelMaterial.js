import { LoadJSON } from "@/utils/LoadJSON.js";
import { UpdateMaterialAttribute } from "@/views/tools/modelCreator/UpdateMaterial.js";
export function ResetModelMaterial(_Engine, url, path) {
  LoadJSON(url + "/materialMapList.json", result => {
    //加载模型材质映射列表
    if (result) {
      let list = JSON.parse(result);
      list = list.map(item => {
        if (item.mapList && item.mapList.length) {
          item.mapList.map(map => {
            if (map.Param) {
              map.Param = JSON.parse(map.Param);
            }
            return map;
          });
        }
        return item;
      });
      let MapList = list.filter(item => item.path == path);
      let materialList = MapList && MapList.length ? (MapList[0].mapList && MapList[0].mapList.length ? MapList[0].mapList : []) : [];
      console.log(materialList);
      let rootmodels = _Engine.scene.children.filter(o => o.name == "rootModel" && o.basePath == url);
      for (let material of materialList) {
        rootmodels.map(rootmodel => {
          if (rootmodel.material.name == material.materialName && material.Param) {
            UpdateMaterialAttribute(rootmodel.material, material.Param);
            rootmodel.material.materialMap = {
              Id: material.materialId,
              Name: material.Param.name,
              Img: material.Img,
              Param: material.Param
            };
            UpdateMaterialAttribute(rootmodel.cloneMaterialArray, material.Param);
            rootmodel.cloneMaterialArray.materialMap = {
              Id: material.materialId,
              Name: material.Param.name,
              Img: material.Img,
              Param: material.Param
            };
            rootmodel.material.needsUpdate = true;
            rootmodel.cloneMaterialArray.needsUpdate = true;
            window.bimEngine.RenderUpdate();
          }
        });
      }
    }
  });
}
