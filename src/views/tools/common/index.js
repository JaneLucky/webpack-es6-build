// 获得模型构建的包围矩形
export function GetBoundingBox(list){
  var rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
  var allPointsX = [];
  var allPointsY = [];
  var allPointsZ = [];
  if(list){
    for (let select of list) {
      for (let rootmodel of rootmodels) {
        if (rootmodel && rootmodel.material.length) {
          let hasSet = false
          for (let model of rootmodel.ElementInfos) {
            if(model.name === select){
              let point = model.center.clone()
              allPointsX.push(point.x);
              allPointsY.push(point.y);
              allPointsZ.push(point.z);
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
  }else{
		for (let rootmodel of rootmodels) {
			for (let model of rootmodel.ElementInfos) {
        let point = model.center.clone()
        allPointsX.push(point.x);
        allPointsY.push(point.y);
        allPointsZ.push(point.z);
			}
		}
  }

  allPointsX.sort((a, b) => {
    if (a < b) {
      return -1
    }
    if (a > b) {
      return 1
    }
    return 0
  })
  allPointsY.sort((a, b) => {
    if (a < b) {
      return -1
    }
    if (a > b) {
      return 1
    }
    return 0
  })
  allPointsZ.sort((a, b) => {
    if (a < b) {
      return -1
    }
    if (a > b) {
      return 1
    }
    return 0
  })
  var min = new THREE.Vector3(allPointsX[0], allPointsY[0], allPointsZ[0]);
  var max = new THREE.Vector3(allPointsX[allPointsX.length - 1], allPointsY[allPointsY.length - 1],
    allPointsZ[allPointsZ.length - 1]);
  var center = min.clone().add(max.clone()).multiplyScalar(0.5);
  return {
    min: min,
    max: max,
    center: center
  }
}

//世界坐标转屏幕坐标
export function worldPointToScreenPoint(vector3, camera) {
  const stdVector = vector3.project(camera);
  const a = window.innerWidth / 2;
  const b = window.innerHeight / 2;
  const x = Math.round(stdVector.x * a + a);
  const y = Math.round(-stdVector.y * b + b);
  return {
    x: x,
    y: y
  }
}

import "./iconfont.js"
import "../style/SvgIcon.scss"
//创建svg图标
export function CreateSvg(name){
  let svgns = "http://www.w3.org/2000/svg";
  let xlinkns = "http://www.w3.org/1999/xlink";
  let icon = document.createElementNS(svgns, "svg");
  icon.setAttribute("aria-hidden", true);
  icon.setAttribute("class", 'Svg-Icon');
  let use = document.createElementNS(svgns, "use");
  use.setAttributeNS(xlinkns, "href", "#"+name);
  icon.appendChild(use);
  return icon
}