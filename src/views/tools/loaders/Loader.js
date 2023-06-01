const THREE = require("@/three/three.js");
import { LoadZipJson } from "@/utils/LoadJSON.js";
import * as BufferGeometryUtils from "@/three/utils/BufferGeometryUtils.js";
import { StringSort } from "@/utils/common.js";
export function LoadGLB(_Engine, Scene, relativePath, basePath, path, option, callback) {
  _Engine.GLTFLoader.load(
    path,
    gltf => {
      gltf.scene.scale.set(1, 1, 1); //  设置模型大小缩放
      var models = StringSort(gltf.scene.children);
      let allMeshs = [];
      for (let model of models) {
        if (model.type === "Group") {
          if (model.children && model.children.length) {
            for (let i = 0; i < model.children.length; i++) {
              let child = model.children[i];
              child.userData = model.userData;
              //整体增加一个偏移
              if (option.off != null) {
                var T = new THREE.Matrix4().makeTranslation(option.off.split(",")[0], option.off.split(",")[2], option.off.split(",")[1]);
                var C = new THREE.Matrix4();
                C.multiplyMatrices(child.matrix, T);
                child.matrix = C;
              }
              allMeshs.push(child);
            }
          }
        } else if (model.type === "Mesh") {
          //整体增加一个偏移
          if (option.off != null) {
            var T = new THREE.Matrix4().makeTranslation(option.off.split(",")[0], option.off.split(",")[2], option.off.split(",")[1]);
            var C = new THREE.Matrix4();
            C.multiplyMatrices(model.matrix, T);
            model.matrix = C;
          }
          allMeshs.push(model);
        }
      }
      if (!allMeshs.length) {
        callback(null);
        return;
      }
      if (option == null) {
        Scene.add(gltf.scene);
        // mergeBufferModel(Scene, allMeshs);
      }
      if (option && option.name === "modelList") {
        for (var i = 0; i < allMeshs.length; i++) {
          var mesh = allMeshs[i];
          if (option.position != null && option.position.Point != null) {
            if (!(option.position.Point.X == 0 && option.position.Point.Y == 0 && option.position.Point.Z == 0)) {
              //平移
              mesh.matrix.elements[12] = mesh.matrix.elements[12] + option.position.Point.X * 0.3048;
              mesh.matrix.elements[13] = mesh.matrix.elements[13] + option.position.Point.Z * 0.3048;
              mesh.matrix.elements[14] = mesh.matrix.elements[14] + -option.position.Point.Y * 0.3048;
              //旋转
              mesh.rotation.y = option.position.angle_a;
            }
          }
        }
        mergeBufferModel(Scene, allMeshs);
      } else if (option && option.name === "instanceList") {
        let instanceMeshs = [];
        let instanceModels = [];

        for (let item of option.children) {
          for (var i = 0; i < allMeshs.length; i++) {
            if (item.meshId === allMeshs[i].userData.name) {
              //设置为双边显示材质
              allMeshs[i].material.side = THREE.DoubleSide;
              a(0);
              a(1);
              a(2);
              a(3);

              function a(Mirrored) {
                let _childs = null;
                if (Mirrored == 0) {
                  _childs = new THREE.InstancedMesh(allMeshs[i].geometry.clone(), allMeshs[i].material, item.children.length);
                } else if (Mirrored == 1 || Mirrored == 3) {
                  //facing
                  if (item.children[0].FacingDir != null) {
                    var vec = new THREE.Vector3(item.children[0].FacingDir.X, 0, -item.children[0].FacingDir.Y);
                    var m = new THREE.Matrix4();
                    m.set(
                      1 - 2 * vec.x * vec.x,
                      -2 * vec.x * vec.y,
                      -2 * vec.x * vec.z,
                      0,
                      -2 * vec.x * vec.y,
                      1 - 2 * vec.y * vec.y,
                      -2 * vec.y * vec.z,
                      0,
                      -2 * vec.x * vec.z,
                      -2 * vec.y * vec.z,
                      1 - 2 * vec.z * vec.z,
                      0,
                      0,
                      0,
                      0,
                      1
                    );
                    let geo = allMeshs[i].geometry.clone().applyMatrix4(m);
                    geo.verticesNeedUpdate = true;
                    geo.normalsNeedUpdate = true;
                    geo.computeBoundingSphere();
                    geo.computeFaceNormals();
                    geo.computeVertexNormals();
                    _childs = new THREE.InstancedMesh(geo, allMeshs[i].material, item.children.length);
                  }
                } else if (Mirrored == 2) {
                  if (item.children[0].handleDir != null) {
                    var vec = new THREE.Vector3(item.children[0].handleDir.X, 0, -item.children[0].handleDir.Y);
                    var m = new THREE.Matrix4();
                    m.set(
                      1 - 2 * vec.x * vec.x,
                      -2 * vec.x * vec.y,
                      -2 * vec.x * vec.z,
                      0,
                      -2 * vec.x * vec.y,
                      1 - 2 * vec.y * vec.y,
                      -2 * vec.y * vec.z,
                      0,
                      -2 * vec.x * vec.z,
                      -2 * vec.y * vec.z,
                      1 - 2 * vec.z * vec.z,
                      0,
                      0,
                      0,
                      0,
                      1
                    );
                    let geo = allMeshs[i].geometry.clone().applyMatrix4(m);
                    geo.verticesNeedUpdate = true;
                    geo.normalsNeedUpdate = true;
                    geo.computeBoundingSphere();
                    geo.computeFaceNormals();
                    geo.computeVertexNormals();
                    _childs = new THREE.InstancedMesh(geo, allMeshs[i].material, item.children.length);
                  }
                }
                if (_childs == null) {
                  return;
                }
                //非镜像模型
                let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
                window.color = new THREE.Color();
                let chis = item.children.filter(o => o.Mirrored == Mirrored);

                for (var j = 0; j < chis.length; j++) {
                  //平移
                  let child = chis[j];
                  let matrix = new THREE.Matrix4();
                  if (child.Mirrored != Mirrored) {
                    continue;
                  }
                  if (Mirrored == 2) {
                    matrix = matrix.clone().makeRotationY(child.angle_a + Math.PI);
                  } else if (Mirrored == 1) {
                    matrix = matrix.clone().makeRotationY(child.angle_a);
                  } else if (Mirrored == 3) {
                    matrix = matrix.clone().makeRotationY(child.angle_a);
                  } else {
                    matrix = matrix.clone().makeRotationY(child.angle_a);
                  }
                  matrix.elements[12] = allMeshs[i].matrix.elements[12] + child.Point.X * 0.3048;
                  matrix.elements[13] = allMeshs[i].matrix.elements[13] + child.Point.Z * 0.3048;
                  matrix.elements[14] = allMeshs[i].matrix.elements[14] + -child.Point.Y * 0.3048;

                  _childs.setMatrixAt(j, matrix);
                  _childs.setColorAt(j, window.color);

                  let _min = _childs.geometry.boundingBox.min.clone().applyMatrix4(matrix.clone());
                  let _max = _childs.geometry.boundingBox.max.clone().applyMatrix4(matrix.clone());
                  let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math.min(_min.z, _max.z));
                  let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math.max(_min.z, _max.z));
                  let center = min.clone().add(max.clone()).multiplyScalar(0.5);
                  _childs.geometry.groups.push({});

                  ElementInfoArray.push({
                    name: child.name,
                    min: min,
                    max: max,
                    center: center,
                    dbid: j,
                    url: path,
                    matrix: matrix,
                    basePath: basePath,
                    relativePath: relativePath,
                    materialName: allMeshs[i].material.name,
                    ignoreEdge: allMeshs[i].geometry.attributes.position.array.length > _Engine.EdgeIgnoreSize
                  });
                }
                if (ElementInfoArray.length != 0) {
                  _childs.ElementInfos = ElementInfoArray;
                  _childs.name = "rootModel";
                  _childs.TypeName = "InstancedMesh";
                  _childs.MeshId = item.meshId;
                  _childs.cloneMaterialArray = allMeshs[i].material.clone();
                  _childs.originalMaterial = allMeshs[i].material.clone();
                  _childs.basePath = basePath;
                  _childs.relativePath = relativePath;
                  let copyMeshs = [];
                  copyMeshs = {
                    geometry: allMeshs[i].geometry,
                    matrix: allMeshs[i].matrix,
                    position: allMeshs[i].position,
                    rotation: allMeshs[i].rotation
                  };
                  _childs.meshs = copyMeshs; //allMeshs[i]
                  _childs.url = path;
                  // _childs.cloneInstanceColor = Array.from(_childs.instanceColor.array)
                  _childs.cloneInstanceMatrix = Array.from(_childs.instanceMatrix.array);
                  // Scene.add(_childs);
                  _childs.sortid = item.meshId + "_" + allMeshs[i].material.name;
                  instanceModels.push(_childs);
                  // instanceMeshs.push(_childs)
                  // break
                }
              }
            }
          }
        }
        //数量少的instance直接合并成mesh
        {
          let meshs = [];
          let instancemeshs = [];
          for (var ii = 0; ii < instanceModels.length; ii++) {
            var m = instanceModels[ii];
            if (m.ElementInfos.length < 200) {
              let geos = [];
              let infos = [];
              for (var jj = 0; jj < m.ElementInfos.length; jj++) {
                let geo = m.meshs.geometry.clone().applyMatrix4(m.ElementInfos[jj].matrix.clone());
                geos.push(geo);
                delete m.ElementInfos[jj].matrix;
                infos.push(m.ElementInfos[jj]);
              }
              meshs.push({
                material: m.material,
                ElementInfos: infos,
                geos: geos
              });
            } else {
              m.material = m.material.clone();
              m.ElementInfos.map(item => {
                delete item.matrix;
                return item;
              });
              instancemeshs.push(m);
            }
          }
          mergeBufferInstanceModel(Scene, meshs);
          instancemeshs.forEach(o => {
            Scene.add(o);
          });
        }
      }
      callback(gltf);
    },
    xhr => {
      // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    error => {
      // console.error(error)
    }
  );
  //合并实例模型
  function mergeBufferInstanceModel(Scene, meshs) {
    var mats = [];
    for (var mesh of meshs) {
      var index = mats.findIndex(o => o.name == mesh.material.name);
      if (index == -1) {
        mats.push(mesh.material);
      }
    }
    for (var mat of mats) {
      var m_objs = meshs.filter(o => o.material.name == mat.name);
      //然后把所有的网格泠出来
      var gs = [];
      var infos = [];
      for (var m of m_objs) {
        m.geos.forEach(o => {
          gs.push(o);
        });
        m.ElementInfos.forEach(o => {
          infos.push(o);
        });
      }
      var geos_ = splitArray(gs, 2000);
      var infos_ = splitArray(infos, 2000);
      for (var kk = 0; kk < geos_.length; kk++) {
        var gs_ = geos_[kk];
        var ins_ = infos_[kk];
        var ms_ = [];
        let copyMeshs = [];
        for (var jj = 0; jj < gs_.length; jj++) {
          let m = new THREE.Mesh(gs_[jj], mat);
          ins_[jj].dbid = jj;
          ms_.push(m);
          copyMeshs.push({
            geometry: m.geometry,
            matrix: m.matrix,
            position: m.position,
            rotation: m.rotation
          });
        }

        const mergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(gs_, true);
        const singleMergeMesh = new THREE.Mesh(mergedGeometries, mat);
        singleMergeMesh.ElementInfos = ins_;
        singleMergeMesh.cloneMaterialArray = mat.clone();
        singleMergeMesh.originalMaterial = mat.clone();
        singleMergeMesh.name = "rootModel";
        singleMergeMesh.TypeName = "Mesh";
        singleMergeMesh.meshs = copyMeshs; //ms_
        singleMergeMesh.url = path;
        singleMergeMesh.basePath = basePath;
        singleMergeMesh.relativePath = relativePath;
        singleMergeMesh.sortid = path + "_" + kk + "_" + mat.name;
        Scene.add(singleMergeMesh);
        // debugger
      }
    }
  }
  //拆分模型
  function splitArray(arr, n) {
    const result = [];
    for (let i = 0; i < arr.length; i += n) {
      result.push(arr.slice(i, i + n));
    }
    return result;
  }
  //合并模型
  function mergeBufferModel(Scene, meshs) {
    var mats = [];
    for (var mesh of meshs) {
      var index = mats.findIndex(o => o.name == mesh.material.name);
      if (index == -1) {
        mats.push(mesh.material);
      }
    }
    for (var mat of mats) {
      var ms = meshs.filter(o => o.material.name == mat.name);
      var meshs_ = splitArray(ms, 2000);
      for (var ms_ of meshs_) {
        mergeBufferModel_(Scene, ms_, mat.name);
      }
    }
  }

  function mergeBufferModel_(Scene, meshs, m_name) {
    let geometryArray = []; // 将你的要合并的多个geometry放入到该数组
    let materialArray = []; // 将你的要赋值的多个material放入到该数组
    let cloneMaterialArray = []; // 将你的要赋值的多个material放入到该数组
    let ElementInfoArray = []; // 将你的要赋值的多个material放入到该数组
    let scene = _Engine.scene;
    let copyMeshs = [];
    //对mesh位置进行偏移
    for (var o of meshs) {
      if (o.geometry != null && o.matrix != null) {
        let matrixWorldGeometry = o.geometry.clone().applyMatrix4(o.matrix.clone());

        o.material.side = THREE.DoubleSide;

        geometryArray.push(matrixWorldGeometry);
        materialArray.push(o.material);
        cloneMaterialArray.push(o.material.clone());
        let _min = o.geometry.boundingBox.min.clone().applyMatrix4(o.matrix.clone());
        let _max = o.geometry.boundingBox.max.clone().applyMatrix4(o.matrix.clone());
        let min = new THREE.Vector3(Math.min(_min.x, _max.x), Math.min(_min.y, _max.y), Math.min(_min.z, _max.z));
        let max = new THREE.Vector3(Math.max(_min.x, _max.x), Math.max(_min.y, _max.y), Math.max(_min.z, _max.z));
        let center = min.clone().add(max.clone()).multiplyScalar(0.5);

        ElementInfoArray.push({
          name: o.userData.name,
          min: min,
          max: max,
          center: center,
          dbid: ElementInfoArray.length,
          basePath: basePath,
          relativePath: relativePath,
          materialName: o.material.name,
          ignoreEdge: o.geometry.attributes.position.array.length > _Engine.EdgeIgnoreSize
        });
      }
      copyMeshs.push({
        geometry: o.geometry,
        matrix: o.matrix,
        position: o.position,
        rotation: o.rotation
      });
    }

    //加载模型
    const mergedGeometries = THREE.BufferGeometryUtils.mergeBufferGeometries(geometryArray, true);
    const singleMergeMesh = new THREE.Mesh(mergedGeometries, materialArray[0]);
    singleMergeMesh.ElementInfos = ElementInfoArray;
    singleMergeMesh.cloneMaterialArray = cloneMaterialArray[0];
    singleMergeMesh.originalMaterial = cloneMaterialArray[0].clone();
    singleMergeMesh.name = "rootModel";
    singleMergeMesh.TypeName = "Mesh";
    singleMergeMesh.meshs = copyMeshs; //meshs
    singleMergeMesh.url = path;
    singleMergeMesh.basePath = basePath;
    singleMergeMesh.relativePath = relativePath;
    singleMergeMesh.sortid = path + "_" + m_name;
    Scene.add(singleMergeMesh);
  }
}

