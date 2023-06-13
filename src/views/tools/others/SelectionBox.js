const THREE = require("@/three/three.js");
import "@/three/interactive/SelectionBox.js";
import "@/three/interactive/SelectionHelper.js";
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";
export function selectBox(_Engine) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/selectBox.scss");
  var _selectBox = new Object();
  _selectBox.isActive = false; //框选是否激活
  var scene = _Engine.scene;
  var camera = _Engine.scene.camera;
  var renderer = _Engine.scene.renderer;
  var controls = _Engine.scene.controls;
  let helper,
    selectionBox,
    rootmodels = [];
  let HighLightGroup;
  let start = false;
  //激活
  _selectBox.Active = function () {
    _selectBox.isActive = true;
    rootmodels = scene.children.filter(o => o.name == "rootModel");
    let HighLightGroupList = _Engine.scene.children.filter(o => o.name == "HighLightGroup");
    HighLightGroup = HighLightGroupList[0];
    for (let rootmodel of rootmodels) {
      for (let model of rootmodel.ElementInfos) {
        //屏幕坐标
        let screenCenter = model.center.clone();
        let vector = screenCenter.project(camera);
        let halfWidth = scene.renderer.domElement.clientWidth / 2,
          halfHeight = scene.renderer.domElement.clientHeight / 2;
        let screenPosition = {
          x: Math.round(vector.x * halfWidth + halfWidth),
          y: Math.round(-vector.y * halfHeight + halfHeight)
        };
        model.screenPosition = screenPosition;
      }
    }
    helper = new THREE.SelectionHelper(renderer, "selectBox");
    selectionBox = resetSelectionBox();
    controls.enabled = false;
    renderer.domElement.addEventListener("pointerdown", onPointerDown, false);

    renderer.domElement.addEventListener("pointermove", onPointerMove, false);

    renderer.domElement.addEventListener("pointerup", onPointerUp, false);
  };
  _selectBox.DisActive = function () {
    _selectBox.isActive = false;
    controls.enabled = true;
    renderer.domElement.removeEventListener("pointerdown", onPointerDown);
    renderer.domElement.removeEventListener("pointermove", onPointerMove);
    renderer.domElement.removeEventListener("pointerup", onPointerUp);
    helper && ((helper.element = null), (helper = null));
  };

  function onPointerDown(event) {
    if (event.button === 0) {
      start = true;
      _Engine.UpdateRender();
      if (HighLightGroup) {
        for (const group of HighLightGroup.children) {
          HighLightGroup.children = [];
        }
      }
      selectionBox = resetSelectionBox();
      selectionBox.startPoint = {
        x: event.clientX - camera.viewport.x,
        y: event.clientY - camera.viewport.y
      };
    }
  }

  function onPointerMove(event) {
    if (start) {
      _Engine.UpdateRender();
      if (helper.isDown) {
        selectionBox.endPoint = {
          x: event.clientX - camera.viewport.x,
          y: event.clientY - camera.viewport.y
        };
      }
    }
  }

  function onPointerUp(event) {
    if (event.button === 0) {
      _Engine.UpdateRender();
      selectionBox.endPoint = {
        x: event.clientX - camera.viewport.x,
        y: event.clientY - camera.viewport.y
      };
      getSelect(true);
      start = false;
    }
  }

  //重置SelectionBox
  function resetSelectionBox() {
    return {
      startPoint: null,
      endPoint: null
    };
  }

  //获得选中的构建
  function getSelect(saveForSelect = false) {
    if (selectionBox.startPoint && selectionBox.endPoint) {
      let startPoint = {
        x: 0,
        y: 0
      };
      let endPoint = {
        x: 0,
        y: 0
      };
      if (selectionBox.startPoint.x >= selectionBox.endPoint.x) {
        startPoint.x = selectionBox.endPoint.x;
        endPoint.x = selectionBox.startPoint.x;
      } else {
        startPoint.x = selectionBox.startPoint.x;
        endPoint.x = selectionBox.endPoint.x;
      }
      if (selectionBox.startPoint.y >= selectionBox.endPoint.y) {
        startPoint.y = selectionBox.endPoint.y;
        endPoint.y = selectionBox.startPoint.y;
      } else {
        startPoint.y = selectionBox.startPoint.y;
        endPoint.y = selectionBox.endPoint.y;
      }
      if (saveForSelect && Math.abs(startPoint.x - endPoint.x) > 2 && Math.abs(startPoint.y - endPoint.y) > 2) {
        let BeforeSelection = [];
        for (let rootmodel of rootmodels) {
          if (rootmodel.TypeName === "InstancedMesh" || rootmodel.TypeName === "InstancedMesh-Pipe") {
            for (let model of rootmodel.ElementInfos) {
              if (
                model.screenPosition.x >= startPoint.x &&
                model.screenPosition.y >= startPoint.y &&
                model.screenPosition.x <= endPoint.x &&
                model.screenPosition.y <= endPoint.y
              ) {
                let indexes = [rootmodel.index, model.dbid];
                let GroupIndex = BeforeSelection.findIndex(item => item[0] == indexes[0] && item[1] == indexes[1]);
                //let GroupIndex = BeforeSelection.findIndex(item => item.toString() == indexes.toString())
                if (GroupIndex < 0) {
                  //不存在
                  BeforeSelection.push(indexes);
                } else {
                  //存在
                  BeforeSelection.splice(GroupIndex, 1);
                }
              }
            }
          } else if (rootmodel.TypeName === "Mesh" || rootmodel.TypeName === "Mesh-Structure" || rootmodel.TypeName === "PipeMesh") {
            if (rootmodel && rootmodel.ElementInfos.length) {
              for (let model of rootmodel.ElementInfos) {
                if (
                  model.screenPosition.x >= startPoint.x &&
                  model.screenPosition.y >= startPoint.y &&
                  model.screenPosition.x <= endPoint.x &&
                  model.screenPosition.y <= endPoint.y
                ) {
                  let indexes = [rootmodel.index, model.dbid];
                  let isShow = rootmodel.geometry.groups[model.dbid].visibility !== false;
                  // console.log(isShow)
                  let GroupIndex = BeforeSelection.findIndex(item => item[0] == indexes[0] && item[1] == indexes[1]);
                  //let GroupIndex = BeforeSelection.findIndex(item => item.toString() == indexes.toString())
                  if (isShow && GroupIndex < 0) {
                    //不存在
                    BeforeSelection.push(indexes);
                  } else {
                    //存在
                    BeforeSelection.splice(GroupIndex, 1);
                  }
                }
              }
            }
          }
        }
        _Engine.ResetModelStatus("highlight", BeforeSelection, true);
        selectionBox.endPoint = {
          x: 0,
          y: 0
        };
        selectionBox.startPoint = {
          x: 0,
          y: 0
        };
        getSelect();
      }
    }
  }
  return _selectBox;
}
