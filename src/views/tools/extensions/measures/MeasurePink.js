import {
	LineMaterial
} from '@/three/lines/LineMaterial.js';
import {
	LineGeometry
} from '@/three/lines/LineGeometry.js';
import {
	GeometricOperation
} from "@/views/tools/Geo/GeometricOperation.js"

export function drawCircle(scene, point, normal) {
  let cameraToLineDistance = GeometricOperation().PointPointDis(point, scene.camera.position)
  // 创建一个圆形平面，半径20，圆周方向细分数30
  var plane = new THREE.CircleGeometry(cameraToLineDistance*0.01, 30)
  var material = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    // 矩形平面网格模型默认单面显示，可以设置side属性值为THREE.DoubleSide双面显示
    side: THREE.DoubleSide,
    depthTest: false
  });
  var mesh = new THREE.Mesh(plane, material);
  mesh.renderOrder=99;
  let angle_x = 0;
  let angle_y = 0;
  let angle_z = 0;

  let plane_normal = new THREE.Vector3(normal.x, 0, normal.z);
  let dir = plane_normal.clone().cross(new THREE.Vector3(0, 0, 1)).y > 0 ? -1 : 1;
  let dir_ = normal.z ? 1 : -1

  angle_y = dir * plane_normal.clone().angleTo(new THREE.Vector3(0, 0, 1));
  angle_x = dir_ * plane_normal.clone().angleTo(normal);
  
  mesh.position.set(point.x, point.y, point.z);
  mesh.rotation._order = "YXZ"
  mesh.rotation.set(angle_x, angle_y, angle_z);
  mesh.Name = "MeasurePinkEdge"
  scene.add(mesh);
}
//绘制圆




export function drawLine(scene, positions) {
  //绘制边线
  let linegeometry = new LineGeometry();
  linegeometry.setPositions(positions);
  let matLine = new LineMaterial({
    //颜色宽度等属性设置，可以通过顶点渲染线，也可以设置统一颜色
    color: '#00ff00',
    linewidth: 1,
    vertexColors: false
  });
  matLine.resolution.set(window.innerWidth, window.innerHeight);

  let bufferline = new THREE.LineSegments(linegeometry, matLine);
  //场景添加线
  bufferline.Name = "MeasurePinkEdge";
  scene.add(bufferline);
}

export function clearDrawLineModel(scene) {
  for (let index = scene.children.length - 1; index >= 0; index--) {
    if (scene.children[index].Name === "MeasurePinkEdge") {
      scene.remove(scene.children[index]);
    }
  }
}

//渲染捕捉点
export function renderMeasurePink(domName,type) {
  var root = getRootDom(domName)
  let NS_SVG = 'http://www.w3.org/2000/svg'
  let Triangle = document.createElementNS(NS_SVG, 'svg')
  Triangle.setAttribute('style', 'position:absolute;width:20px;height:20px;display:none;')
  let polygon = document.createElementNS(NS_SVG, "polygon")
  polygon.setAttribute('points', '5,0 10,10 0,10')
  polygon.setAttribute('style', 'fill:rgba(0,255,0,0.2);stroke:rgba(0,255,0,1);stroke-width:2;')
  Triangle.appendChild(polygon);
  root.appendChild(Triangle);

  let Quadrangle = document.createElement("div");
  Quadrangle.className = "MeasurePointPink";
  root.appendChild(Quadrangle);

  //新增
  let Area = document.createElementNS(NS_SVG, 'svg')
  Area.setAttribute('style', 'position:absolute;width:100vw;height:100vh;display:none;pointer-events: none;')
  let AreaPolygon = document.createElementNS(NS_SVG, "polygon")
  AreaPolygon.setAttribute('points', '0,0 10,0 10,10 0,10')
  AreaPolygon.setAttribute('style', 'fill:rgba(0,255,0,0.2);stroke:rgba(0,255,0,1);stroke-width:2;')
  Area.appendChild(AreaPolygon);
  root.appendChild(Area);

  let ChuiDian = null
  if(type){
    ChuiDian = document.createElement("div");
    ChuiDian.id = "MeasureChuiDianPink";
    root.appendChild(ChuiDian);
  }

  return {
    Triangle,
    Quadrangle,
    Area,
    ChuiDian
  }
}

