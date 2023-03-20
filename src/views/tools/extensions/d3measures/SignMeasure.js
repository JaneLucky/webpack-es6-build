import {
	GeometricOperation
} from "@/views/tools/Geo/GeometricOperation.js"
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js"
import {
	worldPointToScreenPoint
} from "@/views/tools/common/index.js"
import {
	drawCircle,
	drawLine,
	clearDrawLineModel,
	renderMeasurePink,
	getPinkType,
	IncludeElement
} from "../measures/MeasurePink"
//三维测量标记
export function SignMeasure(bimEngine) {
  require('@/views/tools/style/'+SetDeviceStyle()+'/d3measure.scss')
	var _signMeasure = new Object();
	_signMeasure.MouseType = "none";
	_signMeasure.Measures = [];
	_signMeasure.Controls = [];
	//当前
	_signMeasure.CurrentMeasure = null;
	_signMeasure.HighLightMeasure = null;
	_signMeasure.HighLightControl = null;
	let _D3Measure = bimEngine.D3Measure;
	let AnimationFrame = null;

	function render() {
		// AnimationFrame = requestAnimationFrame(render);
		// CameraUpdate();
	}
	render() //开启动画
	//获取标记数据
	_signMeasure.GetMeasureList = function() {

	}
	//还原标注数据
	_signMeasure.ReductionMeasure = function(list) {

	}
	//启用
	_signMeasure.Active = function() {

	}
	//创建标注
	_signMeasure.CreatorMeasure = function() {
		//关闭其他测量
		bimEngine.Measures.DistanceMeasure.DisActive()
		bimEngine.Measures.HeightMeasure.DisActive()
		bimEngine.Measures.PointMeasure.DisActive()
		bimEngine.Measures.SimpleMeasure.DisActive()
		//关闭其他测量
		_signMeasure.MouseType = "DrawLine";
		let plane_ = bimEngine.D3Measure.GetCurrentWorkPlane();
		let plane = new THREE.Plane(plane_.normal.clone().normalize(), plane_.constant);
		_signMeasure.CurrentMeasure = {
			Points: [],
			Id: guid(),
			workerPlane: plane
		};
		bimEngine.StopClick = true;
		addEventLicense();
	}
	//禁用
	_signMeasure.DisActive = function() {

	}
	//鼠标注册事件
	function addEventLicense() {
		var _container = bimEngine.scene.renderer.domElement.parentElement;
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointerup', onMouseUp);
		_container.addEventListener('pointermove', onMouseMove);
		_container.setAttribute('tabindex', 0)
		_container.focus()
		_container.onkeydown = onKeyDown
	}

	function removeEventLicense() {
		var _container = bimEngine.scene.renderer.domElement.parentElement;
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointerup', onMouseUp);
		_container.removeEventListener('pointermove', onMouseMove);
		_container.removeEventListener('keydown', onKeyDown)
		//清除一些标记 
		clearDrawLineModel(bimEngine.scene);
		let root = document.getElementById("MeasurePoint");
		if (root != null) {
			root.remove();
		}
		bimEngine.StopClick = false;
	}
	//按下ESC按键
	function onKeyDown(e) {
		if (e.keyCode == 27) {
			removeEventLicense();
		} else if (e.keyCode == 8 || e.keyCode == 46) {
			//删除选中的模型
			let measure = _signMeasure.HighLightMeasure;
			//删除场景中的模型
			var index = bimEngine.scene.children.findIndex(x => x.Id == measure.Id);
			if (index != -1) {
				bimEngine.scene.children.splice(index, 1);
			}
			//删除列表中的数据
			var measureIndex = _signMeasure.Measures.findIndex(x => x.Id == measure.Id);
			if (measureIndex != -1) {
				_signMeasure.Measures.splice(measureIndex, 1);
			}
			//删除UI
			var domIndex = _signMeasure.Controls.findIndex(x => x.Id == measure.Id);
			if (domIndex != -1) {
				_signMeasure.Controls[domIndex].remove();
			}
		}
	}
	//鼠标移动
	function onMouseMove(event) {
		_signMeasure.mouse = mousePosition(event);
		if (_signMeasure.MouseType == "DrawLine") {
			Animate_MeasurePointPink(event);
			let point = GetRayWorldPointPlane(_signMeasure.mouse);
			_signMeasure.CurrentMeasure.currentPoint = point.clone();
			DrawMeasureLineTemp(_signMeasure.CurrentMeasure);
		}
		if (_signMeasure.MouseType == "DragMeasure") {
			let point = GetRayWorldPointPlane(_signMeasure.mouse);
			_signMeasure.HighLightMeasure.currentPoint = point.clone();
			if (_signMeasure.HighLightMeasure.Points.length == 3) {
				_signMeasure.HighLightMeasure.Points = [
					new THREE.Vector3(_signMeasure.HighLightMeasure.Points[0].x, _signMeasure.HighLightMeasure
						.Points[0].y, _signMeasure.HighLightMeasure.Points[0].z),
					new THREE.Vector3(_signMeasure.HighLightMeasure.Points[1].x, _signMeasure.HighLightMeasure
						.Points[1].y, _signMeasure.HighLightMeasure.Points[1].z),
					_signMeasure.HighLightMeasure.currentPoint
				]
			}
			_signMeasure.HighLightMeasure.MeasureText = _signMeasure.Controls.filter(x => x.Id == _signMeasure
				.HighLightMeasure.Id)[0];
			_signMeasure.HighLightMeasure.diry = GetToVector3(_signMeasure.HighLightMeasure.diry);
			_signMeasure.HighLightMeasure.interCenter = GetToVector3(_signMeasure.HighLightMeasure.interCenter);
			//平面  
			RenderLine(_signMeasure.HighLightMeasure, _signMeasure.HighLightMeasure.Points, _signMeasure
				.HighLightMeasure.workerPlane);
		}
		if (_signMeasure.MouseType == "none") {
			// let point = GetRayWorldPointPlane(_signMeasure.mouse);
			//选择捕捉剖面
			// HandleCatchMeasureLine(point);
		}
	}
	//鼠标按下
	function onMouseDown(event) {
		if (event.button != 0) {
			return;
		}
		_signMeasure.mouse = mousePosition(event);
		if (_signMeasure.MouseType == "DrawLine") {
			// console.log(_signMeasure.CurrentMeasure.workerPlane)
			let point = GetRayWorldPointPlane(_signMeasure.mouse);
			if (_signMeasure.CurrentMeasure.Points.length == 0) {
				//第一个点必须捕捉到边
				if (_signMeasure.PINK_DETAILS.line == null || _signMeasure.PINK_DETAILS.line.length != 6) {
					return;
				}
				let start = new THREE.Vector3(_signMeasure.PINK_DETAILS.line[0], _signMeasure.PINK_DETAILS.line[1],
					_signMeasure.PINK_DETAILS.line[2]);
				let end = new THREE.Vector3(_signMeasure.PINK_DETAILS.line[3], _signMeasure.PINK_DETAILS.line[4],
					_signMeasure.PINK_DETAILS.line[5]);
				let dir = end.clone().sub(start.clone()).normalize();

				if (_signMeasure.PINK_DETAILS.type === "point" || _signMeasure.PINK_DETAILS.type === "line") {
					point = new THREE.Vector3(_signMeasure.PINK_DETAILS.val.x, _signMeasure.PINK_DETAILS.val.y,
						_signMeasure.PINK_DETAILS.val.z);
				}
				_signMeasure.CurrentMeasure.Points.push(point);
				_signMeasure.CurrentMeasure.diry = dir;
			} else if (_signMeasure.CurrentMeasure.Points.length == 1) {
				//第二个点做投影
				if (_signMeasure.PINK_DETAILS.type === "point" || _signMeasure.PINK_DETAILS.type === "line") {
					point = new THREE.Vector3(_signMeasure.PINK_DETAILS.val.x, _signMeasure.PINK_DETAILS.val.y,
						_signMeasure.PINK_DETAILS.val.z);
				}
				_signMeasure.CurrentMeasure.Points.push(point);
			} else if (_signMeasure.CurrentMeasure.Points.length == 2) {
				_signMeasure.CurrentMeasure.Points.push(point);
				_signMeasure.Measures.push(JSON.parse(JSON.stringify(_signMeasure.CurrentMeasure)));
				removeEventLicense();
				_signMeasure.CreatorMeasure();
			}
		}
		if (_signMeasure.MouseType == "none") {
			// let point = GetRayWorldPointPlane(_D3Measure.mouse);
			// var current = HandleCatchMeasureLine(point);
			// _signMeasure.HighLightMeasure = current;

		}
	}
	//鼠标弹起
	function onMouseUp(event) {
		if (event.button != 0) {
			return;
		}
		if (_signMeasure.MouseType == "DragMeasure") {
			_signMeasure.MouseType = "none";
			_signMeasure.HighLightControl.style.pointerevents = "all";
			_signMeasure.HighLightControl = null;
			removeEventLicense();
		}

	}
	//相机交互
	//创建相机的UI
	function CreatorUI() {
		_signMeasure.Controls = [];
		let dom = document.createElement("div");
		//文字
		let text = document.createElement("div");
		//拖拽点1
		let control_left = document.createElement("div");
		//拖拽点2
		let control_right = document.createElement("div");
		//***************************创建UI****************************//
		dom.appendChild(text);
		dom.appendChild(control_left);
		dom.appendChild(control_right);
		_signMeasure.Controls.push(text);
		_signMeasure.Controls.push(control_left);
		_signMeasure.Controls.push(control_right);


	}
	//创建标注的线条| 起点、终点、中点、工作屏幕
	function CreatorMeasureLines(center, start, end, plane) {
		//标注有5条线
		let dis = GeometricOperation().PointDistanceLineExtend(center, start, end);
		let points = [];
	}
	//更新相机位置
	function CameraUpdate() {
		if (bimEngine.scene == null) {
			return;
		}
		const HEIGHT = (window.innerHeight) * window.devicePixelRatio;
		let basex = bimEngine.scene.camera.viewport.x;
		let basey = bimEngine.scene.camera.viewport.y;
		let maxx = basex + bimEngine.scene.camera.viewport.z;
		let maxy = basey + bimEngine.scene.camera.viewport.w;
		//最后，删除



		for (let measure of _signMeasure.Measures) {
			let screenPoint = worldPointToScreenPoint(GetToVector3(measure.interCenter).clone(),bimEngine.scene.camera);
			let offy = screenPoint.y;
			let offx = screenPoint.x;
			if (offx < 0 || offy < 0) {
				continue;
			}
			// console.log(measure.interCenter)
			var domIndex = _signMeasure.Controls.findIndex(x => x.Id == measure.Id);
			if (domIndex != -1) {
				if (offx > maxx || offy > maxy || offx < basex || offy < basey) {
					_signMeasure.Controls[domIndex].style.visibility = "hidden";
				} else {
					_signMeasure.Controls[domIndex].style.visibility = "visible";
				} 
				_signMeasure.Controls[domIndex].style.left = offx + "px";
				_signMeasure.Controls[domIndex].style.top = offy + "px";
			}
		}
	}
	//鼠标点击位置
	function mousePosition(event) {
		var mouse = {};
		mouse.x = ((event.clientX - bimEngine.scene.camera.viewport.x) / bimEngine.scene.camera.viewport.z) * 2 - 1;
		mouse.y = -((event.clientY - bimEngine.scene.camera.viewport.y) / bimEngine.scene.camera.viewport.w) * 2 +
			1; //这里为什么是-号，没有就无法点中
		return mouse;
	}
	//世界坐标转屏幕坐标
	function get2DVec(vector3) {
		const stdVector = vector3.project(bimEngine.scene.camera);
		const a = bimEngine.scene.camera.viewport.z / 2;
		const b = bimEngine.scene.camera.viewport.w / 2;
		const x = Math.round(stdVector.x * a + a);
		const y = Math.round(-stdVector.y * b + b);
		return new THREE.Vector2(x, y);
	}

	function DrawMeasureLineTemp(measure) {
		if (measure.Points.length == 0) {
			return;
		}
		//具有一个点
		else if (measure.Points.length == 1) {
			let renderPoints = [];
			//第一个点
			renderPoints.push(measure.Points[0]);
			//第二个点
			renderPoints.push(measure.currentPoint);
			//第三个点
			let dir = measure.currentPoint.clone().sub(measure.Points[0]);
			let nomal = measure.workerPlane.normal;
			measure.disDir = dir.clone().cross(nomal.clone()).normalize();
			RenderLine(measure, renderPoints, measure.workerPlane);
		}
		//具有两个点
		else if (measure.Points.length == 2) {
			let renderPoints = [];
			//第一个点
			renderPoints.push(measure.Points[0]);
			//第二个点
			renderPoints.push(measure.Points[1]);
			//第三个点
			renderPoints.push(measure.currentPoint);
			RenderLine(measure, renderPoints, measure.workerPlane);
		}
	}
	//绘制直线
	function RenderLine(measure, points, plane) {
		/* 
		   |                                                     |
		---|---------------------------③-------------------------|---
		   |                                                     |
		   |                                                     |
		   |                                                     |
		   |                                                     |
		   ①                                                     ②
		*/

		// 投影到工作平面上
		if (points[0] != null) {
			points[0] = GeometricOperation().PointProjectFace(GetToVector3(points[0]), plane);
		}
		if (points[1] != null) {
			points[1] = GeometricOperation().PointProjectFace(GetToVector3(points[1]), plane);
		}
		if (points[2] != null) {
			points[2] = GeometricOperation().PointProjectFace(GetToVector3(points[2]), plane);
		}
		let obliqueLength = 0.05;
		//渲染图形
		let start = points[0];
		let start_ = start.clone().add(measure.diry.clone());
		//计算投影
		let diry = measure.diry;
		let projectPoint = GeometricOperation().PointProjectLine(points[1], start, start_);
		let dirx = points[1].clone().sub(projectPoint.clone());
		let end = start.clone().add(dirx.clone());
		dirx = dirx.normalize();
		let center = points.length == 3 ? points[2] : null;


		let dis = center == null ? 0.1 : GeometricOperation().PointDistanceLineExtend(center, start, end);
		let disdir = center == null ? 1 : center.clone().sub(start.clone()).dot(diry) > 0 ? 1 : -1;
		diry = diry.multiplyScalar(disdir);
		measure.dis = dis;
		//绘制其他形状
		let linePoints = [];
		let inter1 = start.clone().add(diry.clone().setLength(dis));
		let inter2 = end.clone().add(diry.clone().setLength(dis));
		//添加点
		linePoints.push(start.clone());
		linePoints.push(inter1.clone().add(diry.clone().multiplyScalar(obliqueLength)));

		linePoints.push(inter1.clone().add(dirx.clone().multiplyScalar(-obliqueLength)));
		linePoints.push(inter2.clone().add(dirx.clone().multiplyScalar(obliqueLength)));

		linePoints.push(end.clone());
		linePoints.push(inter2.clone().add(diry.clone().multiplyScalar(obliqueLength)));

		let obliqueDir = dirx.clone().add(diry.clone()).normalize();
		linePoints.push(inter1.clone().add(obliqueDir.clone().multiplyScalar(obliqueLength)));
		linePoints.push(inter1.clone().add(obliqueDir.clone().multiplyScalar(-obliqueLength)));

		linePoints.push(inter2.clone().add(obliqueDir.clone().multiplyScalar(obliqueLength)));
		linePoints.push(inter2.clone().add(obliqueDir.clone().multiplyScalar(-obliqueLength)));


		measure.linePoints = linePoints;
		//场景中子物体
		let index = bimEngine.scene.children.findIndex(x => x.Id == measure.Id);
		let interCenter = inter1.clone().add(inter2.clone()).multiplyScalar(0.5);
		measure.interCenter = interCenter.clone();
		if (index != -1) {
			//已存在图形，更新形状
			let mesh = bimEngine.scene.children[index];
			for (let i = 0; i < linePoints.length; i++) {
				mesh.geometry.attributes.position.array[3 * i + 0] = linePoints[i].x;
				mesh.geometry.attributes.position.array[3 * i + 1] = linePoints[i].y;
				mesh.geometry.attributes.position.array[3 * i + 2] = linePoints[i].z;
			}
			mesh.geometry.attributes.position.needsUpdate = true;
			if (measure.MeasureText != null && measure.MeasureText.style != null) {
				const HEIGHT = (window.innerHeight) * window.devicePixelRatio;
				let basex = bimEngine.scene.camera.viewport.x;
				let basey = bimEngine.scene.camera.viewport.y;
				let maxx = basex + bimEngine.scene.camera.viewport.z;
				let maxy = basey + bimEngine.scene.camera.viewport.w;

				let offy = basey + get2DVec(interCenter.clone()).y
				let offx = basex + get2DVec(interCenter.clone()).x;
				console.log(basex, get2DVec(interCenter.clone()).x, offx)
				if (offx > maxx || offy > maxy || offx < basex || offy < basey) {
					measure.MeasureText.style.visibility = "hidden";
				} else {
					measure.MeasureText.style.visibility = "visible";
				}

				// measure.MeasureText.style.top = offy + "px";
				// measure.MeasureText.style.left = offx + "px";
				measure.MeasureText.innerHTML = Math.round(1000 * inter1.clone().distanceTo(inter2.clone())) + "mm";
			}

		} else {
			//创建图形
			var geometry = new THREE.BufferGeometry(); //声明一个空几何体对象
			geometry.setFromPoints(linePoints);
			var material = new THREE.LineBasicMaterial({
				color: 0x000000, //三角面颜色
				wireframe: true,
				linewidth: 100,
				depthTest: false
			});
			var mesh = new THREE.LineSegments(geometry, material);
			mesh.name = "ViewSection";
			mesh.Id = measure.Id;
			bimEngine.scene.add(mesh);
			//获取数据
			var dom = document.createElement("div");
			dom.className = "MeasureText";
			dom.Id = measure.Id;
			dom.innerHTML = Math.round(1000 * inter1.clone().distanceTo(inter2.clone())) + "mm";

			_signMeasure.Controls.push(dom);
			measure.MeasureText = dom;
			measure.MeasureText.style.top = get2DVec(interCenter.clone()).y + "px";
			measure.MeasureText.style.left = get2DVec(interCenter.clone()).x + "px";
			var _container = bimEngine.scene.renderer.domElement.parentElement;
			_container.appendChild(dom);
			dom.addEventListener("click", function(res) {
				for (let m of _signMeasure.Controls) {
					if (m.Id == res.target.Id) {
						m.style.color = "blue";
					} else {
						m.style.color = "black";
					}
				};
				let index = _signMeasure.Measures.findIndex(x => x.Id == res.target.Id);
				if (index != -1) {
					_signMeasure.HighLightMeasure = _signMeasure.Measures[index];
				}
			});
			//鼠标点击下去
			dom.addEventListener("mousedown", function(res) {

				let index = _signMeasure.Measures.findIndex(x => x.Id == res.target.Id);
				if (index != -1) {
					_signMeasure.HighLightMeasure = _signMeasure.Measures[index];
				}
				_signMeasure.HighLightControl = res.target;
				_signMeasure.HighLightControl.style.pointerevents = "none";
				_signMeasure.MouseType = "DragMeasure";
				addEventLicense();
			})
		}
	}
	//获取guid
	function guid() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	//点投影到平面上
	function PointProjectPlane(point, plane) {
		let projectPoint = GeometricOperation().PointProjectFace(point, plane);
		return projectPoint;
	}
	//对象转Vector3
	function GetToVector3(point) {
		return new THREE.Vector3(point.x, point.y, point.z);
	}
	//获取射线在平面上选择的点
	function GetRayWorldPointPlane(mouse) {
		let pX = mouse.x;
		let pY = mouse.y;

		let p = new THREE.Vector3(pX, pY, -1).unproject(bimEngine.scene.camera)
		let p_ = new THREE.Vector3(pX, pY, -1000000000).unproject(bimEngine.scene.camera);
		var point3D = p;
		var rayCast = new THREE.Raycaster();
		var rayDir = point3D.clone().sub(p_).setLength(1000000);
		rayCast.set(point3D.clone().sub(rayDir), rayDir);
		let plane = _signMeasure.CurrentMeasure.workerPlane;
		var startPickPoint = rayCast.ray.intersectPlane(plane);
		return startPickPoint;
	}
	//精确测量捕捉**************************************************************************************************************************
	function Animate_MeasurePointPink(mouseEvent) {
		let camera = bimEngine.scene.camera;
		if (bimEngine.D3Measure.MeasurePink_Quadrangle != null) {
			bimEngine.D3Measure.MeasurePink_Quadrangle.style.display = "none";
		}
		if (bimEngine.D3Measure.MeasurePink_Triangle != null) {
			bimEngine.D3Measure.MeasurePink_Triangle.style.display = "none";
		}
		if (bimEngine.D3Measure.MeasurePink_Area != null) {
			bimEngine.D3Measure.MeasurePink_Area.style.display = "none";
		}

		clearDrawLineModel(bimEngine.scene)
		_signMeasure.PINK_DETAILS = {
			type: "area",
			val: null,
			isCenter: false
		}
		if (!(mouseEvent.target instanceof HTMLCanvasElement)) { //当鼠标不在场景上，直接返回
			return;
		}
		let rayCaster = new THREE.Raycaster();
		let mouse = new THREE.Vector2();
		mouse.x = ((mouseEvent.x - document.body.getBoundingClientRect().left) / document.body.offsetWidth) * 2 - 1;
		mouse.y = -((mouseEvent.y - document.body.getBoundingClientRect().top) / document.body.offsetHeight) * 2 + 1;
		//这里为什么是-号，没有就无法点中
		rayCaster.setFromCamera(mouse, camera);
		let intersects = rayCaster.intersectObjects(bimEngine.D3Measure.AllModels, true);
		if (intersects.length) {
			let intersect = intersects[0]
			if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName == "PipeMesh") {
				var clickObj = IncludeElement(intersect.object.ElementInfos, intersect
					.point); //选中的构建位置信息
				if (clickObj != null && (intersect.object.hideElements == null || !intersect.object.hideElements
						.includes(clickObj.dbid))) {
					let EdgeList = intersect.object.ElementInfos[clickObj.dbid].EdgeList
					_signMeasure.PINK_DETAILS = getPinkType(bimEngine.scene, intersect, EdgeList)
				}
			} else if (intersects[0].object.TypeName == "InstancedMesh" || intersects[0].object.TypeName == "InstancedMesh-Pipe") {
				let EdgeList = intersect.object.ElementInfos[intersect.instanceId].EdgeList
				_signMeasure.PINK_DETAILS = getPinkType(bimEngine.scene, intersect, EdgeList)
			}
		}
		switch (_signMeasure.PINK_DETAILS.type) {
			// case "area":
			// 	if (intersects.length) {
			// 		//新增
			// 		let areaPoints = _signMeasure.PINK_DETAILS.val.map(item => {
			// 			let p = worldPointToScreenPoint(new THREE.Vector3(item.x, item.y, item.z), camera)
			// 			return p.x + ',' + p.y
			// 		})
			// 		bimEngine.D3Measure.MeasurePink_Area.style.display = "block";
			// 		bimEngine.D3Measure.MeasurePink_Area.firstChild.setAttribute('points', areaPoints.join(' '))
			// 	}
			// 	break;
			case "line":
				drawLine(bimEngine.scene, _signMeasure.PINK_DETAILS.line);
				break;
				// case "point":
				// 	if (_signMeasure.PINK_DETAILS.isCenter) {
				// 		let position = worldPointToScreenPoint(new THREE.Vector3(_signMeasure.PINK_DETAILS.val.x,
				// 			_signMeasure.PINK_DETAILS.val.y,
				// 			_signMeasure.PINK_DETAILS.val.z), camera);
				// 		MeasurePink_Triangle.style.display = "block";
				// 		MeasurePink_Triangle.style.top = (position.y - 5) + "px";
				// 		MeasurePink_Triangle.style.left = (position.x - 5) + "px";
				// 	} else {
				// 		let position = worldPointToScreenPoint(new THREE.Vector3(_signMeasure.PINK_DETAILS.val.x,
				// 			_signMeasure.PINK_DETAILS.val.y,
				// 			_signMeasure.PINK_DETAILS.val.z), camera);
				// 		MeasurePink_Quadrangle.style.top = (position.y) + "px";
				// 		MeasurePink_Quadrangle.style.left = (position.x) + "px";
				// 		MeasurePink_Quadrangle.style.width = "10px";
				// 		MeasurePink_Quadrangle.style.height = "10px";
				// 		MeasurePink_Quadrangle.style.transform = "translate(-50%,-50%)";
				// 		MeasurePink_Quadrangle.style.display = "block";
				// 	}
				// 	break;
		}
	}
	//点击捕捉测量点
	function HandleCatchMeasureLine(point) {
		const views = _signMeasure.Measures;
		for (let item of views) {
			let dis = GeometricOperation().PointDistanceLine(new THREE.Vector3(point.x, point.y, point.z),
				new THREE.Vector3(item.viewPoints[0].x, item.viewPoints[0].y, item.viewPoints[0].z),
				new THREE.Vector3(item.viewPoints[1].x, item.viewPoints[1].y, item.viewPoints[1].z));
			if (dis < 0.5) {
				//亮显
				const fs = bimEngine.scene.children.filter(x => x.name == "ViewMeasure");
				for (let f of fs) {
					if (f.Id == item.Id) {
						f.material.color = new THREE.Color(0, 0, 1);
					} else {
						f.material.color = new THREE.Color(0, 0, 0);
					}
				}
				return item;
			}
		} {
			const fs = bimEngine.scene.children.filter(x => x.name == "ViewMeasure");
			for (let f of fs) {
				f.material.color = new THREE.Color(0, 0, 0);
			}
		}
		return null;
	}

	return _signMeasure;
}
