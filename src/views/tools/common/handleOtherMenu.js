// ----------- 处理其他menu的函数集合 -----------
const THREE = require("@/three/three.js");

// 是否激活画布
export function DrawActive(_Engine, status) {
  var _container = _Engine.scene.renderer.domElement.parentElement;
  let domList = _container.querySelectorAll("#drawing-board");
  let drawDom = domList && domList.length ? domList[0] : null;
  if (drawDom) {
    drawDom.style.pointerEvents = status ? "auto" : "none";
  }
}

//清除测量dom
export function DeleteMeasureDomes(_Engine, domeName) {
  var _container = _Engine.scene.renderer.domElement.parentElement;
  let domList = _container.querySelectorAll("." + domeName);
  let drawDom = domList && domList.length ? domList[0] : null;
  if (drawDom) {
    drawDom.remove();
  }
}

// 获得测量数据
export function GetMeasureDatas(_Engine, domeName) {
  var _container = _Engine.scene.renderer.domElement.parentElement;
  let domList = _container.querySelectorAll("." + domeName);
  let drawDom = domList && domList.length ? domList[0] : null;
  let measureList = [];
  if (drawDom) {
    let listDom = drawDom.children;
    for (let i = 0; i < listDom.length; i++) {
      let item = listDom[i];
      if (item.dataset.dataInfo) {
        measureList.push(JSON.parse(item.dataset.dataInfo));
      }
    }
  }
  return measureList;
}

// 设置监听键盘delete
export function SetDeleteListener(_Engine, list, status) {
  for (let item of list) {
    let keyName;
    switch (item.value) {
      case 61:
        keyName = "SimpleMeasure";
        break;
      case 62:
        keyName = "HeightMeasure";
        break;
      case 63:
        keyName = "DistanceMeasure";
        break;
      case 64:
        keyName = "PointMeasure";
        break;
      case 65:
        keyName = "ElevationHeightMeasure";
        break;
    }
    keyName && status
      ? _Engine.Measures && _Engine.Measures[keyName].OpenDrawDeleteListener()
      : _Engine.Measures && _Engine.Measures[keyName].CloseDrawDeleteListener();
  }
}

// 设置构件剖切
export function SetMeshsClipPlane(_Engine, planes) {
  if (planes && planes.length) {
    planes.map(item => {
      item.normal = new THREE.Vector3(item.normal.x, item.normal.y, item.normal.z);
      return item;
    });
  } else {
    // 如果剖切功能开启
    if (_Engine && _Engine.TopMenu && _Engine.Clipping && _Engine.Clipping.isActive) {
      switch (_Engine.Clipping.ActiveType) {
        case "MultiSide":
          _Engine.TopMenu.ClickItem("剖切");
          break;
        case "X轴":
          _Engine.TopMenu.ClickItem("添加X平面");
          break;
        case "Y轴":
          _Engine.TopMenu.ClickItem("添加Y平面");
          break;
        case "Z轴":
          _Engine.TopMenu.ClickItem("添加Z平面");
          break;
      }
    }
  }
  let models = _Engine.scene.children;
  models.forEach(item => {
    if (item.name === "rootModel") {
      if (item.material instanceof Array) {
        item.material.forEach(ii => {
          ii.clippingPlanes = planes ? planes : null;
        });
        item.cloneMaterialArray.forEach(ii => {
          ii.clippingPlanes = planes ? planes : null;
        });
      } else {
        item.material.clippingPlanes = planes ? planes : null;
        item.cloneMaterialArray.clippingPlanes = planes ? planes : null;
      }
    }
  });
  _Engine.UpdateRender();
}
