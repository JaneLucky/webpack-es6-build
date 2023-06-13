import { GetTwoCharCenterStr, GetRgbaColorNum } from "@/utils/regex.js";

// 模型显隐/高亮等设置-模型加载返回的构建列表
export function HandleModelSelect(_Engine, list, keyList) {
  // 高亮模型统一材质
  let color = new THREE.Color(0.375, 0.63, 1);
  const meshMaterial = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.4,
    depthTest: false
  });
  const LineMaterial = new THREE.LineBasicMaterial({
    color,
    depthTest: false
  });

  let rootmodels = _Engine.scene.children.filter(o => o.name == "rootModel");
  let HighLightGroupList = _Engine.scene.children.filter(o => o.name == "HighLightGroup");
  let HighLightGroup = HighLightGroupList[0];
  if (list && list.length) {
    let rootmodels = _Engine.scene.children.filter(o => o.name == "rootModel");
    for (let selectGroup of list) {
      if (selectGroup.TypeName === "InstancedMesh" || selectGroup.TypeName == "InstancedMesh-Pipe") {
        for (let select of selectGroup.children) {
          var siblingMeshs = rootmodels.filter(x => x.MeshId == select.name && selectGroup.path == x.url);
          keyList.map(item => {
            switch (item.key) {
              case "visible":
                for (let sibling of siblingMeshs) {
                  var matrixArray;
                  if (item.val) {
                    matrixArray = sibling.cloneInstanceMatrix.slice(select.instanceId * 16, (select.instanceId + 1) * 16);
                  } else {
                    matrixArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                  }
                  let matrix = new THREE.Matrix4();
                  matrix.elements = matrixArray;
                  sibling.setMatrixAt(select.instanceId, matrix);
                  sibling.instanceMatrix.needsUpdate = true;
                }
                if (HighLightGroup) {
                  for (const group of HighLightGroup.children) {
                    if (select.instanceId === group.ElementInfos.dbid && select.name === group.ElementInfos.name) {
                      group.visible = item.val;
                      break;
                    }
                  }
                }
                break;
              case "material":
                if (item.val) {
                  const group = new THREE.Group();
                  group.ElementInfos = {
                    TypeName: selectGroup.TypeName,
                    dbid: select.instanceId,
                    name: select.name,
                    basePath: select.basePath,
                    relativePath: select.relativePath
                  };
                  for (let sibling of siblingMeshs) {
                    let arr = sibling.instanceMatrix.array.slice(select.instanceId * 16, (select.instanceId + 1) * 16);
                    let matrix = new THREE.Matrix4();
                    matrix.elements = arr;

                    let groupMeshLine = CreateHighLightMesh(sibling.geometry, matrix, meshMaterial, LineMaterial);
                    let mesh = groupMeshLine.mesh;
                    let line = groupMeshLine.line;
                    group.add(mesh, line);

                    HighLightGroup.add(group);
                    // break
                  }
                  break;
                } else {
                  for (const group of HighLightGroup.children) {
                    if (select.instanceId === group.ElementInfos.dbid && select.name === group.ElementInfos.name) {
                      HighLightGroup.remove(group);
                    }
                  }
                }
                break;
            }
          });
        }
      } else if (selectGroup.TypeName === "Mesh" || selectGroup.TypeName === "PipeMesh") {
        if (selectGroup.children.length && selectGroup.path) {
          for (let select of selectGroup.children) {
            let hasSet = false;
            for (let rootmodel of rootmodels) {
              if (selectGroup.path === rootmodel.url && rootmodel && rootmodel.material.length) {
                for (let model of rootmodel.ElementInfos) {
                  if (model.name === select) {
                    keyList.map(item => {
                      switch (item.key) {
                        case "visible":
                          rootmodel.material[model.dbid] = rootmodel.cloneMaterialArray[model.dbid].clone();
                          rootmodel.material[model.dbid].visible = item.val;
                          rootmodel.cloneMaterialArray[model.dbid].visible = item.val;
                          if (HighLightGroup) {
                            for (const group of HighLightGroup.children) {
                              if (model.dbid === group.ElementInfos.dbid && model.name === group.ElementInfos.name) {
                                group.visible = item.val;
                                break;
                              }
                            }
                          }
                          break;
                        case "material":
                          if (item.val) {
                            rootmodel.material[model.dbid] = rootmodel.cloneMaterialArray[model.dbid].clone();
                            // 重新创建透明高亮模型
                            let meshSelect = rootmodel.meshs[model.dbid];
                            const group = new THREE.Group();
                            group.ElementInfos = {
                              TypeName: selectGroup.TypeName,
                              dbid: model.dbid,
                              name: model.name,
                              basePath: model.basePath,
                              relativePath: model.relativePath
                            };
                            let groupMeshLine = CreateHighLightMesh(meshSelect.geometry, meshSelect.matrix, meshMaterial, LineMaterial);
                            let mesh = groupMeshLine.mesh;
                            let line = groupMeshLine.line;

                            let rotationX = isNaN(meshSelect.rotation.x) ? 0 : meshSelect.rotation.x;
                            let rotationY = isNaN(meshSelect.rotation.y) ? 0 : meshSelect.rotation.y;
                            let rotationZ = isNaN(meshSelect.rotation.z) ? 0 : meshSelect.rotation.z;
                            let positionX = isNaN(meshSelect.position.x) ? 0 : meshSelect.position.x;
                            let positionY = isNaN(meshSelect.position.y) ? 0 : meshSelect.position.y;
                            let positionZ = isNaN(meshSelect.position.z) ? 0 : meshSelect.position.z;
                            if (!(rotationX == 0 && rotationY == 0 && rotationZ == 0)) {
                              line.rotation._order = "YXZ";
                              mesh.rotation.set(rotationX, rotationY, rotationZ);
                              line.rotation.set(rotationX, rotationY, rotationZ);
                            }
                            if (!(positionX == 0 && positionY == 0 && positionZ == 0)) {
                              mesh.position.set(positionX, positionY, positionZ);
                              line.position.set(positionX, positionY, positionZ);
                            }

                            group.add(mesh, line);
                            HighLightGroup.add(group);
                            break;
                          } else {
                            for (const group of HighLightGroup.children) {
                              if (model.dbid === group.ElementInfos.dbid && model.name === group.ElementInfos.name) {
                                HighLightGroup.remove(group);
                              }
                            }
                          }
                          break;
                      }
                    });
                    // hasSet = true
                    // break;
                  }
                }
                hasSet = true;
              }
              if (hasSet) {
                break;
              }
            }
          }
        }
      }
    }
  } else {
    for (let rootmodel of rootmodels) {
      if (rootmodel.TypeName === "InstancedMesh" || rootmodel.TypeName === "InstancedMesh-Pipe") {
        // console.log(rootmodel)
        keyList.map(item => {
          switch (item.key) {
            case "visible":
              var matrixArray = [];
              let array32;
              if (item.val) {
                array32 = new Float32Array(rootmodel.cloneInstanceMatrix);
              } else {
                matrixArray = Array.from(rootmodel.instanceMatrix.array);
                for (let i = 0; i < matrixArray.length; i++) {
                  matrixArray[i] = 0;
                }
                array32 = new Float32Array(matrixArray);
              }
              rootmodel.instanceMatrix.array = new Float32Array(array32);
              rootmodel.instanceMatrix.needsUpdate = true;
              break;
            case "material":
              // let material
              // if(item.val){
              //   material = item.val.clone()
              //   material.clippingPlanes = rootmodel.material[model.dbid].clippingPlanes
              // }
              // rootmodel.material[model.dbid] = material?material:rootmodel.cloneMaterialArray[model.dbid];
              break;
          }
        });
      } else if (rootmodel.TypeName === "Mesh" || rootmodel.TypeName === "PipeMesh") {
        for (let model of rootmodel.ElementInfos) {
          keyList.map(item => {
            switch (item.key) {
              case "visible":
                rootmodel.material[model.dbid].visible = item.val;
                rootmodel.cloneMaterialArray[model.dbid].visible = item.val;
                break;
              case "material":
                let material;
                if (item.val) {
                  material = item.val.clone();
                  material.clippingPlanes = rootmodel.material[model.dbid].clippingPlanes;
                }
                rootmodel.material[model.dbid] = material ? material : rootmodel.cloneMaterialArray[model.dbid];
                break;
            }
          });
        }
      }
    }
    //显隐自创的高亮模型
    if (HighLightGroup) {
      keyList.map(item => {
        switch (item.key) {
          case "visible":
            if (HighLightGroup) {
              for (const group of HighLightGroup.children) {
                group.visible = item.val;
              }
            }
            break;
          case "material":
            break;
        }
      });
    }
  }
}

