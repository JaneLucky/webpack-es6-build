import { SaveModelJsonFile } from "@/api/jsonFiles/index.js";
import { CutString } from "@/utils/common.js";
import { GetModelJsonFile } from "./index.js";
export function GetModelEdges(_Engine, relativePath) {
  let worker;
  let modelsList;
  let size = 500;
  let count = 0;
  for (let i = 0; i < _Engine.scene.children.length; i++) {
    _Engine.scene.children[i].index = i;
  }
  let rootmodels = _Engine.scene.children;
  let rootmodelsAll = _Engine.scene.children.filter(o => o.name == "rootModel" && o.relativePath === relativePath);
  let fileName = "ModelEdgeList";
  if (rootmodelsAll && rootmodelsAll.length) {
    // calculateEdgeList();
    // return;
    GetModelJsonFile(relativePath, fileName, res => {
      if (res.exist) {
        //上次存储过
        let DataList = res.data;
        if (DataList && DataList.length) {
          for (let element of DataList) {
            for (let rootmodel of rootmodelsAll) {
              if (rootmodel.sortid === element.sortid) {
                element.Indexs = rootmodel.index;
                break;
              }
            }
          }
          _Engine.AllEdgeList.push(...DataList);
        }
        _Engine.UpdateLoadStatus(false, "edgeLoaded", relativePath);
      } else {
        // 没有存储过
        calculateEdgeList();
      }
    });
  } else {
    _Engine.UpdateLoadStatus(false, "edgeLoaded", relativePath);
  }

  // webworker计算边线
  function calculateEdgeList() {
    console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), "边线计算开始");

    //计算边线-并存储，用于测量捕捉
    getModelList();

    function getModelList() {
      modelsList = [];
      let i = count;
      if (rootmodelsAll[i]) {
        if (rootmodelsAll[i].TypeName == "InstancedMesh") {
          for (let j = 0; j < rootmodelsAll[i].ElementInfos.length; j++) {
            if (
              !rootmodelsAll[i].ElementInfos[j].ignoreEdge &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("管件") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("管道附件") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("喷头") === -1
            ) {
              let ele;
              ele = {
                TypeName: rootmodelsAll[i].TypeName,
                indexes: [rootmodelsAll[i].index, j],
                geometry: Array.from(rootmodelsAll[i].meshs.geometry.attributes.position.array),
                indexA: Array.from(rootmodelsAll[i].meshs.geometry.index.array),
                matrix: Array.from(rootmodelsAll[i].cloneInstanceMatrix.slice(j * 16, (j + 1) * 16))
              };
              modelsList.push(ele);
            }
          }
        } else if (rootmodelsAll[i].TypeName == "Mesh" || rootmodelsAll[i].TypeName == "Mesh-Structure") {
          for (let j = 0; j < rootmodelsAll[i].ElementInfos.length; j++) {
            if (
              !rootmodelsAll[i].ElementInfos[j].ignoreEdge &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("管件") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("管道附件") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("喷头") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("机械设备") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("风道末端") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("风管附件") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("风管管件") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("火警设备") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("通讯设备") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("电气设备") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("照明设备") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("安全设备") === -1 &&
              rootmodelsAll[i].ElementInfos[j].name.indexOf("卫浴设备") === -1
            ) {
              let ele;
              if (rootmodelsAll[i].meshs[j].geometry.index) {
                ele = {
                  TypeName: rootmodelsAll[i].TypeName,
                  indexes: [rootmodelsAll[i].index, j],
                  geometry: Array.from(rootmodelsAll[i].meshs[j].geometry.attributes.position.array),
                  indexA: rootmodelsAll[i].meshs[j].geometry.index ? Array.from(rootmodelsAll[i].meshs[j].geometry.index.array) : null,
                  matrix: Array.from(rootmodelsAll[i].meshs[j].matrix.elements)
                };
              } else {
                ele = {
                  TypeName: rootmodelsAll[i].TypeName,
                  indexes: [rootmodelsAll[i].index, j],
                  geometry: Array.from(rootmodelsAll[i].meshs[j].geometry.attributes.position.array),
                  position: {
                    x: rootmodelsAll[i].meshs[j].position.x,
                    y: rootmodelsAll[i].meshs[j].position.y,
                    z: rootmodelsAll[i].meshs[j].position.z
                  },
                  rotation: {
                    x: rootmodelsAll[i].meshs[j].rotation._x,
                    y: rootmodelsAll[i].meshs[j].rotation._y,
                    z: rootmodelsAll[i].meshs[j].rotation._z,
                    order: rootmodelsAll[i].meshs[j].rotation._order
                  },
                  matrix: Array.from(rootmodelsAll[i].meshs[j].matrix.elements)
                };
              }
              modelsList.push(ele);
            }
          }
        } else if (rootmodelsAll[i].TypeName == "InstancedMesh-Pipe") {
          if (rootmodelsAll[i].PipeType !== "Circle") {
            for (let j = 0; j < rootmodelsAll[i].ElementInfos.length; j++) {
              let ele = {
                TypeName: rootmodelsAll[i].TypeName,
                indexes: [rootmodelsAll[i].index, j],
                geometry: Array.from(rootmodelsAll[i].geometry.attributes.position.array),
                matrix: Array.from(rootmodelsAll[i].instanceMatrix.array.slice(j * 16, (j + 1) * 16)),
                PipeType: rootmodelsAll[i].PipeType
              };
              modelsList.push(ele);
            }
          }
        }
        // 计算边线开始
        if (modelsList) {
          if (!worker) {
            worker = new Worker("static/js/edge.worker.js");
          }
          worker.postMessage({
            data: modelsList,
            lastOne: rootmodelsAll.length - 1 === count
          });
          worker.onmessage = function (e) {
            let backList = e.data;
            // console.log(backList)
            if (backList && backList.length) {
              let positions = [];
              let ElementInfos = [];
              for (let i = 0; i < backList.length; i++) {
                let Infos = {
                  index: backList[i].indexes[1],
                  startIndex: positions.length,
                  endIndex: positions.length + backList[i].EdgeList.length - 1,
                  EdgeList: backList[i].EdgeList
                };
                ElementInfos.push(Infos);
                Array.prototype.splice.apply(positions, [positions.length, backList[i].EdgeList.length].concat(backList[i].EdgeList));
              }
              _Engine.AllEdgeList.push({
                Indexs: backList[0].indexes[0],
                ElementInfos: ElementInfos,
                path: relativePath,
                sortid: rootmodels[backList[0].indexes[0]].sortid
              });
            }

            count = count + 1;
            // console.log("完成" + count + "个Mesh边线计算");
            getModelList();
            if (rootmodelsAll.length === count) {
              worker && worker.terminate();
              worker = null;
              _Engine.UpdateLoadStatus(false, "edgeLoaded", relativePath);
              console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), "边线计算完成");
              let pathList = [];
              _Engine.AllEdgeList.map(item => {
                if (item.path === relativePath) {
                  delete item.path;
                  pathList.push(item);
                }
                return item;
              });
              let JsonArr = CutString(JSON.stringify(pathList), 10000000);
              for (let n = 0; n < JsonArr.length; n++) {
                if (JsonArr[n].length) {
                  SaveModelJsonFile({
                    fileName: fileName + "_" + (n + 1),
                    jsonData: JSON.stringify({
                      total: JsonArr.length,
                      data: JsonArr[n]
                    }),
                    path: relativePath
                  })
                    .then(res => {
                      // console.log(res)
                    })
                    .catch(() => {});
                }
              }
            }
          };
          worker.onerror = function (event) {
            worker.terminate();
            worker = null;
          };
        }
      }
    }
  }
}
