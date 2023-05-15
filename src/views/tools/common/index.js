import { GetTwoCharCenterStr } from "@/utils/regex.js";
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";
//模型交互***************************************************************************************

//通过索引获取包围盒
export function GetBoundingBox_Index(_Engine, list) {
  let rootmodels = _Engine.scene.children;
  var allPointsX = [];
  var allPointsY = [];
  var allPointsZ = [];
  for (let li of list) {
    if (rootmodels[li[0]] == null) {
      continue;
    }
    if (rootmodels[li[0]].ElementInfos[li[1]] == null) {
      continue;
    }
    let point = rootmodels[li[0]].ElementInfos[li[1]].center.clone();
    allPointsX.push(point.x);
    allPointsY.push(point.y);
    allPointsZ.push(point.z);
  }
  allPointsX.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  allPointsY.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  allPointsZ.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  var min = new THREE.Vector3(allPointsX[0], allPointsY[0], allPointsZ[0]);
  var max = new THREE.Vector3(allPointsX[allPointsX.length - 1], allPointsY[allPointsY.length - 1], allPointsZ[allPointsZ.length - 1]);
  var center = min.clone().add(max.clone()).multiplyScalar(0.5);
  return {
    min: min,
    max: max,
    center: center
  };
}

// 获得模型构建的包围矩形
export function GetBoundingBox(_Engine, list, isRequireModel = false) {
  var rootmodels = _Engine.scene.children.filter(o => o.name == "rootModel");
  var allPointsX = [];
  var allPointsY = [];
  var allPointsZ = [];
  if (list) {
    for (let select of list) {
      for (let rootmodel of rootmodels) {
        if (rootmodel && rootmodel.material.length) {
          let hasSet = false;
          for (let model of rootmodel.ElementInfos) {
            if (!isRequireModel && model.name === select) {
              let point = model.center.clone();
              allPointsX.push(point.x);
              allPointsY.push(point.y);
              allPointsZ.push(point.z);
              hasSet = true;
              break;
            } else if (isRequireModel && GetTwoCharCenterStr(model.name)[0] === select) {
              let point = model.center.clone();
              allPointsX.push(point.x);
              allPointsY.push(point.y);
              allPointsZ.push(point.z);
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
  } else {
    for (let rootmodel of rootmodels) {
      for (let model of rootmodel.ElementInfos) {
        let point = model.center.clone();
        allPointsX.push(point.x);
        allPointsY.push(point.y);
        allPointsZ.push(point.z);
      }
    }
  }

  allPointsX.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  allPointsY.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  allPointsZ.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  var min = new THREE.Vector3(allPointsX[0], allPointsY[0], allPointsZ[0]);
  var max = new THREE.Vector3(allPointsX[allPointsX.length - 1], allPointsY[allPointsY.length - 1], allPointsZ[allPointsZ.length - 1]);
  var center = min.clone().add(max.clone()).multiplyScalar(0.5);
  return {
    min: min,
    max: max,
    center: center
  };
}

//世界坐标转屏幕坐标

export function worldPointToScreenPoint(vector3, camera) {
  //计算点在不在相机前面
  let c_dir = new THREE.Vector3();
  let cameraDir = camera.getWorldDirection(c_dir).clone();
  let pointDir = vector3.clone().sub(camera.position.clone());
  let Dir = 1;
  if (cameraDir.clone().dot(pointDir.clone()) < 0) {
    //在相机后面
    Dir = -1;
  }

  const stdVector = vector3.project(camera);
  let width = window.innerWidth,
    height = window.innerHeight;
  let basex = 0,
    basey = 0;
  if (camera.viewport) {
    width = camera.viewport.z;
    height = camera.viewport.w;
    const HEIGHT = window.innerHeight * window.devicePixelRatio;
    basex = camera.viewport.x;
    basey = camera.viewport.y;
  }
  const a = width / 2;
  const b = height / 2;
  const x = Math.round(stdVector.x * a + a);
  const y = Math.round(-stdVector.y * b + b);
  return {
    x: x * Dir,
    y: y * Dir
  };
}

//判断模型是否在屏幕可视区域内
export function IsInScreen(vector3, camera) {
  //先更新相机矩阵位置-否则，相机翻转位置不准
  // let position = vector3.clone();
  // const standardVec = position.project(camera);
  // const centerX = window.innerWidth / 2;
  // const centerY = window.innerHeight / 2;
  // const screenX = Math.round(centerX * standardVec.x + centerX);
  // const screenY = Math.round(-centerY * standardVec.y + centerY);
  // if (screenX > 0 && screenX < window.innerWidth && screenY > 0 && screenY < window.innerHeight) {
  // 	return true;
  // }
  // return true;

  // camera.updateMatrix();
  // camera.updateMatrixWorld();
  let flag = true;
  let position = vector3.clone();
  let tempV = position.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
  if (Math.abs(tempV.x) > 1 || Math.abs(tempV.y) > 1 || Math.abs(tempV.z) > 1) {
    flag = false;
  }
  return flag;
}

import "./iconfont.js";
//创建svg图标
export function CreateSvg(name) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/SvgIcon.scss");
  let svgns = "http://www.w3.org/2000/svg";
  let xlinkns = "http://www.w3.org/1999/xlink";
  let icon = document.createElementNS(svgns, "svg");
  icon.setAttribute("aria-hidden", true);
  icon.setAttribute("class", "Svg-Icon");
  let use = document.createElementNS(svgns, "use");
  use.setAttributeNS(xlinkns, "href", "#" + name);
  icon.appendChild(use);
  return icon;
}

import { CheckModelFileExists } from "@/api/jsonFiles/index.js";
import { LoadZipJson } from "@/utils/LoadJSON.js";
export function GetModelJsonFile(relativePath, fileName, callback) {
  let count = 0;
  let total = 1;
  let AllJsonString = "";
  let GetAllModelJsonFile = async () => {
    let getJsonItem = async (item, exist) => {
      return new Promise((resolve, reject) => {
        if (exist) {
          LoadZipJson("file/" + relativePath + "/" + fileName + "_" + item + ".zip", res => {
            let data = JSON.parse(res);
            total = data.total;
            resolve({
              exist: true,
              data: data.data
            });
          });
        } else {
          CheckModelFileExists({
            fileName: fileName + "_" + item,
            jsonData: "",
            path: relativePath
          }).then(res => {
            if (res.data.result) {
              //上次存储过
              LoadZipJson("file/" + relativePath + "/" + fileName + "_" + item + ".zip", res => {
                let data = JSON.parse(res);
                if (data.total && data.data) {
                  total = data.total;
                  resolve({
                    exist: true,
                    data: data.data
                  });
                } else {
                  resolve({
                    exist: false,
                    data: ""
                  });
                }
              });
            } else {
              // 没有存储过
              resolve({
                exist: false,
                data: ""
              });
            }
          });
        }
      });
    };
    //for循环调接口
    for (let i = 0; i < total; i++) {
      const result = await getJsonItem(i + 1, i > 0);
      if (result.exist) {
        //存在
        count = i + 1;
        AllJsonString = AllJsonString.concat(result.data);
        if (count === total) {
          callback({
            exist: true,
            data: JSON.parse(AllJsonString)
          });
        }
      } else {
        //不存在
        callback({
          exist: false,
          data: ""
        });
        break;
      }
    }
  };
  GetAllModelJsonFile();
}

export function CalcItemEdge(item) {
  let edges = new THREE.EdgesGeometry(item.geometry, 89);
  let matrix = item.matrix;
  if (!item.geometry.index && item.rotation && item.position) {
    matrix = matrix.makeRotationFromEuler(item.rotation);
    matrix.setPosition(item.position);
  }
  edges.applyMatrix4(item.matrix);
  return Array.from(edges.attributes.position.array);
}

export function GetPathEdgeList(_Engine, relativePath) {
  console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), "边线加载开始");
  var rootmodels = _Engine.scene.children.filter(o => o.name == "rootModel" && o.relativePath === relativePath);
  for (let rootmodel of rootmodels) {
    rootmodel.EdgeList = [];
    if (rootmodel.TypeName == "Mesh") {
      for (let j = 0; j < rootmodel.ElementInfos.length; j++) {
        if (
          !rootmodel.ElementInfos[j].ignoreEdge &&
          rootmodel.ElementInfos[j].name.indexOf("管件") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("管道附件") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("喷头") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("机械设备") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("风道末端") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("风管附件") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("风管管件") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("火警设备") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("通讯设备") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("电气设备") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("照明设备") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("安全设备") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("卫浴设备") === -1
        ) {
          let eleInfo = {
            geometry: rootmodel.meshs[j].geometry,
            matrix: rootmodel.meshs[j].matrix.clone(),
            rotation: rootmodel.meshs[j].rotation,
            position: rootmodel.meshs[j].position
          };
          let ItemEdgeList = CalcItemEdge(eleInfo);
          rootmodel.ElementInfos[j].EdgeInfo = {
            startIndex: rootmodel.EdgeList.length,
            endIndex: rootmodel.EdgeList.length + ItemEdgeList.length - 1,
            list: ItemEdgeList
          };
          Array.prototype.splice.apply(rootmodel.EdgeList, [rootmodel.EdgeList.length, ItemEdgeList.length].concat(ItemEdgeList));
        }
      }
    } else if (rootmodel.TypeName == "InstancedMesh") {
      for (let j = 0; j < rootmodel.ElementInfos.length; j++) {
        if (
          !rootmodel.ignoreEdge &&
          rootmodel.ElementInfos[j].name.indexOf("管件") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("管道附件") === -1 &&
          rootmodel.ElementInfos[j].name.indexOf("喷头") === -1
        ) {
          let matrixArray = rootmodel.cloneInstanceMatrix.slice(
            rootmodel.ElementInfos[j].dbid * 16,
            (rootmodel.ElementInfos[j].dbid + 1) * 16
          );
          let matrixI = new THREE.Matrix4();
          matrixI.elements = matrixArray;
          let eleInfo = {
            geometry: rootmodel.meshs.geometry,
            matrix: matrixI
          };
          let ItemEdgeList = CalcItemEdge(eleInfo);
          rootmodel.ElementInfos[j].EdgeInfo = {
            startIndex: rootmodel.EdgeList.length,
            endIndex: rootmodel.EdgeList.length + ItemEdgeList.length - 1,
            list: ItemEdgeList
          };
          Array.prototype.splice.apply(rootmodel.EdgeList, [rootmodel.EdgeList.length, ItemEdgeList.length].concat(ItemEdgeList));
        }
      }
    } else if (rootmodel.TypeName == "InstancedMesh-Pipe" && rootmodel.PipeType !== "Circle") {
      for (let j = 0; j < rootmodel.ElementInfos.length; j++) {
        let matrixArray = rootmodel.cloneInstanceMatrix.slice(
          rootmodel.ElementInfos[j].dbid * 16,
          (rootmodel.ElementInfos[j].dbid + 1) * 16
        );
        let matrixI = new THREE.Matrix4();
        matrixI.elements = matrixArray;
        let eleInfo = {
          geometry: rootmodel.geometry,
          matrix: matrixI
        };
        let ItemEdgeList = CalcItemEdge(eleInfo);
        rootmodel.ElementInfos[j].EdgeInfo = {
          startIndex: rootmodel.EdgeList.length,
          endIndex: rootmodel.EdgeList.length + ItemEdgeList.length - 1,
          list: ItemEdgeList
        };
        Array.prototype.splice.apply(rootmodel.EdgeList, [rootmodel.EdgeList.length, ItemEdgeList.length].concat(ItemEdgeList));
      }
    }
  }
  console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), "边线加载完成");
}