//获得当前选中的单个构建的信息
export function getModelInfoClick(_Engine, select) {
  let rootmodels = _Engine.scene.children;
  let selectModelList = [];
  let rootmodel = rootmodels[select.indexs[0]];
  // let currentModel = {
  //   meshMaterial: null,
  //   cloneMaterial: null,
  //   modelType: null,
  //   indexs: select.indexs
  // };
  // currentModel.meshMaterial = rootmodel.material;
  // currentModel.cloneMaterial = rootmodel.cloneMaterialArray;
  // currentModel.modelType = select.TypeName;
  // selectModelList.push(currentModel);
  let sameMaterialModel = rootmodels.filter(
    o => o.name == "rootModel" && o.basePath == rootmodel.basePath && o.material.name == rootmodel.material.name
  );
  sameMaterialModel.map(item => {
    let currentModel = {
      meshMaterial: null,
      cloneMaterial: null,
      modelType: null,
      indexs: select.indexs
    };
    currentModel.meshMaterial = item.material;
    currentModel.cloneMaterial = item.cloneMaterialArray;
    currentModel.originalMaterial = item.originalMaterial;
    currentModel.path = item.url.substring(0, item.url.lastIndexOf("/"));
    currentModel.modelType = select.TypeName;
    selectModelList.push(currentModel);
  });
  return selectModelList;
}
//拆分数组
function splitArray(arr, n) {
  const result = [];
  for (let i = 0; i < arr.length; i += n) {
    result.push(arr.slice(i, i + n));
  }
  return result;
}
export function HandleRequestModelSelect_(_Engine, list, visible) {
  var sliceList = splitArray(list, 10000);
  sliceList.forEach(x => {
    HandleRequestModelSelect_slice(_Engine, x, visible);
    _Engine.RenderUpdate();
    console.log("操作模型显隐");
  });
}
export function HandleRequestModelSelect_slice(_Engine, list, visible) {
  let HighLightGroupList = _Engine.scene.children.filter(o => o.name == "HighLightGroup");
  let HighLightGroup = HighLightGroupList[0];
  let models = _Engine.scene.children;

  for (let i = 0; i < list.length; i++) {
    let model = models[list[i][0]];
    if (model == null) {
      continue;
    }

    if (model.instanceMatrix == null && model.geometry != null && model.geometry.groups[list[i][1]] != null) {
      //普通模型
      model.geometry.groups[list[i][1]].visibility = visible;
      handleHighlightModels(list[i], visible);
      if (visible == true) {
        model.visible = true;
        if (model.geometry.index != null) {
          var arrays = model.geometry.index.array;
          var start = model.geometry.groups[list[i][1]].start;
          var end = start + model.geometry.groups[list[i][1]].count;
          if (model.geometry.hides == null) {
            model.geometry.hides = [];
          }
          for (var ar = start; ar < end; ar++) {
            if (model.geometry.hides[ar] != null) {
              arrays[ar] = model.geometry.hides[ar];
            }
          }
          model.geometry.index.needsUpdate = true;
          model.geometry.index.needsUpdate = false;
        } else {
          var arrays = model.geometry.attributes.position.array;
          var start = model.geometry.groups[list[i][1]].start * 3;
          var end = start + model.geometry.groups[list[i][1]].count * 3;
          if (model.geometry.hides == null) {
            model.geometry.hides = [];
          }
          for (var ar = start; ar < end; ar++) {
            if (arrays[ar] == 0) {
              arrays[ar] = model.geometry.hides[ar];
            }
          }
          model.geometry.attributes.position.needsUpdate = true;
          model.geometry.attributes.position.needsUpdate = false;
        }
      } else {
        if (model.geometry.index != null) {
          var arrays = model.geometry.index.array;
          var start = model.geometry.groups[list[i][1]].start;
          var end = start + model.geometry.groups[list[i][1]].count;
          if (model.geometry.hides == null) {
            model.geometry.hides = [];
          }
          for (var ar = start; ar < end; ar++) {
            if (arrays[ar] != -1) {
              model.geometry.hides[ar] = arrays[ar];
              arrays[ar] = -1;
            }
          }
          model.geometry.index.needsUpdate = true;
          model.geometry.index.needsUpdate = false;
        } else {
          var arrays = model.geometry.attributes.position.array;
          var start = model.geometry.groups[list[i][1]].start * 3;
          var end = start + model.geometry.groups[list[i][1]].count * 3;
          if (model.geometry.hides == null) {
            model.geometry.hides = [];
          }
          for (var ar = start; ar < end; ar++) {
            if (arrays[ar] != 0) {
              model.geometry.hides[ar] = arrays[ar];
              arrays[ar] = 0;
            }
          }
          model.geometry.attributes.position.needsUpdate = true;
          model.geometry.attributes.position.needsUpdate = false;
        }
      }
    } else if (model.instanceMatrix != null) {
      if (visible == true) {
        //显示
        var matrixArray = model.cloneInstanceMatrix.slice(list[i][1] * 16, (list[i][1] + 1) * 16);
        let matrix = new THREE.Matrix4();
        matrix.elements = matrixArray;
        model.setMatrixAt(list[i][1], matrix);
        model.instanceMatrix.needsUpdate = true;
        model.instanceMatrix.needsUpdate = false;
        model.visible = true;
      } else {
        //隐藏
        let matrix = new THREE.Matrix4();
        matrix = matrix.clone().makeScale(0, 0, 0);
        model.setMatrixAt(list[i][1], matrix);
        model.instanceMatrix.needsUpdate = true;
        model.instanceMatrix.needsUpdate = false;
      }
      handleHighlightModels(list[i], visible);
    }
  }
  handleEdgeModels(list, visible);

  // 处理边线的得模型显隐
  function handleEdgeModels(list, visible) {
    // debugger
    let ModelEdgesList = _Engine.scene.children.filter(o => o.name == "ModelEdges" && o.visible);
    if (ModelEdgesList && ModelEdgesList.length) {
      let groupList = [];
      for (let k = 0; k < list.length; k++) {
        let index = groupList.findIndex(item => item.index === list[k][0]);
        if (index < 0) {
          let group = {
            index: list[k][0],
            children: [list[k][1]]
          };
          groupList.push(group);
        } else {
          groupList[index].children.push(list[k][1]);
        }
      }
      for (let i = 0; i < groupList.length; i++) {
        let ModelEdge = ModelEdgesList.filter(item => item.indexO == groupList[i].index)[0];
        if (ModelEdge) {
          let ModelEdgesChild = ModelEdge.ElementInfos;
          if (ModelEdgesChild && ModelEdgesChild.length) {
            let positions = Array.from(ModelEdge.geometry.getAttribute("position").array);
            for (let j = 0; j < groupList[i].children.length; j++) {
              let Edge = ModelEdge.ElementInfos.filter(item => item.index == groupList[i].children[j])[0];
              if (Edge) {
                let addPos = visible ? Edge.EdgeList : new Array(Edge.EdgeList.length).fill(0);
                Array.prototype.splice.apply(positions, [Edge.startIndex, Edge.EdgeList.length].concat(addPos));
              }
            }
            ModelEdge.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
          }
        }
      }
    }
  }

  // 处理用于亮显得模型显隐
  function handleHighlightModels(indexes, visible) {
    if (HighLightGroup) {
      for (const group of HighLightGroup.children) {
        if (group.indexs[0] === indexes[0] && group.indexs[1] === indexes[1]) {
          group.visible = visible;
          break;
        }
      }
    }
  }
  _Engine.RenderUpdate();
}

