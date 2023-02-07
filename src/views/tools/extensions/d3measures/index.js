const THREE = require('three');
import "@/views/tools/style/d3measure.scss"
import LoadJSON from "@/utils/LoadJSON.js"
import {
	worldPointToScreenPoint
} from "@/views/tools/common/index.js"
import {
	GeometricOperation
} from "@/views/tools/Geo/GeometricOperation.js"

import {
	drawCircle,
	drawLine,
	clearDrawLineModel,
	renderMeasurePink,
	getPinkType,
	IncludeElement
} from "../measures/MeasurePink"
import {
	LoadViewList
} from "./LoadViewList.js"
import {
	Vector2
} from "three";
import {
	SignMeasure
} from "./SignMeasure.js"
import {
	SignLineText
} from "./SignLineText.js"
import {
	SignMeasureLevel
} from "./SignMeasureLevel.js"
import {
	SignText
} from "./SignText.js"
import {
	SectionMask
} from "./SectionMask.js"
//3D测量
export function D3Measure(bimEngine) {
	var _D3Measure = new Object();
	_D3Measure.SignMeasure = new SignMeasure(bimEngine);
	_D3Measure.SignLineText = new SignLineText(bimEngine);
	_D3Measure.SignMeasureLevel = new SignMeasureLevel(bimEngine);
	_D3Measure.SignText = new SignText(bimEngine);



	//当前操作模式
	_D3Measure.MouseType = "none";
	//图纸比例尺
	_D3Measure.DrawingScale = 1;
	//绘制点
	_D3Measure.CurrentView = null;
	_D3Measure.HighLightView = null;
	// 视图列表
	_D3Measure.SectionViewLists = [];
	_D3Measure.ViewList = [];
	_D3Measure.Controls = [];
	_D3Measure.CurrentDragType = "none";
	_D3Measure.CurrentDragStart = null;
	_D3Measure.Callback = null;
	//默认有正交和透视图
	_D3Measure.ViewList.push({
		label: "三维正交",
		Id: guid(),
		ViewType: "3DOrthogonal",
	})
	_D3Measure.ViewList.push({
		label: "三维透视",
		Id: guid(),
		ViewType: "3DPerspective",
	})
	let AnimationFrame = null;

	function render() {
		AnimationFrame = requestAnimationFrame(render);
		updateControl();
	}
	render() //开启动画
	//更新视图列表
	_D3Measure.UpdateViewList = function(url) {
		LoadViewList(bimEngine, url);
	}
	//更新返回
	_D3Measure.UpdateCallback = function(callback) {
		_D3Measure.Callback = callback;
	}
	//删除视图剖面
	_D3Measure.DeleteView = function() {

	}
	//绘制剖面视图
	_D3Measure.CreatorUI = function() {
		CreatorUI();

	}
	//激活
	_D3Measure.Active = function() {
		creatorControl();
	}
	//禁用
	_D3Measure.DisActive = function() {


	}

	//获取当前视图类型
	_D3Measure.GetCurrentViewType = function() {
		let ViewType = GetCurrentViewType();
		return ViewType;
	}
	//获取相机工作平面
	_D3Measure.GetCameraWorkPlane = function() {
		let cameraDir = new THREE.Vector3();
		bimEngine.scene.camera.getWorldDirection(cameraDir);
		//然后是获取位置
		let point = bimEngine.scene.camera.position;
		let dis = GeometricOperation().PointProjectPointDirDis(cameraDir.clone().normalize(), new THREE.Vector3(),
			point) + 1;
		//计算方向
		let dot = (point.clone().sub(new THREE.Vector3)).dot(cameraDir.clone());
		let plane = new THREE.Plane(cameraDir.clone().multiplyScalar(-1).normalize().multiplyScalar(dot > 0 ? -1 :
			1).clone().normalize(), dis);
		return plane;
	}
	//绘制剖面视图
	_D3Measure.CreatorSection = function() {
		let ViewType = GetCurrentViewType();
		if (ViewType == "D3") {
			return;
		}
		//三维视图跳过，平面视图保留
		_D3Measure.MouseType = "DrawSection";
		_D3Measure.CurrentView = {
			viewPoints: [],
			Id: guid(),
			workerPlane: _D3Measure.GetCurrentWorkPlane(),
			type: "UserDraw",
			label: "新剖面",
			ViewType: "剖面视图"
		};
		addEventLicense();
	}
	//绘制剖面线
	_D3Measure.DrawSelectLines = function(viewLists) {
		DrawSelectLines(viewLists);
	}
	//清除剖面数据
	_D3Measure.Clear = function() {

	}
	//删除选中的视图
	_D3Measure.DeleteSectionView = function(id, tips = false) {
		// 返回 false/true 
		if (tips) {
			let res = confirm('确认要删除视图吗？');
			if (res == false) {
				return;
			}
		}
		let index = _D3Measure.SectionViewLists.findIndex(x => x.Id == id);
		if (index != 1) {
			_D3Measure.SectionViewLists.splice(index, 1);
		}
		let camera_index = bimEngine.ArrayCamera.cameras.findIndex(x => x.Id == id);
		if (camera_index != -1) {
			bimEngine.ArrayCamera.cameras.splice(camera_index, 1);
		}
		let model_index = bimEngine.scene.children.findIndex(x => x.Id == id);
		if (model_index != -1) {
			bimEngine.scene.children.splice(model_index, 1)
		}
		if (bimEngine.ArrayCamera.cameras.length > 0) {
			//切换到指定视图
			bimEngine.MultiView.SwitchView(bimEngine, bimEngine.ArrayCamera.cameras[0])
		} else {
			//新增一个视图
			window.bimEngine.MultiView.New3DPerspective(window.bimEngine);
		}
		_D3Measure.HighLightView = null;
		UpdataViewListUI();
	}
	//获取当前工作平面
	_D3Measure.GetCurrentWorkPlane = function() {
		if (bimEngine.WorkPlane != null) {
			return bimEngine.WorkPlane;
		} else {
			//取相机正对的平面作为工作平面 
			let plane = _D3Measure.GetCameraWorkPlane();
			bimEngine.WorkPlane = plane;
			return plane;
		}
	}
	//拾取工作平面
	_D3Measure.HandleWorkPlane = function() {
		let pinks = renderMeasurePink('MeasurePoint') //渲染捕捉点
		_D3Measure.MeasurePink_Triangle = pinks.Triangle;
		_D3Measure.MeasurePink_Quadrangle = pinks.Quadrangle;
		_D3Measure.MeasurePink_Area = pinks.Area;
		_D3Measure.MouseType = "HandlePlane";
		addEventLicense();
		_D3Measure.AllModels = bimEngine.GetAllVisibilityModel();
		bimEngine.StopClick = true;
	}
	/*************************************************************获取数据***************************************************************/
	//更新视图数据
	function UpdataViewListUI() {
		let index = _D3Measure.ViewList.findIndex(x => x.label == "剖面视图");
		if (index == -1) {
			_D3Measure.ViewList.push({
				Id: guid(),
				label: "剖面视图",
				children: []
			});
			index = _D3Measure.ViewList.findIndex(x => x.label == "剖面视图");
		}
		if (_D3Measure.SectionViewLists.length == 0) {
			_D3Measure.ViewList[index].children = [];
		} else {
			//多出来的也要删掉
			for (let i = _D3Measure.ViewList[index].children.length - 1; i >= 0; i--) {
				if (_D3Measure.SectionViewLists.findIndex(x => x.Id == _D3Measure.ViewList[index].children[i].Id) == -
					1) {
					_D3Measure.ViewList[index].children.splice(i, 1);
				}
			}
		}
		for (let view of _D3Measure.SectionViewLists) {
			let index_ = _D3Measure.ViewList[index].children.findIndex(x => x.Id == view.Id);
			//设置viewData
			view.ViewData = GetViewData(view);
			if (index_ == -1) {
				_D3Measure.ViewList[index].children.push(view);
			} else {
				_D3Measure.ViewList[index].children[index_] = view;
			}
		}
	}
	//更新视图相机，更新视图名称
	function UpdateCamera() {



	}
	//获取ViewData
	function GetViewData(view) {
		let viewdata = {
			Id: view.Id,
			Name: view.label,
			Origin: GetToVector3(view.viewPoints[0]).add(GetToVector3(view.viewPoints[1])).multiplyScalar(0.5),
			ViewType: "立面视图",
			ViewDirection: GetToVector3(view.diry)
		}
		return viewdata;
	}
	//创建剖面视图
	function CreatorSelectViewLine() {
		addEventLicense();
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
		// _container.removeEventListener('pointerup', onMouseUp);
		_container.removeEventListener('pointermove', onMouseMove);
		//清除一些标记 
		clearDrawLineModel(bimEngine.scene);
		let root = document.getElementById("MeasurePoint");
		if (root != null) {
			root.remove();
		}
		bimEngine.StopClick = false;
	}
	//按下键盘事件,按下ESC清空所有事件和UI
	function onKeyDown(e) {

		if (e.keyCode == 27) {
			removeEventLicense();
		} else if (e.keyCode == 8 || e.keyCode == 46) {
			let measure = _D3Measure.HighLightView;
			_D3Measure.DeleteSectionView(measure.Id, true);
		}
	}
	//鼠标按下
	function onMouseDown(event) {
		if (event.button != 0) {
			return;
		}
		_D3Measure.mouse = mousePosition(event);
		//拾取工作平面
		if (_D3Measure.MouseType == "HandlePlane") {
			//获取鼠标按下数据
			let mouse = mousePosition(event);
			let rayCaster = new THREE.Raycaster();
			rayCaster.setFromCamera(mouse, bimEngine.scene.camera);
			let intersects = (rayCaster.intersectObjects(bimEngine.GetAllVisibilityModel(), true));
			if (intersects.length > 0) {
				// console.log(intersects);
				let dis = GeometricOperation().PointProjectPointDirDis(intersects[0].face.normal.clone().normalize(),
					new THREE
					.Vector3(), intersects[0].point);

				let dot = (intersects[0].point.clone().sub(new THREE.Vector3)).dot(intersects[0].face.normal.clone());
				//重新计算面的方向
				let plane = new THREE.Plane(intersects[0].face.normal.multiplyScalar(dot > 0 ? -1 : 1).clone()
					.normalize(), dis);
				bimEngine.WorkPlane = plane;
				_D3Measure.MouseType = "none";
				removeEventLicense();
			}
		}
		//绘制剖面线，
		if (_D3Measure.MouseType == "DrawSection") {
			let point = GetRayWorldPointPlane(_D3Measure.mouse);
			if (point == null) {
				return;
			}
			if (_D3Measure.CurrentView.viewPoints.length == 0) {
				//一个点都没有
				_D3Measure.CurrentView.viewPoints.push(point);
			} else if (_D3Measure.CurrentView.viewPoints.length == 1) {
				//有一个点
				if (event.shiftKey != 1) {
					point = HandleCatch(_D3Measure.CurrentView.viewPoints[0], point, _D3Measure.CurrentView
						.workerPlane);
				}
				_D3Measure.CurrentView.viewPoints.push(point);
			} else if (_D3Measure.CurrentView.viewPoints.length == 2) {
				//有两个点,绘制第三个点
				_D3Measure.CurrentView.viewPoints.push(point);
				_D3Measure.SectionViewLists.push(JSON.parse(JSON.stringify(_D3Measure.CurrentView)));
				let index = bimEngine.scene.children.findIndex(x => x.Id == "temp");
				bimEngine.scene.children[index].Id = _D3Measure.CurrentView.Id;
				_D3Measure.MouseType = "none";
			}
			// console.log(_D3Measure.CurrentView.viewPoints)
		}
		if (_D3Measure.MouseType == "none") {
			setTimeout(function() {
				let point = GetRayWorldPointPlane(_D3Measure.mouse);
				var current = HandleCatchViewLine(point);
				if (_D3Measure.MouseType == "DragView") {
					return;
				}
				_D3Measure.HighLightView = current;
			}, 100);
		}
	}
	//鼠标弹起
	function onMouseUp(event) {
		if (event.button != 0) {
			return;
		}
		UpdataViewListUI();
		_D3Measure.mouse = mousePosition(event);
		if (_D3Measure.MouseType == "DragView") {
			_D3Measure.MouseType = "none"
			_D3Measure.CurrentDragType = "none";
			_D3Measure.CurrentDragClone = null;
			return;
		}

	}
	//鼠标移动
	function onMouseMove(event) {
		_D3Measure.mouse = mousePosition(event);
		if (_D3Measure.MouseType == "HandlePlane") {
			Animate_MeasurePointPink(event);
		}
		//绘制剖面线，
		if (_D3Measure.MouseType == "DrawSection") {
			let point = GetRayWorldPointPlane(_D3Measure.mouse);
			if (point == null) {
				return;
			}
			//开启捕捉
			if (event.shiftKey != 1 && _D3Measure.CurrentView.viewPoints.length > 0) {
				point = HandleCatch(_D3Measure.CurrentView.viewPoints[0], point, _D3Measure.CurrentView.workerPlane);
			}
			_D3Measure.CurrentView.currentPoint = point.clone();
			DrawSelectLineTemp(_D3Measure.CurrentView);
		}
		if (_D3Measure.MouseType == "none") {
			let point = GetRayWorldPointPlane(_D3Measure.mouse);
			//选择捕捉剖面
			HandleCatchViewLine(point);
		}
		if (_D3Measure.MouseType == "DragView") {
			let point = GetRayWorldPointPlane(_D3Measure.mouse);
			ViewDrag(point);
			updateControl();
		}
	}

	function ViewDrag(point) {
		let view = _D3Measure.HighLightView
		if (_D3Measure.CurrentDragType == "Top") {
			let renderPoints = [];
			//第一个点
			renderPoints.push(view.viewPoints[0]);
			//第二个点
			renderPoints.push(view.viewPoints[1]);
			//第三个点
			renderPoints.push(point);
			SelectLine(_D3Measure.HighLightView.Id, renderPoints, false);
		}
		//判断方向 
		if (_D3Measure.CurrentDragType == "Right") {
			let renderPoints = [];
			if (GetToVector3(_D3Measure.HighLightView.diry).clone().dot(GetToVector3(_D3Measure.HighLightView.disDir)
					.clone()) < 0) {
				let dis = GeometricOperation().PointDistanceToVector(point, GetToVector3(view.viewPoints[0]),
					GetToVector3(
						view.diry))
				//第一个点
				renderPoints.push(view.viewPoints[0]);
				//第二个点
				renderPoints.push(GetToVector3(view.viewPoints[0]).clone().add(GetToVector3(view.dirx).multiplyScalar(
					dis)));
				//第三个点
				renderPoints.push(view.viewPoints[2]);
			} else {
				let dis = GeometricOperation().PointDistanceToVector(point, GetToVector3(view.viewPoints[1]),
					GetToVector3(
						view.diry))
				//第一个点 
				renderPoints.push(GetToVector3(view.viewPoints[1]).clone().sub(GetToVector3(view.dirx).multiplyScalar(
					dis)));
				//第二个点
				renderPoints.push(view.viewPoints[1]);
				//第三个点
				renderPoints.push(view.viewPoints[2]);
			}
			SelectLine(_D3Measure.HighLightView.Id, renderPoints, false);
		}
		if (_D3Measure.CurrentDragType == "Left") {
			let renderPoints = [];
			if (GetToVector3(_D3Measure.HighLightView.diry).clone().dot(GetToVector3(_D3Measure.HighLightView.disDir)
					.clone()) < 0) {
				let dis = GeometricOperation().PointDistanceToVector(point, GetToVector3(view.viewPoints[1]),
					GetToVector3(
						view.diry))
				//第一个点 
				renderPoints.push(GetToVector3(view.viewPoints[1]).clone().sub(GetToVector3(view.dirx).multiplyScalar(
					dis)));
				//第二个点
				renderPoints.push(view.viewPoints[1]);
				//第三个点
				renderPoints.push(view.viewPoints[2]);
			} else {
				let dis = GeometricOperation().PointDistanceToVector(point, GetToVector3(view.viewPoints[0]),
					GetToVector3(
						view.diry))
				//第一个点
				renderPoints.push(view.viewPoints[0]);
				//第二个点
				renderPoints.push(GetToVector3(view.viewPoints[0]).clone().add(GetToVector3(view.dirx).multiplyScalar(
					dis)));
				//第三个点
				renderPoints.push(view.viewPoints[2]);
			}
			SelectLine(_D3Measure.HighLightView.Id, renderPoints, false);
		}
		if (_D3Measure.CurrentDragType == "Dir") {

		}
		if (_D3Measure.CurrentDragType == "Range") {
			//移动剖面框
			if (_D3Measure.CurrentDragClone == null) {
				return;
			}
			view = _D3Measure.CurrentDragClone;
			let start = _D3Measure.CurrentDragStart;
			let movedir = point.clone().sub(_D3Measure.CurrentDragStart.clone());
			let renderPoints = [];
			//第一个点
			renderPoints.push(GetToVector3(view.viewPoints[0]).add(movedir));
			//第二个点
			renderPoints.push(GetToVector3(view.viewPoints[1]).add(movedir));
			//第三个点
			renderPoints.push(GetToVector3(view.viewPoints[2]).add(movedir));
			SelectLine(_D3Measure.HighLightView.Id, renderPoints, false);
		}
	}
	//一些常用的方法 
	//创建UI界面
	function CreatorUI() {

	}
	//绘制剖面线
	function DrawSelectLines(viewLists) {
		for (var view of viewLists) {
			DrawSelectLine(view);
		}
	}
	//绘制剖面线，临时
	function DrawSelectLineTemp(view) {
		if (view.viewPoints.length == 0) {
			return;
		} else if (view.viewPoints.length == 1) {
			let renderPoints = [];
			//第一个点
			renderPoints.push(view.viewPoints[0]);
			//第二个点
			renderPoints.push(view.currentPoint);
			//第三个点
			let dir = view.currentPoint.clone().sub(view.viewPoints[0]);
			let nomal = view.workerPlane.normal;
			view.disDir = dir.clone().cross(nomal.clone()).normalize();
			// renderPoints.push((view.viewPoints[0].clone().add(view.currentPoint)).add(view.disDir));
			//绘制线条
			SelectLine("temp", renderPoints, false);
		} else if (view.viewPoints.length == 2) {
			let renderPoints = [];
			//第一个点
			renderPoints.push(view.viewPoints[0]);
			//第二个点
			renderPoints.push(view.viewPoints[1]);
			//第三个点
			renderPoints.push(view.currentPoint);
			SelectLine("temp", renderPoints, false);
		}
	}
	//绘制剖面线
	function DrawSelectLine(view) {
		//view 的结构数据 计算管件参数 
		view = {
			//相机位置
			Origin: new THREE.Vector3(),
			//视图方向
			ViewDirection: new THREE.Vector3(1, 0, 0),
			Name: "管综剖面11",
			Id: "a25d2d62-c0ff-44f4-a031-6e0773d3fdb8-00132ad8",
			Rules: "建筑",
			SubRules: null,
			ViewType: "剖面视图",
			Width: 12,
			Height: 10,
			Deep: 1
		};
		// 创建视图
	}
	//剖面示意线条
	function SelectLine(id, points) {
		/*
		       ------------------center-----------------
		       |                                       |
			   |                                       |
			   |start                                  |end
			 ---------------------------------------------
		*/
		let start = GetToVector3(points[0]);
		let end = GetToVector3(points[1]);
		let center = points.length == 3 ? GetToVector3(points[2]) : null;
		let linePoints = [];
		let l = 1 / _D3Measure.DrawingScale;
		let plane = _D3Measure.GetCameraWorkPlane();
		let dirx = end.clone().sub(start.clone()).normalize();
		let diry = dirx.clone().cross(plane.normal).normalize();
		//临时交点
		let dis = center == null ? 1 : GeometricOperation().PointDistanceLineExtend(center, start, end);
		let disdir = center == null ? 1 : center.clone().sub(start.clone()).dot(diry) > 0 ? 1 : -1;
		diry = diry.multiplyScalar(disdir);
		_D3Measure.CurrentView.dis = dis;
		_D3Measure.CurrentView.diry = diry;
		_D3Measure.CurrentView.dirx = dirx;
		let inter1 = start.clone().add(diry.clone().setLength(dis));
		let inter2 = end.clone().add(diry.clone().setLength(dis));
		//线首 
		linePoints.push(start.clone().add(dirx.clone().setLength(-l)).add(diry.clone().setLength(l)));
		linePoints.push(start.clone().add(dirx.clone().setLength(-l)));
		linePoints.push(end.clone().add(dirx.clone().setLength(l)));
		linePoints.push(end.clone().add(dirx.clone().setLength(l)).add(diry.clone().setLength(l)));
		//激活的状态  
		//首先判断视图中是否存在相应的线条
		let index = bimEngine.scene.children.findIndex(x => x.Id == id);
		if (index != -1) {
			//已存在图形，更新形状
			let mesh = bimEngine.scene.children[index];
			for (let i = 0; i < linePoints.length; i++) {
				mesh.geometry.attributes.position.array[3 * i + 0] = linePoints[i].x;
				mesh.geometry.attributes.position.array[3 * i + 1] = linePoints[i].y;
				mesh.geometry.attributes.position.array[3 * i + 2] = linePoints[i].z;
			}
			mesh.geometry.attributes.position.needsUpdate = true;
			//修改视图数据参数
			let viewIndex = _D3Measure.SectionViewLists.findIndex(x => x.Id == id);
			if (viewIndex != -1) {
				_D3Measure.SectionViewLists[viewIndex].viewPoints = points;
				_D3Measure.SectionViewLists[viewIndex].dis = dis;
				_D3Measure.SectionViewLists[viewIndex].diry = diry;
				_D3Measure.SectionViewLists[viewIndex].dirx = dirx;
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
			var mesh = new THREE.Line(geometry, material);
			mesh.name = "ViewSection";
			mesh.Id = id;
			bimEngine.scene.add(mesh);
		}
		//更新UI控制按钮及文字 
		return null;
	}
	//创建控制器
	function creatorControl() {
		let control = document.createElement("div");
		control.id = "ViewControlRoot";
		control.className = "ViewControlRoot";
		control.style.visibility = "hidden";
		_D3Measure.Controls.push(control);
		//方向控制器
		let control_top = document.createElement("div");
		control_top.className = "ViewControl_Top";
		control_top.id = "ViewControl_Top";
		control_top.innerHTML = "◄►";
		control.appendChild(control_top);
		let control_left = document.createElement("div");
		control_left.className = "ViewControl_Left";
		control_left.id = "ViewControl_Left"
		control_left.innerHTML = "◄►";
		control.appendChild(control_left);
		let control_right = document.createElement("div");
		control_right.className = "ViewControl_Right";
		control_right.id = "ViewControl_Right";
		control_right.innerHTML = "◄►";
		control.appendChild(control_right);
		_D3Measure.Controls.push(control_top);
		_D3Measure.Controls.push(control_left);
		_D3Measure.Controls.push(control_right);
		//视图文字
		let text = document.createElement("div");
		text.className = "ViewText";
		text.id = "ViewText";
		text.innerHTML = "222"
		control.appendChild(text);
		_D3Measure.Controls.push(text);
		//方向键
		let handleDir = document.createElement("div");
		handleDir.className = "ViewhandleDir";
		handleDir.id = "ViewhandleDir";
		handleDir.innerHTML = "⇄"
		control.appendChild(handleDir);
		_D3Measure.Controls.push(handleDir);
		//范围框
		let handleRange = document.createElement("div");
		handleRange.className = "ViewhandleRange";
		handleRange.id = "ViewhandleRange";
		control.appendChild(handleRange);
		_D3Measure.Controls.push(handleRange);
		//获取数据***********************************************************
		var _container = bimEngine.scene.renderer.domElement.parentElement;
		_container.appendChild(control);
		//注册拖拽事件 
		control_top.addEventListener("mousedown", function(res) {
			event.stopPropagation();
			_D3Measure.MouseType = "DragView"
			_D3Measure.CurrentDragType = "Top"
		});
		control_left.addEventListener("mousedown", function(res) {
			event.stopPropagation();
			_D3Measure.MouseType = "DragView"
			_D3Measure.CurrentDragType = "Left"
		})
		control_right.addEventListener("mousedown", function(res) {
			event.stopPropagation();
			_D3Measure.MouseType = "DragView"
			_D3Measure.CurrentDragType = "Right"
		})
		text.addEventListener("mousedown", function(res) {
			// event.stopPropagation(); 
			//弹出输入框，设置名字
			var ret = prompt('请输入视图名称', _D3Measure.HighLightView.label);
			_D3Measure.HighLightView.label = ret
		})
		handleDir.addEventListener("mousedown", function(res) {
			_D3Measure.HighLightView.disDir = GetToVector3(_D3Measure.HighLightView.disDir).clone()
				.multiplyScalar(-1);
			_D3Measure.HighLightView.diry = GetToVector3(_D3Measure.HighLightView.diry).clone()
				.multiplyScalar(-1);
			// SelectLine(_D3Measure.HighLightView.Id, _D3Measure.HighLightView.viewPoints, false);
		})
		handleRange.addEventListener("mousedown", function(res) {
			event.stopPropagation();
			_D3Measure.MouseType = "DragView"
			_D3Measure.CurrentDragType = "Range"
			let point = GetRayWorldPointPlane(_D3Measure.mouse);
			_D3Measure.CurrentDragStart = point.clone();
			_D3Measure.CurrentDragClone = JSON.parse(JSON.stringify(_D3Measure.HighLightView))
		})
	}
	//更新控制器
	function updateControl() {
		if (_D3Measure.Controls.length == 0) {
			return;
		}
		let control = _D3Measure.Controls[0];
		if (_D3Measure.HighLightView == null) {
			//关闭控制器
			control.style.visibility = "hidden";
			return;
		} else {
			//更新控制器
			control.style.visibility = "visible";
		}
		//更新控制器 
		let disDir = GetToVector3(_D3Measure.HighLightView.diry);
		//直线的终点
		let lineCenter = GetToVector3(_D3Measure.HighLightView.viewPoints[0]).clone().add(GetToVector3(_D3Measure
			.HighLightView.viewPoints[1]).clone()).multiplyScalar(0.5);
		//顶部终点
		let point_top = lineCenter.clone().add(GetToVector3(disDir.clone().multiplyScalar(_D3Measure.HighLightView.dis)
			.clone()));
		//左边顶上
		let left_top = GetToVector3(_D3Measure.HighLightView.viewPoints[0]).add(GetToVector3(disDir.clone()
			.multiplyScalar(_D3Measure
				.HighLightView.dis).clone()));
		//右边顶上
		let right_top = GetToVector3(_D3Measure.HighLightView.viewPoints[1]).add(GetToVector3(disDir.clone()
			.multiplyScalar(_D3Measure
				.HighLightView.dis).clone()));

		let point_left = GetToVector3(_D3Measure.HighLightView.viewPoints[0]).add(left_top.clone()).multiplyScalar(0.5);
		let point_right = GetToVector3(_D3Measure.HighLightView.viewPoints[1]).add(right_top.clone()).multiplyScalar(
			0.5);
		//计算各个点的位置 
		let point_dir = GetToVector3(_D3Measure.HighLightView.viewPoints[0]).sub(GetToVector3(disDir.clone()
			.multiplyScalar(0.5).clone()));
		let point_text = GetToVector3(_D3Measure.HighLightView.viewPoints[0]).add(GetToVector3(disDir.clone()
			.multiplyScalar(0.5).clone()));
		//获取数据
		let screen_start = get2DVec(GetToVector3(_D3Measure.HighLightView.viewPoints[0]).clone());
		let screen_end = get2DVec(GetToVector3(_D3Measure.HighLightView.viewPoints[1]).clone());
		let screen_left_top = get2DVec(left_top.clone());
		let screen_right_top = get2DVec(right_top.clone());
		let orign = get2DVec(new THREE.Vector3());
		let orign_dir = get2DVec(GetToVector3(_D3Measure.HighLightView.diry));

		let width = (new THREE.Vector2(screen_start.x, screen_start.y)).distanceTo(new THREE.Vector2(screen_end.x,
			screen_end.y));
		let height = (new THREE.Vector2(screen_start.x, screen_start.y)).distanceTo(new THREE.Vector2(screen_left_top.x,
			screen_left_top.y));

		let angel = (new THREE.Vector2(orign_dir.x - orign.x, orign_dir.y - orign.y)).angle(new THREE
			.Vector2(0, 1));

		angel = 180 * angel / Math.PI;
		// console.log(_D3Measure.HighLightView.diry, angel)
		// 上
		const HEIGHT = (window.innerHeight) * window.devicePixelRatio;
		let basex = bimEngine.scene.camera.viewport.x;
		let basey = bimEngine.scene.camera.viewport.y;
		let maxx = basex + bimEngine.scene.camera.viewport.z;
		let maxy = basey + bimEngine.scene.camera.viewport.w;

		let offx = basex + (get2DVec(point_left.clone()).y * 0.5 + get2DVec(point_right.clone()).y *
			0.5)
		let offy = basey + (get2DVec(point_left.clone()).x * 0.5 + get2DVec(point_right.clone()).x *
			0.5);
		_D3Measure.Controls[0].style.top = offx + "px";
		_D3Measure.Controls[0].style.left = offy + "px";
		if (offx > maxx || offy > maxy || offx < basex || offy < basey) {
			_D3Measure.Controls[0].style.visibility = "hidden";
			console.log(basex, basey, offx, offy, maxx, maxy);
		} else {
			_D3Measure.Controls[0].style.visibility = "visible";
		}
		// _D3Measure.Controls[0].style.transformorigin = "center";
		_D3Measure.Controls[0].style.transform = "translate(-50%,-50%) rotate(" + (angel + 90) + "deg) ";
		_D3Measure.Controls[0].style.width = width + "px";
		_D3Measure.Controls[0].style.height = height + "px";
		_D3Measure.Controls[4].innerHTML = _D3Measure.HighLightView.label
	}
	//创建视图前遮罩
	function CreatorViewMask_Front(view) {
		let point = view.Origin;
		/*
		      ⑤---------------------------------------⑥
		      |                                       |
		      |              ①----------②             |
		      |              |          |             |
		      |              |     o    |             |
	          |              |          |             |
		      |              ④----------③             |
		      |                                       |
		      ⑧---------------------------------------⑦
		*/
		//获取数据
		let dirx = new THREE.Vector3(1, 0, 0);
		let diry = new THREE.Vector3(0, 1, 0);
		//8个顶点
		let p1 = point.clone().add(dirx.clone().multiply(-view.Width)).add(diry.clone().multiply(view.Height));
		let p2 = point.clone().add(dirx.clone().multiply(view.Width)).add(diry.clone().multiply(view.Height));
		let p3 = point.clone().add(dirx.clone().multiply(view.Width)).add(diry.clone().multiply(-view.Height));
		let p4 = point.clone().add(dirx.clone().multiply(-view.Width)).add(diry.clone().multiply(-view.Height));

		let p5 = point.clone().add(dirx.clone().multiply(-10000000)).add(diry.clone().multiply(10000000));
		let p6 = point.clone().add(dirx.clone().multiply(10000000)).add(diry.clone().multiply(10000000));
		let p7 = point.clone().add(dirx.clone().multiply(10000000)).add(diry.clone().multiply(-10000000));
		let p8 = point.clone().add(dirx.clone().multiply(-10000000)).add(diry.clone().multiply(-10000000));
		var geometry = new THREE.BufferGeometry(); //声明一个空几何体对象
		geometry.vertices.push(p1, p2, p3, p4, p5, p6, p7, p8); //顶点坐标添加到geometry对象 
		geometry.faces.push(new THREE.Face3(0, 5, 4, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(0, 1, 5, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(1, 6, 5, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(1, 2, 6, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(2, 3, 6, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(3, 7, 6, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(0, 7, 3, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(0, 4, 7, normal)); //三角面添加到几何体
		var mesh = new THREE.Mesh(geometry, material); //网格模型对象
		mesh.name = "ViewMask";
		mesh.view = view;
		bimEngine.scene.add(mesh);
		//绘制视图范围边线
		renderMaskSide([p1, p2, p2, p3, p3, p4, p4, p1]);
	}
	//创建视图后遮罩
	function CreatorViewMask_Back(view) {
		let point = view.Origin;
		//获取数据
		let dirx = new THREE.Vector3(1, 0, 0);
		let diry = new THREE.Vector3(0, 1, 0);
		//获取数据
		let p5 = point.clone().add(dirx.clone().multiply(-10000000)).add(diry.clone().multiply(10000000));
		let p6 = point.clone().add(dirx.clone().multiply(10000000)).add(diry.clone().multiply(10000000));
		let p7 = point.clone().add(dirx.clone().multiply(10000000)).add(diry.clone().multiply(-10000000));
		let p8 = point.clone().add(dirx.clone().multiply(-10000000)).add(diry.clone().multiply(-10000000));

		var geometry = new THREE.BufferGeometry(); //声明一个空几何体对象
		geometry.vertices.push(p5, p6, p7, p8); //顶点坐标添加到geometry对象 
		geometry.faces.push(new THREE.Face3(0, 1, 2, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(0, 2, 3, normal)); //三角面添加到几何体
		var mesh = new THREE.Mesh(geometry, material); //网格模型对象
		mesh.name = "ViewMask";
		mesh.view = view;
		bimEngine.scene.add(mesh);
	}
	//渲染遮罩边线
	function renderMaskSide(points) {
		var geometry = new THREE.BufferGeometry(); //声明一个空几何体对象
		geometry.vertices = points;
		var material_ = new THREE.MeshBasicMaterial({
			color: 0x000000, //三角面颜色 
			wireframe: true,
			linewidth: 100,
			depthTest: false
		});
		CurrentLines = [];
		CurrentLines.push({
			start: points[0],
			end: points[1]
		})
		CurrentLines.push({
			start: points[2],
			end: points[3]
		})
		CurrentLines.push({
			start: points[4],
			end: points[5]
		})
		CurrentLines.push({
			start: points[6],
			end: points[7]
		})
		var lines = new THREE.Line(geometry, material_, THREE.LinePieces);
		bimEngine.scene.add(lines);
	}
	//创建视图操纵柄
	function CreatorViewControl(dom) {
		let htmls = [
			'<div class="ViewControl_Top">◄►</div>',
			'<div class="ViewControl_Botton">◄►</div>',
			'<div class="ViewControl_Left">◄►</div>',
			'<div class="ViewControl_Right">◄►</div>'
		].join('');
		dom.innerHTML = htmls;

	}
	//相机位置刷新
	function CameraUpdate() {

	}
	//获取视图类型
	function GetCurrentViewType() {
		let cameraType = bimEngine.scene.camera.ControlType;
		if (cameraType == "D3") {
			return "D3";
		} else {
			return "Plane";
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
	//屏幕坐标转世界坐标

	//世界坐标转屏幕坐标 
	function get2DVec(vector3) {
		const stdVector = vector3.project(bimEngine.scene.camera);
		const a = bimEngine.scene.camera.viewport.z / 2;
		const b = bimEngine.scene.camera.viewport.w / 2;
		const x = Math.round(stdVector.x * a + a);
		const y = Math.round(-stdVector.y * b + b);
		return new THREE.Vector2(x, y);
	}
	//对象转Vector3
	function GetToVector3(point) {
		return new THREE.Vector3(point.x, point.y, point.z);
	}
	//展示捕捉的位置
	function Animate_MeasurePointPink(mouseEvent) {
		let camera = bimEngine.scene.camera;
		_D3Measure.MeasurePink_Quadrangle.style.display = "none";
		_D3Measure.MeasurePink_Triangle.style.display = "none";
		_D3Measure.MeasurePink_Area.style.display = "none";
		clearDrawLineModel(bimEngine.scene)
		let PINK_DETAILS = {
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
		let intersects = rayCaster.intersectObjects(_D3Measure.AllModels, true);
		if (intersects.length) {
			let intersect = intersects[0]
			if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName == "PipeMesh") {
				var clickObj = IncludeElement(intersect.object.ElementInfos, intersect
					.point); //选中的构建位置信息
				if (clickObj != null && (intersect.object.hideElements == null || !intersect.object.hideElements
						.includes(clickObj.dbid))) {
					let EdgeList = intersect.object.ElementInfos[clickObj.dbid].EdgeList
					PINK_DETAILS = getPinkType(bimEngine.scene, intersect, EdgeList)
				}
			} else if (intersects[0].object.TypeName == "InstancedMesh") {
				let EdgeList = intersect.object.ElementInfos[intersect.instanceId].EdgeList
				PINK_DETAILS = getPinkType(bimEngine.scene, intersect, EdgeList)
			}
		}
		switch (PINK_DETAILS.type) {
			case "area":
				if (intersects.length) {
					//新增
					let areaPoints = PINK_DETAILS.val.map(item => {
						let p = worldPointToScreenPoint(new THREE.Vector3(item.x, item.y, item.z), camera)
						return p.x + ',' + p.y
					})
					_D3Measure.MeasurePink_Area.style.display = "block";
					_D3Measure.MeasurePink_Area.firstChild.setAttribute('points', areaPoints.join(' '))
				}
				break;
		}
	}
	//获取射线选择的点
	function GetRayWorldPoint(mouse) {
		let rayCaster = new THREE.Raycaster();
		rayCaster.setFromCamera(mouse, bimEngine.scene.camera);
		let intersects = (rayCaster.intersectObjects(_D3Measure.GetCurrentWorkPlane(), true));
		if (intersects.length > 0) {
			let pp = intersects[0].point.clone();
			return pp;
		}
	}
	//获取射线在平面上选择的点
	function GetRayWorldPointPlane(mouse) {
		let plane = _D3Measure.GetCurrentWorkPlane();
		// let rayCaster = new THREE.Raycaster();
		// rayCaster.setFromCamera(mouse, bimEngine.scene.camera);
		// var startPickPoint = rayCaster.ray.intersectPlane(plane);
		// return startPickPoint;


		let pX = mouse.x;
		let pY = mouse.y;

		let p = new THREE.Vector3(pX, pY, -1).unproject(bimEngine.scene.camera)
		let p_ = new THREE.Vector3(pX, pY, -1000000000).unproject(bimEngine.scene.camera);
		var point3D = p;
		var rayCast = new THREE.Raycaster();
		var rayDir = point3D.clone().sub(p_).setLength(1000000);
		rayCast.set(point3D.clone().sub(rayDir), rayDir);
		// let plane = _signMeasure.CurrentMeasure.workerPlane;
		var startPickPoint = rayCast.ray.intersectPlane(plane);
		return startPickPoint;


	}

	function guid() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	//捕捉关键点
	function HandleCatch(point1, point2, plane) {
		let nomal = plane.normal;
		let dirx = new THREE.Vector3(1, 0, 0);
		let diry = new THREE.Vector3(0, 0, 1);
		if (nomal.x == 0 && nomal.z == 0) {
			//直的
			let dirx = new THREE.Vector3(1, 0, 0);
			let diry = new THREE.Vector3(0, 0, 1);
		} else {
			//斜的
			let dirx = nomal.clone().cross(new THREE.Vector3(0, 1, 0)).normalize();
			let diry = nomal.clone().cross(dirx).normalize();
		}
		//计算向量夹角
		let dir = point2.clone().sub(point1.clone());
		//首先是x轴方向
		{
			let angle = dir.angleTo(dirx);
			if (Math.abs(angle) <= Math.PI * 0.01 || Math.abs(angle) >= Math.PI * (1 - 0.01)) {
				//返回捕捉到的点
				let p = GeometricOperation().PointProjectLine(point2, point1, point1.clone().add(dirx));
				return p.clone();
			}
		}
		//其次是y轴方向
		{
			let angle = dir.angleTo(diry);
			if (Math.abs(angle) <= Math.PI * 0.01 || Math.abs(angle) >= Math.PI * (1 - 0.01)) {
				//返回捕捉到的点
				let p = GeometricOperation().PointProjectLine(point2, point1, point1.clone().add(diry));
				return p.clone();
			}
		}
		return point2.clone();
	}
	//鼠标捕捉线条
	function HandleCatchViewLine(point) {
		if (point == null) {
			return;
		}
		const views = _D3Measure.SectionViewLists;
		for (let item of views) {
			let dis = GeometricOperation().PointDistanceLine(new THREE.Vector3(point.x, point.y, point.z),
				new THREE.Vector3(item.viewPoints[0].x, item.viewPoints[0].y, item.viewPoints[0].z),
				new THREE.Vector3(item.viewPoints[1].x, item.viewPoints[1].y, item.viewPoints[1].z));
			if (dis < 0.5) {
				//亮显
				const fs = bimEngine.scene.children.filter(x => x.name == "ViewSection");
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
			const fs = bimEngine.scene.children.filter(x => x.name == "ViewSection");
			for (let f of fs) {
				f.material.color = new THREE.Color(0, 0, 0);
			}
		}
		return null;
	}
	return _D3Measure;
}