//批量加载glb模型，json - 大量相同模型合并
export function LoadGlbJsonList(_Engine, Scene, relativePath, path = "/file/gis/fl/bim/100004", option, callback) {
  let loadCompleteSize = 0;
  LoadZipJson(path + "/modelList.zip", res => {
    let glbList = JSON.parse(res);
    // glbList = [];
    if (glbList && glbList.length) {
      let currentIndex = 0;
      let loadsAll = async () => {
        let getGLB = item => {
          return new Promise((resolve, reject) => {
            option.Point = item.Point;
            option.Rotate = item.angle_a;
            LoadGLB(
              _Engine,
              Scene,
              relativePath,
              path,
              item.fullPath,
              {
                name: "modelList",
                position: option,
                off: option.off
              },
              gltf => {
                currentIndex = currentIndex + 1;
                if (currentIndex == 1) {
                }
                //全部加载完成，然后去合并模型
                if (currentIndex == glbList.length) {
                  loadCompleteSize = loadCompleteSize + 1;
                  // console.log('1111111111111')
                  AllModelLoadComplated();
                }

                resolve(gltf);
              }
            );
          });
        };
        //for循环调接口
        for (let i = 0; i < glbList.length; i++) {
          glbList[i].fullPath = path + "/" + glbList[i].category + ".glb";
          const result = await getGLB(glbList[i]);
        }
      };
      loadsAll();
    } else {
      loadCompleteSize = loadCompleteSize + 1;
      AllModelLoadComplated();
    }
  });
  let currentIndex = 0;
  LoadZipJson(path + "/instanceList.zip", res => {
    let glbList = JSON.parse(res);
    // glbList = [];
    if (glbList && glbList.length) {
      let loadsAll = async () => {
        let getGLB = item => {
          return new Promise((resolve, reject) => {
            LoadGLB(
              _Engine,
              Scene,
              relativePath,
              path,
              item.fullPath,
              {
                name: "instanceList",
                children: item.children,
                off: option.off
              },
              gltf => {
                currentIndex = currentIndex + 1;
                if (currentIndex == 1) {
                  // _Engine.ViewCube.cameraGoHome();
                }
                //全部加载完成，然后去合并模型
                if (currentIndex == glbList.length) {
                  loadCompleteSize = loadCompleteSize + 1;
                  // console.log('222222222222222')
                  AllModelLoadComplated();
                }

                resolve(gltf);
              }
            );
          });
        };
        //for循环调接口
        for (let i = 0; i < glbList.length; i++) {
          glbList[i].fullPath = path + "/" + glbList[i].category + ".glb";
          const result = await getGLB(glbList[i]);
        }
      };
      loadsAll();
    } else {
      loadCompleteSize = loadCompleteSize + 1;
      AllModelLoadComplated();
    }
  });

  function AllModelLoadComplated() {
    // ModelOctree(_Engine, path);
    // return
    //同一个目录下的模型加载完成
    if (loadCompleteSize == 2) {
      _Engine.doneModels.push(path);
      callback();
    }
  }
}

export function CreateHighLightGroup(scene) {
  let HighLightGroupList = scene.children.filter(o => o.name == "HighLightGroup");
  let HighLightGroup = HighLightGroupList[0];
  if (!HighLightGroup) {
    HighLightGroup = new THREE.Group();
    HighLightGroup.name = "HighLightGroup";
    scene.add(HighLightGroup);
  }
}
