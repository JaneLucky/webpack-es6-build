import { LoadZipJson } from "@/utils/LoadJSON.js";
import { SaveModelJsonFile } from "@/api/jsonFiles/index.js";
import { GetModelNameWithUrl } from "@/api/ModelShare.js";
import { CutString } from "@/utils/common.js";
import { GetModelJsonFile } from "./index.js";
export function ModelTree(_Engine, relativePath) {
  let fileName = "ModelTreeList_V1_2";
  let TreeKey = 0;
  // TreeRename(relativePath);
  // return;
  GetModelJsonFile(relativePath, fileName, res => {
    if (res.exist) {
      //上次存储过
      let DataList = JSON.parse(res.data);
      CallBackData(relativePath, DataList);
    } else {
      // 没有存储过
      TreeRename(relativePath);
    }
  });
  function GetTwoCharCenterStr(str) {
    return str.split("][")[1].split("]")[0];
  }

  function CallBackData(path, DataList) {
    let rootmodelsAll = _Engine.scene.children.filter(o => o.name == "rootModel" && o.relativePath === relativePath);
    if (DataList.tree) {
      _Engine.treeData.push(DataList.tree);
      //判断不合规的构件树重新取数据
      if (DataList.tree.Name && DataList.tree.Name.includes("/glbs")) {
        GetModelNameWithUrl(DataList.tree.Name).then(res => {
          let index = _Engine.treeData.findIndex(o => o.Name == path);
          if (index != -1) {
            DataList.tree.Name = res.data.list[0];
          }
        });
      }
    }
    if (DataList.type && DataList.type.length) {
      for (let dataItem of DataList.type) {
        if (dataItem.path === relativePath) {
          let RowItem = JSON.parse(JSON.stringify(dataItem));
          RowItem.ModelIds = [];
          if (dataItem.ModelIds) {
            for (let itemChild of dataItem.ModelIds) {
              for (let rootmodel of rootmodelsAll) {
                if (rootmodel.sortid === itemChild.sortid) {
                  RowItem.ModelIds.push([rootmodel.index, itemChild.childIndex]);
                  break;
                }
              }
            }
          }
          _Engine.treeMapper.push(RowItem);
        }
      }
      setModelType(path);
    }
    if (DataList.level && DataList.level.length) {
      let levelList = [];
      for (let dataItem of DataList.level) {
        if (dataItem.path === relativePath) {
          let RowItem = JSON.parse(JSON.stringify(dataItem));
          RowItem.ModelIds = [];
          if (dataItem.ModelIds) {
            for (let itemChild of dataItem.ModelIds) {
              for (let rootmodel of rootmodelsAll) {
                if (rootmodel.sortid === itemChild.sortid) {
                  RowItem.ModelIds.push([rootmodel.index, itemChild.childIndex]);
                  break;
                }
              }
            }
          }
          levelList.push(RowItem);
        }
      }
      setModelLevel(path, levelList);
    }
    _Engine.UpdateLoadStatus(false, "treeLoaded", relativePath);
  }

  function TreeRename(path) {
    LoadZipJson("file/" + path + "/modelTreeMapping.zip", res => {
      let trees = JSON.parse(res);
      let treedata = {
        Name: path,
        Isleaf: false,
        children: trees,
        path: path,
        key: path + "_" + TreeKey++,
        level: 0
      };
      _Engine.treeData.push(treedata);

      let childnodes = ArrayFlagKey(
        [
          {
            Isleaf: false,
            children: trees
          }
        ],
        path
      );

      GetModelNameWithUrl(path).then(res => {
        let index = _Engine.treeData.findIndex(o => o.Name == path);
        if (index != -1) {
          _Engine.treeData[index].Name = res.data.list[0];
        }
        // if (treedata.Name == null || treedata.Name == "") {
        // 	treedata.Name = path;
        // }
      });

      let allmodels = _Engine.scene.children.map(x => {
        return {
          relativePath: x.relativePath,
          ElementInfos:
            x.ElementInfos == null
              ? null
              : x.ElementInfos.map(o => {
                  return {
                    name: GetTwoCharCenterStr(o.name).toString().replace(" ", "")
                  };
                })
        };
      });

      let levelnodes = [];
      for (let treeItem of trees) {
        let nodeItem = {
          path: path,
          Name: treeItem.Name,
          children: []
        };
        ArrayFlagKey(
          [
            {
              Isleaf: false,
              children: JSON.parse(JSON.stringify(treeItem.children))
            }
          ],
          path,
          false
        ).map(item => {
          item.ModelId = item.ModelId ? item.ModelId : [];
          Array.prototype.splice.apply(nodeItem.children, [nodeItem.children.length, item.ModelId.length].concat(item.ModelId));
        });
        levelnodes.push(nodeItem);
      }

      var data = {
        modelDatas: allmodels,
        treeDatas: childnodes,
        levelDatas: levelnodes
      };
      //去匹配名字
      worker(data, path);
    });
  }
  // 计算模型树同类
  function setModelType(path) {
    let TypeAndLevel;
    let indexType = _Engine.ModelClassify.findIndex(item => item.Path === path);
    if (indexType > -1) {
      TypeAndLevel = _Engine.ModelClassify[indexType];
    } else {
      TypeAndLevel = {
        Path: relativePath, //路径
        SameType: [], // 类型
        SameLevel: [] // 层级
      };
      _Engine.ModelClassify.push(TypeAndLevel);
    }
    if (_Engine.treeMapper && _Engine.treeMapper.length) {
      for (let i = 0; i < _Engine.treeMapper.length; i++) {
        let RowItem = JSON.parse(JSON.stringify(_Engine.treeMapper[i]));
        RowItem.ModelIds = RowItem.ModelIds ? RowItem.ModelIds : [];
        let index = TypeAndLevel.SameType.findIndex(item => item.Name === RowItem.Name);
        if (index > -1) {
          Array.prototype.splice.apply(
            TypeAndLevel.SameType[index].ModelIds,
            [TypeAndLevel.SameType[index].ModelIds.length, RowItem.ModelIds.length].concat(RowItem.ModelIds)
          );
        } else {
          let sameType = {
            Name: RowItem.Name,
            ModelIds: RowItem.ModelIds
          };
          TypeAndLevel.SameType.push(sameType);
        }
      }
    }
  }
  // 计算模型树同层
  function setModelLevel(path, levelnodes) {
    let TypeAndLevel;
    let indexType = _Engine.ModelClassify.findIndex(item => item.Path === path);
    if (indexType > -1) {
      TypeAndLevel = _Engine.ModelClassify[indexType];
    } else {
      TypeAndLevel = {
        Path: relativePath, //路径
        SameType: [], // 类型
        SameLevel: [] // 层级
      };
      _Engine.ModelClassify.push(TypeAndLevel);
    }
    TypeAndLevel.SameLevel = levelnodes;
  }

  function worker(data, path) {
    console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), "构件树映射开始:", data.treeDatas.length);
    var worker = new Worker("bimCDN/js/modeltree.worker.js");
    worker.postMessage(data); //将复杂计算交给子线程,可以理解为给参数让子线程去操作。
    worker.onmessage = function (e) {
      //返回数据进行处理
      let back = e.data;
      let typeList = back.type
        ? back.type.map(item => {
            delete item.ModelId;
            delete item.Isleaf;
            delete item.children;
            return item;
          })
        : [];
      Array.prototype.splice.apply(_Engine.treeMapper, [_Engine.treeMapper.length, typeList.length].concat(typeList));
      setModelType(path);
      let levelList = back.level
        ? back.level.map(item => {
            delete item.children;
            return item;
          })
        : [];
      setModelLevel(path, levelList);

      _Engine.UpdateLoadStatus(false, "treeLoaded", relativePath);

      // 生成保存模型树类型数据
      let JsonTypeInfos = JSON.parse(JSON.stringify(typeList));
      for (let group of JsonTypeInfos) {
        delete group.T_Name;
        group.ModelIds = group.ModelIds
          ? group.ModelIds.map(item => {
              let _item = {
                // url: _Engine.scene.children[item[0]].url,
                // name: _Engine.scene.children[item[0]].ElementInfos[item[1]].name,
                sortid: _Engine.scene.children[item[0]].sortid,
                childIndex: item[1]
              };
              return _item;
            })
          : null;
      }
      // 生成保存模型树层级数据
      let JsonLevelInfos = JSON.parse(JSON.stringify(levelList));
      for (let group of JsonLevelInfos) {
        group.ModelIds = group.ModelIds
          ? group.ModelIds.map(item => {
              let _item = {
                // url: _Engine.scene.children[item[0]].url,
                // name: _Engine.scene.children[item[0]].ElementInfos[item[1]].name,
                sortid: _Engine.scene.children[item[0]].sortid,
                childIndex: item[1]
              };
              return _item;
            })
          : null;
      }
      // 生成保存模型树数据
      let TreeInfosIndex = _Engine.treeData.findIndex(item => item.path == path);
      let JsonTreeInfos = [];
      if (TreeInfosIndex > -1) {
        JsonTreeInfos = JSON.parse(JSON.stringify(_Engine.treeData[TreeInfosIndex]));
      }

      let param = JSON.stringify({
        type: JsonTypeInfos,
        level: JsonLevelInfos,
        tree: JsonTreeInfos
      });
      let JsonArr = CutString(JSON.stringify(param), _Engine.SaveJsonSize);
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
      console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), "构件树映射完成");
      worker.terminate();
      worker = null;
    };
    worker.onerror = function (event) {
      worker.terminate();
      worker = null;
    };
  }

  function ArrayFlagKey(array, path, neeKey = true) {
    let bckArr = [];

    function TreeDiGui(array, name) {
      if (!array || !array.length) return;
      for (let i = 0; i < array.length; i++) {
        if (array[i].Isleaf) {
          neeKey && (array[i].key = path + "_" + TreeKey++);
          array[i].path = path;
          array[i].T_Name = name;
          bckArr.push(array[i]);
        } else {
          neeKey && (array[i].key = path + "_" + TreeKey++);
          array[i].path = path;
          TreeDiGui(array[i].children, array[i].Name);
        }
      }
    }
    TreeDiGui(array, "");
    return bckArr;
  }
}