// 模型亮显
export function HandleHighlightModelSelect_(_Engine, list, highlight, color) {
  let HighLightGroupList = _Engine.scene.children.filter(o => o.name == "HighLightGroup");
  let HighLightGroup = HighLightGroupList[0];
  HighLightGroup.children = [];
  _Engine.RenderUpdate();
  var sliceList = splitArray(list, 10000);
  sliceList.forEach(x => {
    HandleHighlightModelSelect_slice(_Engine, x, highlight, color);
    _Engine.RenderUpdate();
    console.log("操作模型显隐");
  });
}
export function HandleHighlightModelSelect_slice(_Engine, list, highlight, color) {
  // let color = new THREE.Color(0.375, 0.63, 1)
  let meshColor = new THREE.Color(0.375, 0.63, 1);
  let opacity = 0.6;
  if (highlight && color) {
    let colorList = GetRgbaColorNum(color);
    if (colorList && colorList.length === 4) {
      meshColor = new THREE.Color(colorList[0] / 255, colorList[1] / 255, colorList[2] / 255);
      opacity = colorList[3];
    }
  }
  const meshMaterial = new THREE.MeshBasicMaterial({
    color: meshColor,
    transparent: true,
    opacity: opacity,
    depthTest: false
  });
  const LineMaterial = new THREE.LineBasicMaterial({
    color: meshColor,
    depthTest: false
  });
  let HighLightGroupList = _Engine.scene.children.filter(o => o.name == "HighLightGroup");
  let HighLightGroup = HighLightGroupList[0];
  let models = _Engine.scene.children;
  // _Engine.treeMapper.map(item=>{
  // 	list = item.ModelIds?[...list, ...item.ModelIds]:list
  // })

  for (let i = 0; i < list.length; i++) {
    let model = models[list[i][0]];
    if (model == null) {
      continue;
    }
    if (model.instanceMatrix == null && model.geometry != null && model.geometry.groups[list[i][1]] != null) {
      // 普通模型
      if (highlight) {
        let meshSelect = model.meshs[list[i][1]];
        const group = new THREE.Group();
        group.indexs = list[i];
        let groupMeshLine = CreateHighLightMesh(meshSelect.geometry, meshSelect.matrix, meshMaterial, LineMaterial);
        let mesh = groupMeshLine.mesh;
        // let line = groupMeshLine.line

        let rotationX = isNaN(meshSelect.rotation.x) ? 0 : meshSelect.rotation.x;
        let rotationY = isNaN(meshSelect.rotation.y) ? 0 : meshSelect.rotation.y;
        let rotationZ = isNaN(meshSelect.rotation.z) ? 0 : meshSelect.rotation.z;
        let positionX = isNaN(meshSelect.position.x) ? 0 : meshSelect.position.x;
        let positionY = isNaN(meshSelect.position.y) ? 0 : meshSelect.position.y;
        let positionZ = isNaN(meshSelect.position.z) ? 0 : meshSelect.position.z;
        if (!(rotationX == 0 && rotationY == 0 && rotationZ == 0)) {
          mesh.rotation._order = "YXZ";
          mesh.rotation.set(rotationX, rotationY, rotationZ);
          // line.rotation.set(rotationX, rotationY, rotationZ);
        }
        if (!(positionX == 0 && positionY == 0 && positionZ == 0)) {
          mesh.position.set(positionX, positionY, positionZ);
          // line.position.set(positionX, positionY, positionZ);
        }
        mesh.material.clippingPlanes = model.material.clippingPlanes;
        group.add(mesh);
        HighLightGroup.add(group);
      } else {
        for (const group of HighLightGroup.children) {
          if (group.indexs == list[i]) {
            HighLightGroup.remove(group);
          }
        }
      }
    } else if (model.instanceMatrix != null) {
      // instanceMesh合并模型
      if (highlight == true) {
        const group = new THREE.Group();
        group.indexs = list[i];
        var matrixArray = model.cloneInstanceMatrix.slice(list[i][1] * 16, (list[i][1] + 1) * 16);
        let matrix = new THREE.Matrix4();
        matrix.elements = matrixArray;
        let groupMeshLine = CreateHighLightMesh(model.geometry, matrix, meshMaterial, LineMaterial);
        let mesh = groupMeshLine.mesh;
        // let line = groupMeshLine.line
        mesh.material.clippingPlanes = model.material.clippingPlanes;
        group.add(mesh);
        HighLightGroup.add(group);
      } else {
        for (const group of HighLightGroup.children) {
          if (group.indexs == list[i]) {
            HighLightGroup.remove(group);
          }
        }
      }
    }
  }
  _Engine.RenderUpdate();
}

