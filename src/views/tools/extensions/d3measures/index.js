const THREE = require('three');
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
//3D测量
export function D3Measure(bimEngine) {
	var _D3Measure = new Object();

	_D3Measure.MouseType = "none";
	//绘制剖面视图
	_D3Measure.CreatorUI = function() {
		CreatorUI();
	}
	//获取当前视图类型
	_D3Measure.GetCurrentViewType = function() {
		let ViewType = GetCurrentViewType();
		return ViewType;
	}
	//绘制剖面视图
	_D3Measure.CreatorSection = function() {
		let ViewType = GetCurrentViewType();
		if (ViewType == "D3") {
			return;
		}
		//三维视图跳过，平面视图保留


	}
	//绘制剖面线
	_D3Measure.DrawSelectLines = function(viewLists) {
		DrawSelectLines(viewLists);
	}
	//清除剖面数据
	_D3Measure.Clear = function() {

	}
	//获取当前工作平面
	_D3Measure.GetCurrentWorkPlane = function() {
		if (bimEngine.WorkPlane != null) {
			return bimEngine.WorkPlane;
		} else {
			//取相机正对的平面作为工作平面
			//首先获取相机的法向量
			let cameraDir = new THREE.Vector3();
			bimEngine.scene.camera.getWorldDirection(cameraDir);
			//然后是获取位置
			let position = bimEngine.scene.camera.position;
			let plane = new THREE.Plane(cameraDir, position.distanceTo(new THREE.Vector3(0, 0, 0)));
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
	//按下键盘事件
	function onKeyDown() {
		if (e.keycode == 27) {

		}
	}
	//鼠标按下
	function onMouseDown(event) {
		_D3Measure.mouse = mousePosition(event);
		//获取鼠标按下数据
		let mouse = mousePosition(event);
		let rayCaster = new THREE.Raycaster();
		rayCaster.setFromCamera(mouse, bimEngine.scene.camera);
		let intersects = (rayCaster.intersectObjects(bimEngine.GetAllVisibilityModel(), true));
		if (intersects.length > 0) {
			// console.log(intersects);
			let plane = new THREE.Plane(intersects[0].face.normal, intersects[0].point.clone().distanceTo(new THREE
				.Vector3()));
			bimEngine.WorkPlane = plane;
			removeEventLicense();
		}
	}
	//鼠标弹起
	function onMouseUp(event) {
		_D3Measure.mouse = mousePosition(event);

	}
	//鼠标移动
	function onMouseMove(event) {
		_D3Measure.mouse = mousePosition(event);
		if (_D3Measure.MouseType == "HandlePlane") {
			Animate_MeasurePointPink(event);
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
	//绘制剖面线
	function DrawSelectLine(view) {
		//view 的结构数据
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
		var geometry = new THREE.Geometry(); //声明一个空几何体对象
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

		var geometry = new THREE.Geometry(); //声明一个空几何体对象
		geometry.vertices.push(p5, p6, p7, p8); //顶点坐标添加到geometry对象 
		geometry.faces.push(new THREE.Face3(0, 1, 2, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(0, 2, 3, normal)); //三角面添加到几何体
		var mesh = new THREE.Mesh(geometry, material); //网格模型对象
		mesh.name = "ViewMask";
		mesh.view = view;
		bimEngine.scene.add(mesh);
	}
	//渲染遮罩边线
	function renderMaskSide() {
		var geometry = new THREE.Geometry(); //声明一个空几何体对象
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
		const stdVector = vector3.project(_minMap.camera);
		const a = window.innerWidth / 2;
		const b = window.innerHeight / 2;
		const x = Math.round(stdVector.x * a + a);
		const y = Math.round(-stdVector.y * b + b);
		return new THREE.Vector2(x, y);
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
				// case "line":
				// 	drawLine(bimEngine.scene, PINK_DETAILS.line)
				// 	break;
				// case "point":
				// 	if (PINK_DETAILS.isCenter) {
				// 		let position = worldPointToScreenPoint(new THREE.Vector3(PINK_DETAILS.val.x, PINK_DETAILS.val.y,
				// 			PINK_DETAILS.val.z), camera);
				// 		MeasurePink_Triangle.style.display = "block";
				// 		MeasurePink_Triangle.style.top = (position.y - 5) + "px";
				// 		MeasurePink_Triangle.style.left = (position.x - 5) + "px";
				// 	} else {
				// 		let position = worldPointToScreenPoint(new THREE.Vector3(PINK_DETAILS.val.x, PINK_DETAILS.val.y,
				// 			PINK_DETAILS.val.z), camera);
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
	return _D3Measure;
}
