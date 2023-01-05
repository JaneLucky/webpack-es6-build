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
//三维测量标记
export function SignMeasure(bimEngine) {
	var _signMeasure = new Object();
	_signMeasure.MouseType = "none";
	_signMeasure.Measures = [];


	//获取标记数据
	_signMeasure.GetMeasureList = function() {

	}
	//还原标注数据
	_signMeasure.ReductionMeasure = function(list) {

	}
	//启用
	_signMeasure.Active = function() {

	}
	//禁用
	_signMeasure.DisActive = function() {

	}
	//鼠标移动
	function onMouseMove() {
		_D3Measure.mouse = mousePosition(event);

	}
	//鼠标按下
	function onMouseDown() {
		_D3Measure.mouse = mousePosition(event);

	}
	//鼠标弹起
	function onMouseUp() {
		_D3Measure.mouse = mousePosition(event);

	}
	//相机交互
	//创建相机的UI
	function CreatorUI() {

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


	//精确测量捕捉**************************************************************************************************************************
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
