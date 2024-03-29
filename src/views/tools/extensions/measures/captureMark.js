const THREE = require("@/three/three.js");
import { LineMaterial } from "@/three/lines/LineMaterial.js";
import { LineGeometry } from "@/three/lines/LineGeometry.js";
import { GeometricOperation } from "@/views/tools/Geo/GeometricOperation.js";
import { worldPointToScreenPoint } from "@/views/tools/common/index.js";
import { IncludeElement } from "@/views/tools/initialize/InitEvents.js"; //监听函数
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";
import { getRootDom } from "./index.js";

/**
 * 
		// _captureMark.Position = {
		// 	worldPoint,//世界坐标
		// 	screenPoint, //屏幕坐标
		// 	capture:{//捕捉数据
		// 		type:"area/line/point",//面、线、点
		// 		isCenter:true/false, //是否为线段的中点
		// 		line:[],//线-线上的点集
		// 		val: Vector3是点的世界坐标/[Vector3,Vector3,Vector3,Vector3], //是面的世界坐标点集合
		//    faceNormal: Vector3是点的face.normal
		// 	}
		// }
 */
export function CaptureMark(_Engine) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/CaptureMark.scss");
  var _captureMark = new Object();
  var _container = _Engine.scene.renderer.domElement.parentElement;
  let CaptureMarkDom = "CaptureMarkContain"; //捕捉dom的根节点
  let Mark_Line = "CaptureMarkEdgeLine"; //渲染捕捉线-模型渲染
  let Mark_Quadrangle; //渲染捕捉端点-正方形
  let Mark_Triangle; //渲染捕捉中点-三角形
  let Mark_Area; //渲染捕捉面-四边形
  let Mark_ChuiDian; //渲染捕捉垂点-正方形
  _captureMark.MouseEvent = null; //跟随鼠标的位置参数
  _captureMark.Position = null; //捕捉到的点信息
  _captureMark.isActive = false; //捕捉是否激活
  let AnimationFrame = null; //动画
  let PINK_DETAILS = {
    type: "area",
    val: null,
    isCenter: false
  };
  //激活
  _captureMark.Active = function () {
    if (!_captureMark.isActive) {
      _Engine.Measures.isActive = true;

      _captureMark.models = _Engine.GetAllVisibilityModel();
      if (_Engine.EngineRay && _Engine.GpuRay != null) {
        _Engine.EngineRay.Active();
        _captureMark.models = _captureMark.models.filter(o => o.TypeName == "InstancedMesh" || o.TypeName == "InstancedMesh-Pipe");
        _captureMark.models.push(_Engine.scene.children[5]);
        console.log(_captureMark.models);
      }
      _Engine.ResetModelStatus("highlight", [], true);
      let pinks = CreateCaptureMarkDom(CaptureMarkDom); //渲染捕捉点
      Mark_Triangle = pinks.Triangle;
      Mark_Quadrangle = pinks.Quadrangle;
      Mark_Area = pinks.Area;
      Mark_ChuiDian = pinks.ChuiDian;
      _Engine.scene.renderer.domElement.className =
        _Engine.scene.renderer.domElement.className.replace("custom-cursor", "").trim() + " custom-cursor";
      _container.addEventListener("pointermove", onMouseMove);

      function render() {
        AnimationFrame = requestAnimationFrame(render);
        _captureMark.MouseEvent && Animate_MeasurePointPink(_captureMark.MouseEvent);
        // _Engine.EngineRay.pick();
        _Engine.scene.renderer.render(_Engine.scene, _Engine.scene.camera); //执行渲染操作
      }
      render(); //开启动画
      _captureMark.isActive = true;
    }
  };
  //关闭
  _captureMark.DisActive = function () {
    if (_captureMark.isActive) {
      _Engine.Measures.isActive = false;
      _Engine.EngineRay && _Engine.EngineRay.DisActive();
      var root = _container.getElementsByClassName(CaptureMarkDom)[0];
      root && root.remove(); //删除坐标点dom
      _Engine.scene.renderer.domElement.className = _Engine.scene.renderer.domElement.className.replace("custom-cursor", "").trim();
      _container.removeEventListener("pointermove", onMouseMove);
      cancelAnimationFrame(AnimationFrame); //清除动画
      _captureMark.isActive = false;
    }
  };

  //鼠标移动
  function onMouseMove(event) {
    _captureMark.MouseEvent = {
      x: event.clientX,
      y: event.clientY,
      event: event
    };
  }

  //鼠标移动更新捕捉点位置
  function Animate_MeasurePointPink(mouseEvent) {
    _captureMark.Position = null;
    ClearCaptureMarks();
    if (!(mouseEvent.event.target instanceof HTMLCanvasElement)) {
      //当鼠标不在场景上，直接返回
      return;
    }
    let rayCaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 300);

    // let rayCaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    mouse.x = ((mouseEvent.x - _Engine.scene.camera.viewport.x) / _Engine.scene.camera.viewport.z) * 2 - 1;
    mouse.y = -((mouseEvent.y - _Engine.scene.camera.viewport.y) / _Engine.scene.camera.viewport.w) * 2 + 1;
    //这里为什么是-号，没有就无法点中
    rayCaster.setFromCamera(mouse, _Engine.scene.camera);
    let intersects = rayCaster.intersectObjects(_captureMark.models, true);

    if (intersects.length) {
      let intersect = intersects[0];
      let EdgeInfos = [],
        EdgeItem = null,
        EdgeList = [];
      if (intersect.object.TypeName == "HighlightMesh") {
        var mainInstance = _Engine.scene.children[intersect.object.Indexs[0]];
        var clickObj = mainInstance.ElementInfos[intersect.object.Indexs[1]];
        if (clickObj && mainInstance.geometry.groups[clickObj.dbid].visibility !== false) {
          EdgeInfos = _Engine.AllEdgeList.filter(item => item.Indexs === intersect.object.Indexs[0]);
          EdgeItem = EdgeInfos && EdgeInfos.length ? EdgeInfos[0] : null;
          EdgeList = EdgeItem && EdgeItem.ElementInfos[clickObj.dbid] ? EdgeItem.ElementInfos[clickObj.dbid].EdgeList : [];
          PINK_DETAILS = getPinkType(_Engine.scene, intersect, EdgeList, intersect.face.normal.clone());
        }
      } else if (
        intersect.object.TypeName == "Mesh" ||
        intersect.object.TypeName == "Mesh-Structure" ||
        intersect.object.TypeName == "PipeMesh"
      ) {
        var clickObj = IncludeElement(_Engine, intersect.object, intersect.point); //选中的构建位置信息
        if (clickObj && intersect.object.geometry.groups[clickObj.dbid].visibility !== false) {
          EdgeInfos = _Engine.AllEdgeList.filter(item => item.Indexs === intersect.object.index);
          EdgeItem = EdgeInfos && EdgeInfos.length ? EdgeInfos[0] : null;
          EdgeList = EdgeItem && EdgeItem.ElementInfos[clickObj.dbid] ? EdgeItem.ElementInfos[clickObj.dbid].EdgeList : [];
          PINK_DETAILS = getPinkType(_Engine.scene, intersect, EdgeList, intersect.face.normal.clone());
        }
      } else if (intersect.object.TypeName == "InstancedMesh" || intersect.object.TypeName == "InstancedMesh-Pipe") {
        EdgeInfos = _Engine.AllEdgeList.filter(item => item.Indexs === intersect.object.index);
        EdgeItem = EdgeInfos && EdgeInfos.length ? EdgeInfos[0] : null;
        EdgeList = EdgeItem && EdgeItem.ElementInfos[intersect.instanceId] ? EdgeItem.ElementInfos[intersect.instanceId].EdgeList : [];
        let matrixArray = intersect.object.instanceMatrix.array.slice(intersect.instanceId * 16, (intersect.instanceId + 1) * 16);
        let matrix = new THREE.Matrix4();
        matrix.elements = matrixArray;
        var p = new THREE.Vector3(); // 坐标分量
        var q = new THREE.Quaternion(); //旋转分量
        var s = new THREE.Vector3(); //缩放分量
        matrix.decompose(p, q, s);
        var newmatrix = new THREE.Matrix4().makeRotationFromQuaternion(q);
        var trueNormal = intersect.face.normal.clone().applyMatrix4(newmatrix.clone()).normalize();

        PINK_DETAILS = getPinkType(_Engine.scene, intersect, EdgeList, trueNormal);
      }
      let position = {
        worldPoint: intersect.point.clone(), //世界坐标
        screenPoint: worldPointToScreenPoint(intersect.point.clone(), _Engine.scene.camera), //世界坐标转为屏幕坐标
        capture: PINK_DETAILS
      };
      _captureMark.Position = position;
    }
    switch (PINK_DETAILS.type) {
      case "area":
        if (intersects.length && PINK_DETAILS.val) {
          //新增
          let areaPoints = PINK_DETAILS.val.map(item => {
            let p = worldPointToScreenPoint(new THREE.Vector3(item.x, item.y, item.z), _Engine.scene.camera);
            return p.x + "," + p.y;
          });
          Mark_Area.style.display = "block";
          Mark_Area.firstChild.setAttribute("points", areaPoints.join(" "));
        }
        break;
      case "line":
        drawLine(_Engine.scene, PINK_DETAILS.line);
        break;
      case "point":
        if (PINK_DETAILS.isCenter) {
          let position = worldPointToScreenPoint(
            new THREE.Vector3(PINK_DETAILS.val.x, PINK_DETAILS.val.y, PINK_DETAILS.val.z),
            _Engine.scene.camera
          );
          Mark_Triangle.style.display = "block";
          Mark_Triangle.style.top = position.y - 5 + "px";
          Mark_Triangle.style.left = position.x - 5 + "px";
        } else {
          let position = worldPointToScreenPoint(
            new THREE.Vector3(PINK_DETAILS.val.x, PINK_DETAILS.val.y, PINK_DETAILS.val.z),
            _Engine.scene.camera
          );
          Mark_Quadrangle.style.top = position.y + "px";
          Mark_Quadrangle.style.left = position.x + "px";
          Mark_Quadrangle.style.width = "10px";
          Mark_Quadrangle.style.height = "10px";
          Mark_Quadrangle.style.transform = "translate(-50%,-50%)";
          Mark_Quadrangle.style.display = "block";
        }
        break;
    }
  }

  //获得捕捉点类型
  function getPinkType(scene, intersect, list, normal) {
    let PINK_DETAILS = {
      type: "area",
      val: GeometricOperation().GetProjectPoints(intersect.point, normal.clone(), 1),
      isCenter: false,
      faceNormal: normal.clone()
    };
    let lineDistance = [];
    //获得当前构建所有边线和到射线点的距离数组
    for (let i = 0; i < list.length; i = i + 6) {
      let start = new THREE.Vector3(list[i], list[i + 1], list[i + 2]);
      let end = new THREE.Vector3(list[i + 3], list[i + 4], list[i + 5]);
      let distance = GeometricOperation().PointDistanceLine(intersect.point, start, end);
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
      });
    }
    let orderList = [];
    orderList = lineDistance.sort((a, b) => {
      return a.distance - b.distance;
    }); //数组升序排序
    let line = orderList[0]; //获得最近距离的线
    let cameraToLineDistance = GeometricOperation().PointPointDis(intersect.point, scene.camera.position);
    if (line && line.distance <= cameraToLineDistance * 0.025) {
      //确定是到线
      PINK_DETAILS = {
        type: "line",
        val: GeometricOperation().PointProjectLine(
          intersect.point,
          new THREE.Vector3(line.start.x, line.start.y, line.start.z),
          new THREE.Vector3(line.end.x, line.end.y, line.end.z)
        ),
        isCenter: false,
        line: [line.start.x, line.start.y, line.start.z, line.end.x, line.end.y, line.end.z],
        faceNormal: normal.clone()
      };
      // 创建一个线段对象Line3
      let line3 = new THREE.Line3();
      // 线段起点坐标
      line3.start = new THREE.Vector3(line.start.x, line.start.y, line.start.z);
      // 线段终点坐标
      line3.end = new THREE.Vector3(line.end.x, line.end.y, line.end.z);
      // 执行getCenter方法计算线段中点，结果保存到参数
      let centerPoint = line3.getCenter();
      let centerPointDistance = GeometricOperation().PointPointDis(intersect.point, centerPoint);

      let startPointDistance = GeometricOperation().PointPointDis(intersect.point, line.start);
      let endPointDistance = GeometricOperation().PointPointDis(intersect.point, line.end);
      if (
        startPointDistance <= cameraToLineDistance * 0.015 ||
        endPointDistance <= cameraToLineDistance * 0.015 ||
        centerPointDistance <= cameraToLineDistance * 0.01
      ) {
        let min = startPointDistance;
        let finalPoint = line.start;
        PINK_DETAILS = {
          type: "point",
          val: finalPoint,
          isCenter: false,
          faceNormal: normal.clone()
        };
        if (centerPointDistance < min) {
          min = centerPointDistance;
          finalPoint = centerPoint;
          PINK_DETAILS = {
            type: "point",
            val: finalPoint,
            isCenter: true,
            faceNormal: normal.clone()
          };
        }
        if (endPointDistance < min) {
          min = endPointDistance;
          finalPoint = line.end;
          PINK_DETAILS = {
            type: "point",
            val: finalPoint,
            isCenter: false,
            faceNormal: normal.clone()
          };
        }
      }
    }
    return PINK_DETAILS;
  }

  //创建捕捉对象
  function CreateCaptureMarkDom(domName) {
    var root = getRootDom(_container, domName);
    let NS_SVG = "http://www.w3.org/2000/svg";
    let Triangle = document.createElementNS(NS_SVG, "svg");
    Triangle.setAttribute("style", "position:absolute;width:20px;height:20px;display:none;pointer-events:none;");
    let polygon = document.createElementNS(NS_SVG, "polygon");
    polygon.setAttribute("points", "5,0 10,10 0,10");
    polygon.setAttribute("style", "fill:rgba(0,255,0,0.2);stroke:rgba(0,255,0,1);stroke-width:2;pointer-events:none;");
    Triangle.appendChild(polygon);
    root.appendChild(Triangle);

    let Quadrangle = document.createElement("div");
    Quadrangle.className = "CapturePointMark";
    root.appendChild(Quadrangle);

    //新增
    let Area = document.createElementNS(NS_SVG, "svg");
    Area.setAttribute("style", "position:absolute;width:100vw;height:100vh;display:none;pointer-events: none;");
    let AreaPolygon = document.createElementNS(NS_SVG, "polygon");
    AreaPolygon.setAttribute("points", "0,0 10,0 10,10 0,10");
    AreaPolygon.setAttribute("style", "fill:rgba(0,255,0,0.2);stroke:rgba(0,255,0,1);stroke-width:2;pointer-events:none;");
    Area.appendChild(AreaPolygon);
    root.appendChild(Area);

    let ChuiDian = document.createElement("div");
    ChuiDian.className = "CaptureChuiDianPointMark";
    root.appendChild(ChuiDian);

    return {
      Triangle,
      Quadrangle,
      Area,
      ChuiDian
    };
  }

  //隐藏捕捉对象
  function ClearCaptureMarks() {
    Mark_Quadrangle.style.display = "none";
    Mark_Triangle.style.display = "none";
    Mark_Area.style.display = "none";
    Mark_ChuiDian.style.display = "none";
    clearDrawLineModel(_Engine.scene);
    PINK_DETAILS = {
      type: "area",
      val: null,
      isCenter: false
    };
  }

  //创建捕捉对象-线条-模型创建
  function drawLine(scene, positions) {
    //绘制边线
    let linegeometry = new LineGeometry();
    linegeometry.setPositions(positions);
    let matLine = new LineMaterial({
      //颜色宽度等属性设置，可以通过顶点渲染线，也可以设置统一颜色
      color: "#00ff00",
      linewidth: 1,
      vertexColors: false
    });
    matLine.resolution.set(_container.clientWidth, _container.clientHeight);
    let bufferline = new THREE.LineSegments(linegeometry, matLine);
    //场景添加线
    bufferline.Name = Mark_Line;
    scene.add(bufferline);
  }

  //清除捕捉对象-线条-模型创建
  function clearDrawLineModel(scene) {
    for (let index = scene.children.length - 1; index >= 0; index--) {
      if (scene.children[index].Name === Mark_Line) {
        scene.remove(scene.children[index]);
      }
    }
  }

  return _captureMark;
}