//模型显隐/高亮设置-调用接口返回的构建列表
export function HandleRequestModelSelect(_Engine, list, keyList) {
  if (list && list.length) {
    let rootmodels = _Engine.scene.children.filter(o => o.name == "rootModel");
    for (let group of list) {
      var siblingMeshs = rootmodels.filter(x => x.basePath.indexOf(group.path) != -1);
      for (let itemName of group.children) {
        let hasSet = false;
        for (let sibling of siblingMeshs) {
          for (let model of sibling.ElementInfos) {
            const namestr = GetTwoCharCenterStr(model.name)[0];
            if (namestr === itemName) {
              if (sibling.TypeName === "InstancedMesh" || sibling.TypeName === "InstancedMesh-Pipe") {
                keyList.map(item => {
                  switch (item.key) {
                    case "visible":
                      var matrixArray = [];
                      matrixArray = sibling.instanceMatrix.array.slice(model.dbid * 16, (model.dbid + 1) * 16);

                      let matrix = new THREE.Matrix4();
                      matrix.elements = matrixArray;
                      matrix.elements[0] = item.val ? 1 : 0;
                      matrix.elements[5] = item.val ? 1 : 0;
                      matrix.elements[10] = item.val ? 1 : 0;
                      sibling.setMatrixAt(model.dbid, matrix);
                      sibling.instanceMatrix.needsUpdate = true;
                      break;
                    case "material":
                      let color;
                      if (item.val) {
                        color = new THREE.Color(0.375, 0.63, 1);
                      } else {
                        color = new THREE.Color(1, 1, 1);
                      }
                      if (model.dbid) {
                        sibling.getColorAt(model.dbid, window.color);
                        sibling.setColorAt(model.dbid, color);
                        sibling.instanceColor.needsUpdate = true;
                      } else {
                        for (let i = 0; i < sibling.material.length; i++) {
                          sibling.material[i].color = new THREE.Color(1, 1, 1);
                        }
                      }
                      break;
                  }
                });
              } else if (sibling.TypeName === "Mesh" || sibling.TypeName === "PipeMesh") {
                if (model.dbid && sibling.material[model.dbid]) {
                  keyList.map(item => {
                    switch (item.key) {
                      case "visible":
                        sibling.material[model.dbid].visible = item.val;
                        sibling.cloneMaterialArray[model.dbid].visible = item.val;
                        break;
                      case "material":
                        let material;
                        if (item.val) {
                          material = item.val.clone();
                          material.clippingPlanes = sibling.material[model.dbid].clippingPlanes;
                        }
                        sibling.material[model.dbid] = material ? material : sibling.cloneMaterialArray[model.dbid];
                        break;
                    }
                  });
                }
              }
              hasSet = true;
              break;
            }
          }
          if (hasSet) {
            break;
          }
        }
      }
    }
  }
}

