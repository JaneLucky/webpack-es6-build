const THREE = require('@/three/three.js')
import {
	worldPointToScreenPoint
} from "@/views/tools/common/index.js"
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js"
export function distanceMeasure(bimengine) {
  require('@/views/tools/style/'+SetDeviceStyle()+'/measuresStyle.scss')
	var _distanceMeasure = new Object();
	var _container = bimengine.scene.renderer.domElement.parentElement;
	var camera = bimengine.scene.camera;
	let CurrentDom; //当前选中的dom
  let MeasureDomeId = "MeasureDistance";//捕捉dom的根节点
	_distanceMeasure.TotalMeasures = []; //所有测量点集合
	_distanceMeasure.isActive = false; //测量点是否激活
	let AnimationFrame = null //动画
	let CAMERA_POSITION;
	let isInit = false
	let Pink;//初始化标记点
	_distanceMeasure.currentMeasure;
	//激活
	_distanceMeasure.Active = function() {
		bimengine.CaptureMark.Active()
		_distanceMeasure.models = bimengine.GetAllVisibilityModel();
		// if(bimengine.EngineRay){
		// 	bimengine.EngineRay.Active()
		// 	_distanceMeasure.models = _distanceMeasure.models.filter(o => o.TypeName == "InstancedMesh" || o
		// 		.TypeName == "InstancedMesh-Pipe");
		// 		_distanceMeasure.models.push(bimengine.scene.children[5]);
		// }
		Pink = CreatePinkDom(MeasureDomeId)
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointermove', onMouseMove);
		_container.addEventListener('pointerup', onMouseUp);
		window.addEventListener('keydown', DeleteMeasureItem);//监听键盘delete
		bimengine.StopClick = true

		function render() {
			AnimationFrame = requestAnimationFrame(render);
			_distanceMeasure.currentMeasure && Render_MeasureLine()
			_distanceMeasure.TotalMeasures && Animate_MeasureLines(_distanceMeasure.TotalMeasures)
		}
		render() //开启动画
		_distanceMeasure.isActive = true
	}
	//关闭
	_distanceMeasure.DisActive = function() {
		bimengine.CaptureMark.DisActive()
		var root = getRootDom(MeasureDomeId);
		_distanceMeasure.TotalMeasures = []
		root && root.remove() //删除坐标点dom
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointermove', onMouseMove);
		_container.removeEventListener('pointerup', onMouseUp);
		window.removeEventListener('keydown',DeleteMeasureItem)
		bimengine.StopClick = false
		cancelAnimationFrame(AnimationFrame) //清除动画
		_distanceMeasure.isActive = false
		_distanceMeasure.TotalMeasures = [];
	}

	//鼠标按下
	function onMouseDown(event) {
		event.preventDefault(); // 阻止默认的点击事件执行
		CAMERA_POSITION = {
			x: event.x,
			y: event.y
		}
	}
	//鼠标移动
	function onMouseMove(event) {
		if(isInit){
			Pink.style.display = 'none'
			let Position = bimengine.CaptureMark.Position
			if (Position) {
				let point = new THREE.Vector3(Position.worldPoint.x, Position.worldPoint.y, Position.worldPoint.z)
				let normal = new THREE.Vector3(Position.capture.faceNormal.x, Position.capture.faceNormal.y, Position.capture.faceNormal.z);
				console.log(normal)
				let results = rayDirectResult(point, normal);
				if (results != null) {
					var result = results[0];
					_distanceMeasure.currentMeasure = {
						start: point,
						end: result.point,
						dis: point.distanceTo(result.point),
						id: "temp"
					};
				}
			}

			// 之前
			// let rayCaster = new THREE.Raycaster();
			// let mouse = new THREE.Vector2();
			// mouse.x = ((event.clientX - bimengine.scene.camera.viewport.x) / bimengine.scene.camera.viewport.z) * 2 - 1;
			// mouse.y = -((event.clientY - bimengine.scene.camera.viewport.y) / bimengine.scene.camera.viewport.w) * 2 + 1;
			// //这里为什么是-号，没有就无法点中
			// rayCaster.setFromCamera(mouse, bimengine.scene.camera);
			// let intersects = rayCaster.intersectObjects(_distanceMeasure.models, true);
			// if(intersects && intersects.length){
			// 	let intersect = intersects[0]
			// 	//第二次绘制:渲染一条线
			// 	let normal;
			// 	if(intersect.object.TypeName == "InstancedMesh" || intersect.object.TypeName == "InstancedMesh-Pipe"){
			// 		let matrixArray = intersect.object.instanceMatrix.array.slice(intersect.instanceId * 16, (intersect.instanceId + 1) * 16);
			// 		let matrix = new THREE.Matrix4();
			// 		matrix.elements = matrixArray;
			// 		var p = new THREE.Vector3();  // 坐标分量
			// 		var q = new THREE.Quaternion(); //旋转分量
			// 		var s = new THREE.Vector3(); //缩放分量
			// 		matrix.decompose(p,q,s);
			// 		var newmatrix = (new THREE.Matrix4()).makeRotationFromQuaternion(q);
			// 		normal = ((intersect.face.normal.clone()).applyMatrix4(newmatrix.clone())).normalize()
			// 	}else{
			// 		normal = intersect.face.normal;
			// 	}
				
			// 	let point = intersects[0].point;
			// 	let results = rayDirectResult(point, normal.clone());
			// 	if (results != null) {
			// 		var result = results[0];
			// 		_distanceMeasure.currentMeasure = {
			// 			start: point,
			// 			end: result.point,
			// 			dis: point.distanceTo(result.point),
			// 			id: "temp"
			// 		};
			// 	}
		}
	}
	//鼠标抬起
	function onMouseUp(event) {
		ResetCurrentDom()
		if (event.button === 0) {
			if (Math.abs(event.x - CAMERA_POSITION.x) < 2 && Math.abs(event.y - CAMERA_POSITION.y) < 2) {
				if(bimengine.CaptureMark.Position){
					let Position = JSON.parse(JSON.stringify(bimengine.CaptureMark.Position))
					let point = new THREE.Vector3(Position.worldPoint.x, Position.worldPoint.y, Position.worldPoint.z)
					window.bimEngine.scene.controls.origin = point;
				}
				if(!isInit && bimengine.CaptureMark.Position){
					Pink.style.display = 'block'
					Pink.style.left = event.x + 'px'
					Pink.style.top = event.y + 'px'
					isInit = true
				}else if(isInit && _distanceMeasure.currentMeasure){
					let item = JSON.parse(JSON.stringify(_distanceMeasure.currentMeasure))
					item.id = guid()
					_distanceMeasure.TotalMeasures.push(item)
					let temDom = document.getElementById('temp')
					document.getElementById(MeasureDomeId).removeChild(temDom)
					_distanceMeasure.currentMeasure = null
					isInit = false
				}
			}
		}
	}

	//射线结果
	function rayDirectResult(start, normal) {
		var ray = new THREE.Raycaster(start.clone().add(normal.clone().multiplyScalar(0.01)), normal.clone());
		var intersects = ray.intersectObjects(_distanceMeasure.models, true);
		if (intersects.length > 0) {
			return intersects;
		} else {
			return null;
		}
	}

	//鼠标移动更新标记点位置标
	//鼠标移动更新标记线位置
	function Animate_MeasureLines(TotalMeasures) {
		if (TotalMeasures.length == 0) {
			return;
		}
		var root = getRootDom(MeasureDomeId)
		for (var measure of TotalMeasures) {
			if (measure.start == null) {
				continue;
			}

			let vectorStart = new THREE.Vector3(measure.start.x, measure.start.y, measure.start.z)
			let vectorEnd = new THREE.Vector3(measure.end.x, measure.end.y, measure.end.z)
			let vectorCenter = new THREE.Vector3((measure.start.x+measure.end.x)/2, (measure.start.y+measure.end.y)/2, (measure.start.z+measure.end.z)/2)

			let tempS = vectorStart.clone().applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
			let outSceneS = (Math.abs(tempS.x) > 1) || (Math.abs(tempS.y) > 1) || (Math.abs(tempS.z) > 1)
			let tempE = vectorEnd.clone().applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
			let outSceneE = (Math.abs(tempE.x) > 1) || (Math.abs(tempE.y) > 1) || (Math.abs(tempE.z) > 1)
			let tempC = vectorCenter.clone().applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
			let outSceneC = (Math.abs(tempC.x) > 1) || (Math.abs(tempC.y) > 1) || (Math.abs(tempC.z) > 1)
			var line_item = document.getElementById(measure.id);
			if(outSceneS && outSceneE && outSceneC){
				line_item && (line_item.style.display = "none")
				continue
			}
			line_item && (line_item.style.display = "block")

			var start = worldPointToScreenPoint(vectorStart,camera);
			var end = worldPointToScreenPoint(vectorEnd, camera);

			if (start != null && end != null) {
				var line_item = document.getElementById(measure.id);
				if (line_item == null) {
					//新增坐标点
					line_item = document.createElement("div");
					line_item.id = measure.id;
					line_item.className = "LineItem Temporary LineFinal Actived"
					line_item.dataset.dataId = measure.id;
					line_item.dataset.cameraId = bimengine.scene.camera.type+"_"+bimengine.scene.camera.Id;
					line_item.addEventListener('click', (e) => {
						if(e.target.dataset.dataId){//选择标记
							ResetCurrentDom(e.target.dataset.dataId)
						}else{// 非标记
							ResetCurrentDom()
						}
					})
					//首先是两个点
					let dom_start = document.createElement("div");
					dom_start.className = "dom_start BoxControllerUI";
					dom_start.dataset.dataId = measure.id;
					let dom_end = document.createElement("div");
					dom_end.className = "dom_end BoxControllerUI";
					dom_end.dataset.dataId = measure.id;
					//其次是中间的线
					let dom_line = document.createElement("div");
					dom_line.className = "dom_line";
					dom_line.dataset.dataId = measure.id;
					//再然后是距离的标识
					let dom_text = document.createElement("div");
					dom_text.className = "dom_text";
					dom_text.dataset.dataId = measure.id;
					dom_text.innerText = Math.round(1000 * measure.dis) / 1000 + " m";
					//接下来是渲染图形
					line_item.appendChild(dom_start);
					line_item.appendChild(dom_end);
					line_item.appendChild(dom_line);
					line_item.appendChild(dom_text);
					CurrentDom = line_item
					//最终加到最外面一层
					root.appendChild(line_item);
				}
				//获取到子元素
				{
					let children = line_item.children;
					var dom_start = children[0];
					var dom_end = children[1];
					var dom_line = children[2];
					var dom_text = children[3];



					dom_start.style.top = (start.y) + "px";
					dom_start.style.left = (start.x) + "px";

					dom_end.style.top = (end.y) + "px";
					dom_end.style.left = (end.x) + "px";

					const dis = Math.sqrt((start.y - end.y) * (start.y - end.y) + (start.x - end.x) * (start.x - end
						.x));
					dom_line.style.top = 0.5 * (start.y + end.y) + "px";
					dom_line.style.left = 0.5 * (start.x + end.x - dis) + "px";
					dom_line.style.width = dis + "px"
					dom_line.style.transformOrigin = 0.5 * (start.y + end.y) + "px" + 0.5 * (start.x + end.x) +
						"px "
					dom_line.style.transform = "rotate(" + 180 * Math.atan((start.y - end.y) / (start.x - end.x)) /
						Math
						.PI + "deg)"

					dom_text.style.top = 0.5 * (start.y + end.y) + "px";
					dom_text.style.left = 0.5 * (start.x + end.x) + "px";
					dom_text.innerText = Math.round(1000 * measure.dis) / 1000 + " m";
				}
			}
		}
	}

	// 选中标记点-点击delete可删除
	function DeleteMeasureItem(e) {
		if (e.key === "Delete" && CurrentDom) {
			let index = _distanceMeasure.TotalMeasures.findIndex(item => item.id === CurrentDom.id);
			_distanceMeasure.TotalMeasures.splice(index, 1)
			document.getElementById(MeasureDomeId).removeChild(CurrentDom)
			ResetCurrentDom()
		}
	}

	function ResetCurrentDom(id){
		let DomList = document.getElementById(MeasureDomeId).children
		for (let item of DomList) {
			if(item.id){
				item.className = "LineItem Temporary LineFinal"
			}
		}
		CurrentDom = null
		if(id){
			for (let item of DomList) {
				if(item.id === id){
					item.className = "LineItem Temporary LineFinal Actived"
					CurrentDom = item
					break
				}
			}
		}
	}

	// 创建激活点
	function CreatePinkDom(domName){
    var root = getRootDom(domName)
    let Pink_Mark = document.createElement("div");
    Pink_Mark.className = "PointMark";
    root.appendChild(Pink_Mark);
		return Pink_Mark
	}

	// 创建测量线
	function Render_MeasureLine() {
		if(_distanceMeasure.currentMeasure.start && _distanceMeasure.currentMeasure.end && _distanceMeasure.currentMeasure.dis){
			var root = getRootDom(MeasureDomeId)
			//获取起点和终点 
			var line_item = document.getElementById(_distanceMeasure.currentMeasure.id);
			if (line_item == null) {
				//新增坐标点
				line_item = document.createElement("div");
				line_item.id = _distanceMeasure.currentMeasure.id;
				line_item.className = "LineItem"
				//首先是两个点
				let dom_start = document.createElement("div");
				dom_start.className = "dom_start BoxControllerUI";
				let dom_end = document.createElement("div");
				dom_end.className = "dom_end BoxControllerUI";
				//其次是中间的线
				let dom_line = document.createElement("div");
				dom_line.className = "dom_line";
				//再然后是距离的标识
				let dom_text = document.createElement("div");
				dom_text.className = "dom_text";
				dom_text.innerText = Math.round(1000 * _distanceMeasure.currentMeasure.dis) / 1000 + " m";
				//接下来是渲染图形
				line_item.appendChild(dom_start);
				line_item.appendChild(dom_end);
				line_item.appendChild(dom_line);
				line_item.appendChild(dom_text);
				//最终加到最外面一层
				root.appendChild(line_item);
			}
			//获取到子元素
			{
				let children = line_item.children;
				var dom_start = children[0];
				var dom_end = children[1];
				var dom_line = children[2];
				var dom_text = children[3];
				let start =  worldPointToScreenPoint(_distanceMeasure.currentMeasure.start .clone(), bimengine.scene.camera)
				let end = worldPointToScreenPoint(_distanceMeasure.currentMeasure.end.clone(), bimengine.scene.camera)

				dom_start.style.top = (start.y) + "px";
				dom_start.style.left = (start.x) + "px";

				dom_end.style.top = (end.y) + "px";
				dom_end.style.left = (end.x) + "px";

				const dis = Math.sqrt((start.y - end.y) * (start.y - end.y) + (start.x - end.x) * (start.x - end.x));
				dom_line.style.top = 0.5 * (start.y + end.y) + "px";
				dom_line.style.left = 0.5 * (start.x + end.x - dis) + "px";
				dom_line.style.width = dis + "px"
				dom_line.style.transformOrigin = 0.5 * (start.y + end.y) + "px" + 0.5 * (start.x + end.x) + "px "
				dom_line.style.transform = "rotate(" + 180 * Math.atan((start.y - end.y) / (start.x - end.x)) / Math
					.PI + "deg)"

				dom_text.style.top = 0.5 * (start.y + end.y) + "px";
				dom_text.style.left = 0.5 * (start.x + end.x) + "px";
				dom_text.innerText = Math.round(1000 * _distanceMeasure.currentMeasure.dis) / 1000 + " m";
			}
		}
	}

	//获得点标记的dom根节点
	function getRootDom(domName) {
    var root = document.getElementById(domName);
    if (root == null) { //不存在点标记包裹div
      root = document.createElement("div");
      root.id = domName;
      _container.appendChild(root);
    }
    return root
	}
	//生成随机字符串id
	function guid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	return _distanceMeasure;
}