//获得捕捉点类型
export function getPinkType(scene, intersect, list) {
  let PINK_DETAILS = {
    type: "area",
    val: GeometricOperation().GetProjectPoints(intersect.point, intersect.face.normal,1),
    isCenter: false
  }
  let lineDistance = []
  //获得当前构建所有边线和到射线点的距离数组
  for (let i = 0; i < list.length; i = i + 6) {
    let start = new THREE.Vector3(list[i], list[i + 1], list[i + 2])
    let end = new THREE.Vector3(list[i + 3], list[i + 4], list[i + 5])
    let distance = GeometricOperation().PointDistanceLine(intersect.point, start, end)
    lineDistance.push({
      start: {
        x: list[i],
        y: list[i + 1],
        z: list[i + 2]
      },
      end: {
        x: list[i + 3],
        y: list[i + 4],
        z: list[i + 5]
      },
      distance: distance
    })
  }
  let orderList = []
  orderList = lineDistance.sort((a, b) => {
    return a.distance - b.distance
  }) //数组升序排序
  let line = orderList[0] //获得最近距离的线
  let cameraPosition1 = scene.camera.position.clone()
  cameraPosition1.x = cameraPosition1.x + 0.1
  cameraPosition1.y = cameraPosition1.y + 0.1
  cameraPosition1.z = cameraPosition1.z + 0.1
  let cameraToLineDistance = GeometricOperation().PointPointDis(intersect.point, scene.camera.position)
  if (line.distance <= cameraToLineDistance * 0.025) { //确定是到线
    PINK_DETAILS = {
      type: "line",
      val: GeometricOperation().PointProjectLine(intersect.point, new THREE.Vector3(line.start.x, line.start.y, line.start.z),
      new THREE.Vector3(line.end.x, line.end.y, line.end.z) ),
      isCenter: false,
      line: [line.start.x, line.start.y, line.start.z, line.end.x, line.end.y, line.end.z], 
    }
    // 创建一个线段对象Line3
    let line3 = new THREE.Line3();
    // 线段起点坐标
    line3.start = new THREE.Vector3(line.start.x, line.start.y, line.start.z);
    // 线段终点坐标
    line3.end = new THREE.Vector3(line.end.x, line.end.y, line.end.z);
    // 执行getCenter方法计算线段中点，结果保存到参数
    let centerPoint = line3.getCenter()
    let centerPointDistance = GeometricOperation().PointPointDis(intersect.point, centerPoint)

    let startPointDistance = GeometricOperation().PointPointDis(intersect.point, line.start)
    let endPointDistance = GeometricOperation().PointPointDis(intersect.point, line.end)
    if (startPointDistance <= cameraToLineDistance * 0.015 || endPointDistance <= cameraToLineDistance *
      0.015 || centerPointDistance <= cameraToLineDistance * 0.01) {
      let min = startPointDistance;
      let finalPoint = line.start;
      PINK_DETAILS = {
        type: "point",
        val: finalPoint,
        isCenter: false
      }
      if (centerPointDistance < min) {
        min = centerPointDistance;
        finalPoint = centerPoint;
        PINK_DETAILS = {
          type: "point",
          val: finalPoint,
          isCenter: true
        }
      }
      if (endPointDistance < min) {
        min = endPointDistance;
        finalPoint = line.end;
        PINK_DETAILS = {
          type: "point",
          val: finalPoint,
          isCenter: false
        }
      }

    }
  }
  return PINK_DETAILS
}

//获得点标记的dom根节点
function getRootDom(domName) {
  var root = document.getElementById(domName);
  if (root == null) { //不存在点标记包裹div
    root = document.createElement("div");
    root.id = domName;
    window.bimEngine.scene.renderer.domElement.parentElement.appendChild(root);
  }
  return root
}

//包含关系
export function IncludeElement(elements, point) {
  if (elements == null || elements.length == 0) {
    return null;
  }
  var eles = elements.filter(o => boxInclude(o.min, o.max, point));
  //再判断间距最小 
  if (eles.length == 0) {
    return null;
  }
  //找到距离点击位置最近的box
  eles.sort(function(a, b) {
    return a.center.distanceTo(point) - b.center.distanceTo(point);
  });
  return eles[0]
}

function boxInclude(min, max, point) {

  if (point.x >= min.x - 0.001 && point.y >= min.y - 0.001 && point.z >= min.z - 0.001 && point
    .x <=
    max
    .x + 0.001 && point.y <= max.y + 0.001 &&
    point.z <= max.z + 0.001) {
    return true;
  } else {
    return false;
  }
}