export function CreateHighLightMesh(geometry, matrix, meshMaterial, LineMaterial) {
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.applyMatrix4(matrix);
  // const edges = new THREE.EdgesGeometry(geometry, 89); //大于89度才添加线条 ,减少线条绘制
  // const line = new THREE.LineSegments(edges, LineMaterial);
  // line.applyMatrix4(matrix);
  mesh.TypeName = "HighLightGroup-MeshLine";
  // line.TypeName = "HighLightGroup-MeshLine"
  return {
    mesh
    // line
  };
}

export function GetSelectModelsWithModelKey(_Engine) {
  let ModelKeyList = [];
  for (const selectModel of _Engine.SelectedModelIndexs) {
    let model = _Engine.scene.children[selectModel[0]].ElementInfos[selectModel[1]];
    let indexPath = ModelKeyList.findIndex(item => item.modelId === model.relativePath);
    let modelName = GetTwoCharCenterStr(model.name).toString().replace(" ", "");
    if (indexPath === -1) {
      ModelKeyList.push({
        modelId: model.relativePath,
        ModelKey: model.relativePath,
        ModelIds: [modelName]
      });
    } else {
      ModelKeyList[indexPath].ModelIds.push(modelName);
    }
  }
  return ModelKeyList;
}

export function SetModelSelectionWithModelKey(_Engine, list) {
  let ModelKeyList = [];
  for (let groupItem of list) {
    let rootmodels = _Engine.scene.children.filter(o => o.name == "rootModel" && o.relativePath == groupItem.modelId);
    for (let itemM of groupItem.ModelIds) {
      let hasSet = false;
      for (let sibling of rootmodels) {
        if (hasSet) {
          break;
        }
        for (let model of sibling.ElementInfos) {
          if (hasSet) {
            break;
          }
          let modelName = GetTwoCharCenterStr(model.name).toString().replace(" ", "");
          if (modelName === itemM) {
            ModelKeyList.push([sibling.index, model.dbid]);
            hasSet = true;
          }
        }
      }
    }
  }
  return ModelKeyList;
}
