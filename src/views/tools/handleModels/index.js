import { GetTwoCharCenterStr } from "@/utils/regex.js"

// 模型显隐/高亮等设置-模型加载返回的构建列表
export function HandleModelSelect(list,keyList) {
  let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
  if(list && list.length){
    let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
    for(let selectGroup of list){
      if(selectGroup.TypeName === "InstancedMesh"){
        for(let select of selectGroup.children){
          var siblingMeshs = rootmodels.filter(x => x.MeshId == select.name && selectGroup.path == x.url.match(/\/(\S*)\//)[1]);
          keyList.map(item=>{
            switch (item.key) {
              case 'visible':
                for (let sibling of siblingMeshs) {
                  var  matrixArray = [];
                  matrixArray = sibling.instanceMatrix.array.slice(select.instanceId * 16, (select.instanceId+1) * 16);
                  
                  let matrix = new THREE.Matrix4();
                  matrix.elements = matrixArray;
                  matrix.elements[0] = item.val?1:0
                  matrix.elements[5] =item.val?1:0
                  matrix.elements[10] = item.val?1:0 
                  sibling.setMatrixAt(select.instanceId, matrix); 
                  sibling.instanceMatrix.needsUpdate = true;
                }
                break;
              case 'material':
                let color
                if(item.val){
                  color = new THREE.Color(0.375, 0.63, 1)
                }else{
                  color = new THREE.Color(1, 1, 1)
                }
                for (let sibling of siblingMeshs) {
                  if(select.instanceId){
                    sibling.getColorAt(select.instanceId, window.color);
                    sibling.setColorAt(select.instanceId, color);
                    sibling.instanceColor.needsUpdate = true;
                  }else{
                    for(let i=0;i<sibling.material.length;i++){
                      sibling.material[i].color = new THREE.Color(1, 1, 1);
                    }
                  }
                }
                break;
            }
          })
        }
      }else if(selectGroup.TypeName === "Mesh" || selectGroup.TypeName === "PipeMesh"){
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
    }
  }else{
    for (let rootmodel of rootmodels) {
      if(rootmodel.TypeName === "InstancedMesh"){
        // console.log(rootmodel)
        keyList.map(item=>{
          switch (item.key) {
            case 'visible':
              var  matrixArray = [];
              matrixArray = rootmodel.instanceMatrix.array;
              let num = item.val?1:0; 
              matrixArray = matrixArray.map((item,index)=>{
                let show=item
                let indent = (index+1)%16
                if(indent === 1 || indent===6 || indent===11){
                  show = num 
                }
                return show
              })
              for(let i=0;i<rootmodel.ElementInfos.length;i++){
                let c_matrixArray = matrixArray.slice(i * 16, (i+1) * 16);
                let matrix = new THREE.Matrix4();
                matrix.elements = c_matrixArray;
                rootmodel.setMatrixAt(i, matrix);
              }
              rootmodel.instanceMatrix.needsUpdate = true;
              break;
            case 'material':
              // let material
              // if(item.val){
              //   material = item.val.clone()
              //   material.clippingPlanes = rootmodel.material[model.dbid].clippingPlanes
              // }
              // rootmodel.material[model.dbid] = material?material:rootmodel.cloneMaterialArray[model.dbid];
              break;
          }
        })

      }else if(rootmodel.TypeName === "Mesh" || rootmodel.TypeName === "PipeMesh"){
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
}

//获得当前选中的单个构建的信息
export function getModelInfoClick(select) {
  let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
  let currentModel = {
    material:null,
    meshMaterial:null,
    cloneMaterial:null,
    modelType:null
  };
  //清除上次模型树-选中样式
  if(select && select.name){
    if(select.TypeName === "InstancedMesh"){
      for (let rootmodel of rootmodels) {
        if (rootmodel && rootmodel.MeshId == select.name && select.glb == rootmodel.url) {
          currentModel.meshMaterial = rootmodel.material
          currentModel.cloneMaterial = rootmodel.cloneMaterialArray
          currentModel.modelType = "InstancedMesh"
          break;
        }
      }
    }else if(select.TypeName === "Mesh" || select.TypeName === "PipeMesh"){
      for (let rootmodel of rootmodels) {
        if (rootmodel && rootmodel.material.length) {
          let hasSet = false
          for (let model of rootmodel.ElementInfos) {
            if(model.name === select.name && model.dbid === select.dbid){
              // currentModel = rootmodel.material[model.dbid] //改变当前选中的构建
              // currentModel = rootmodel.meshs[model.dbid].material //改变当前选中的构建相同材质的所有构建
              
              currentModel.material = rootmodel.material[model.dbid]
              currentModel.meshMaterial = rootmodel.meshs[model.dbid].material
              currentModel.cloneMaterial = rootmodel.cloneMaterialArray[model.dbid] //改变当前选中的构建
              currentModel.cloneMaterialArray = rootmodel.cloneMaterialArray //改变当前选中的构建,
              currentModel.modelType = "Mesh"
              break
            }
          }
          if(hasSet){
            break
          }
        }
      }
    }
  }
  return currentModel
}


//模型显隐/高亮设置-调用接口返回的构建列表
export function HandleRequestModelSelect(list,keyList) {
  if(list && list.length){
    let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
    for(let group of list){
      var siblingMeshs = rootmodels.filter(x => x.basePath.indexOf(group.path) != -1);
      for(let itemName of group.children){
        let hasSet = false
        for(let sibling of siblingMeshs){
          for (let model of sibling.ElementInfos) {
            if(GetTwoCharCenterStr(model.name)[0] === itemName){
                if(sibling.TypeName === "InstancedMesh"){
                  keyList.map(item=>{
                    switch (item.key) {
                      case 'visible':
                          var  matrixArray = [];
                          matrixArray = sibling.instanceMatrix.array.slice(model.dbid * 16, (model.dbid+1) * 16);
                          
                          let matrix = new THREE.Matrix4();
                          matrix.elements = matrixArray;
                          matrix.elements[0] = item.val?1:0
                          matrix.elements[5] =item.val?1:0
                          matrix.elements[10] = item.val?1:0 
                          sibling.setMatrixAt(model.dbid, matrix); 
                          sibling.instanceMatrix.needsUpdate = true;
                        break;
                      case 'material':
                        let color
                        if(item.val){
                          color = new THREE.Color(0.375, 0.63, 1)
                        }else{
                          color = new THREE.Color(1, 1, 1)
                        }
                        if(model.dbid){
                          sibling.getColorAt(model.dbid, window.color);
                          sibling.setColorAt(model.dbid, color);
                          sibling.instanceColor.needsUpdate = true;
                        }else{
                          for(let i=0;i<sibling.material.length;i++){
                            sibling.material[i].color = new THREE.Color(1, 1, 1);
                          }
                        }
                        break;
                    }
                  })
                }else if(sibling.TypeName === "Mesh" || sibling.TypeName === "PipeMesh"){
                  if(model.dbid && sibling.material[model.dbid]){
                    keyList.map(item=>{
                      switch (item.key) {
                        case 'visible':
                          sibling.material[model.dbid].visible = item.val
                          sibling.cloneMaterialArray[model.dbid].visible = item.val
                          break;
                        case 'material':
                          let material
                          if(item.val){
                            material = item.val.clone()
                            material.clippingPlanes = sibling.material[model.dbid].clippingPlanes
                          }
                          sibling.material[model.dbid] = material?material:sibling.cloneMaterialArray[model.dbid];
                          break;
                      }
                    })
                  }
                }
              hasSet = true
              break
            }
          }
          if(hasSet){
            break
          }
        }
      }
    }
  }
}
