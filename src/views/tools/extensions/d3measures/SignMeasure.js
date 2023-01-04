import {
	GeometricOperation
} from "@/views/tools/Geo/GeometricOperation.js"
//三维测量标记
export function SignMeasure(bimEngine) {
	var _signMeasure = new Object();
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
	return _signMeasure;
}
