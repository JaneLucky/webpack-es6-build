// 模型显隐/高亮等设置
export function HandleModelSelect(list,keyList) {
  let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
  if(list && list.length){
    let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
    for(let selectGroup of list){
      if(selectGroup.children.length && selectGroup.path){
        for (let select of selectGroup.children) {
          let hasSet = false
          for (let rootmodel of rootmodels) {
            if (selectGroup.path === rootmodel.url.match(/\/(\S*)\//)[1] && rootmodel && rootmodel.material.length) {
              for (let model of rootmodel.ElementInfos) {
                if(model.name === select){
                  keyList.map(item=>{
                    switch (item.key) {
                      case 'visible':
                        rootmodel.material[model.dbid].visible = item.val
                        rootmodel.cloneMaterialArray[model.dbid].visible = item.val
                        break;
                      case 'material':
                        let material
                        if(item.val){
                          material = item.val.clone()
                          material.clippingPlanes = rootmodel.material[model.dbid].clippingPlanes
                        }
                        rootmodel.material[model.dbid] = material?material:rootmodel.cloneMaterialArray[model.dbid];
                        break;
                    }
                  })
                  hasSet = true
                  break;
                }
              }
            }
            if(hasSet){
              break;
            }
          }
        }
      }
    }
  }else{
    for (let rootmodel of rootmodels) {
      for (let model of rootmodel.ElementInfos) {
        keyList.map(item=>{
          switch (item.key) {
            case 'visible':
              rootmodel.material[model.dbid].visible = item.val
              rootmodel.cloneMaterialArray[model.dbid].visible = item.val
              break;
            case 'material':
              let material
              if(item.val){
                material = item.val.clone()
                material.clippingPlanes = rootmodel.material[model.dbid].clippingPlanes
              }
              rootmodel.material[model.dbid] = material?material:rootmodel.cloneMaterialArray[model.dbid];
              break;
          }

        })
      }
    }
  }
}

//获得当前选中的单个构建的信息
export function getModelInfoClick(select) {
  let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
  let currentModel;
  //清除上次模型树-选中样式
  if(select && select.name){
    for (let rootmodel of rootmodels) {
      if (rootmodel && rootmodel.material.length) {
        let hasSet = false
        for (let model of rootmodel.ElementInfos) {
          if(model.name === select.name && model.dbid === select.dbid){
            currentModel = rootmodel.material[model.dbid]
            break
          }
        }
        if(hasSet){
          break
        }
      }
    }
  }
  return currentModel
}

