import {
	GeometricOperation
} from "@/views/tools/Geo/GeometricOperation.js"
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
	var _signMeasure = new Object();
	_signMeasure.MouseType = "none";
	_signMeasure.Measures = [];
	_signMeasure.Controls = [];
	//当前
	_signMeasure.CurrentMeasure = null;
	_signMeasure.HighLightMeasure = null;
	let _D3Measure = bimEngine.D3Measure;
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
		_signMeasure.MouseType = "DrawLine";
		_signMeasure.CurrentMeasure = {
			Points: [],
			Id: guid(),
			workerPlane: bimEngine.D3Measure.GetCurrentWorkPlane()
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
		_container.addEventListener('keydown', onKeyDown)
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
		if (e.keycode == 27) {
			removeEventLicense();
		}

	}
	//鼠标移动
	function onMouseMove(event) {
		_signMeasure.mouse = mousePosition(event);
		if (_signMeasure.MouseType == "DrawLine") {
			Animate_MeasurePointPink(event);
			let point = GetRayWorldPointPlane(_signMeasure.mouse);
			if (_signMeasure.CurrentMeasure.Points.length == 0) {

			} else if (_signMeasure.CurrentMeasure.Points.length == 1) {

			} else if (_signMeasure.CurrentMeasure.Points.length == 2) {

			}
		}
		if (_signMeasure.MouseType == "none") {

		}
	}
	//鼠标按下
	function onMouseDown(event) {
		_signMeasure.mouse = mousePosition(event);
		if (_signMeasure.MouseType == "DrawLine") {
			let point = GetRayWorldPointPlane(_signMeasure.mouse);
			if (_signMeasure.CurrentMeasure.Points.length == 0) {
				_signMeasure.CurrentMeasure.Points.push(point);
			} else if (_signMeasure.CurrentMeasure.Points.length == 1) {
				_signMeasure.CurrentMeasure.Points.push(point);
			} else if (_signMeasure.CurrentMeasure.Points.length == 2) {

			}
		}
		if (_signMeasure.MouseType == "none") {

		}
	}
	//鼠标弹起
	function onMouseUp(event) {
		_signMeasure.mouse = mousePosition(event);

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
		const stdVector = vector3.project(_minMap.camera);
		const a = window.innerWidth / 2;
		const b = window.innerHeight / 2;
		const x = Math.round(stdVector.x * a + a);
		const y = Math.round(-stdVector.y * b + b);
		return new THREE.Vector2(x, y);
	}
	//创建UI
	function CreatorUI() {


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
		let obliqueLength = 1;
		//渲染图形
		let start = points[0];
		let end = points[1];
		let center = points.length == 3 ? points[2] : null;
		let dirx = end.clone().sub(start.clone()).normalize();
		let diry = dirx.clone().cross(plane.normal).normalize();
		let dis = center == null ? 1 : GeometricOperation().PointDistanceLineExtend(center, start, end);
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

		//场景中子物体
		let index = bimEngine.scene.children.findIndex(x => x.Id == measure.Id);
		if (index != -1) {
			//已存在图形，更新形状
			let mesh = bimEngine.scene.children[index];
			for (let i = 0; i < linePoints.length; i++) {
				mesh.geometry.attributes.position.array[3 * i + 0] = linePoints[i].x;
				mesh.geometry.attributes.position.array[3 * i + 1] = linePoints[i].y;
				mesh.geometry.attributes.position.array[3 * i + 2] = linePoints[i].z;
			}
			mesh.geometry.attributes.position.needsUpdate = true;
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
	}
	//获取guid
	function guid() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	//获取射线在平面上选择的点
	function GetRayWorldPointPlane(mouse) {
		let plane = bimEngine.D3Measure.GetCurrentWorkPlane();
		let rayCaster = new THREE.Raycaster();
		rayCaster.setFromCamera(mouse, bimEngine.scene.camera);
		var startPickPoint = rayCaster.ray.intersectPlane(plane);
		return startPickPoint;
	}
	//精确测量捕捉**************************************************************************************************************************
	function Animate_MeasurePointPink(mouseEvent) {
		let camera = bimEngine.scene.camera;
		bimEngine.D3Measure.MeasurePink_Quadrangle.style.display = "none";
		bimEngine.D3Measure.MeasurePink_Triangle.style.display = "none";
		bimEngine.D3Measure.MeasurePink_Area.style.display = "none";
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
		let intersects = rayCaster.intersectObjects(bimEngine.D3Measure.AllModels, true);
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
					bimEngine.D3Measure.MeasurePink_Area.style.display = "block";
					bimEngine.D3Measure.MeasurePink_Area.firstChild.setAttribute('points', areaPoints.join(' '))
				}
				break;
			case "line":
				drawLine(bimEngine.scene, PINK_DETAILS.line)
				break;
			case "point":
				if (PINK_DETAILS.isCenter) {
					let position = worldPointToScreenPoint(new THREE.Vector3(PINK_DETAILS.val.x, PINK_DETAILS.val.y,
						PINK_DETAILS.val.z), camera);
					MeasurePink_Triangle.style.display = "block";
					MeasurePink_Triangle.style.top = (position.y - 5) + "px";
					MeasurePink_Triangle.style.left = (position.x - 5) + "px";
				} else {
					let position = worldPointToScreenPoint(new THREE.Vector3(PINK_DETAILS.val.x, PINK_DETAILS.val.y,
						PINK_DETAILS.val.z), camera);
					MeasurePink_Quadrangle.style.top = (position.y) + "px";
					MeasurePink_Quadrangle.style.left = (position.x) + "px";
					MeasurePink_Quadrangle.style.width = "10px";
					MeasurePink_Quadrangle.style.height = "10px";
					MeasurePink_Quadrangle.style.transform = "translate(-50%,-50%)";
					MeasurePink_Quadrangle.style.display = "block";
				}
				break;
		}
	}



	return _signMeasure;
}
