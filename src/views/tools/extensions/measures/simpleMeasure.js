const THREE = require('@/three/three.js')
import {
	SetDeviceStyle
} from "@/views/tools/style/deviceStyleSet.js"
import {
	worldPointToScreenPoint
} from "@/views/tools/common/index.js"
//基础测量
export function simpleMeasure(bimengine) {
	require('@/views/tools/style/' + SetDeviceStyle() + '/measuresStyle.scss')
	var _simpleMeasure = new Object();
	var _container = bimengine.scene.renderer.domElement.parentElement;
	var camera = bimengine.scene.camera;

	let CurrentDom; //当前选中的dom
  let MeasureDomeId = "MeasureLine";//捕捉dom的根节点
	_simpleMeasure.TotalMeasures = []; //所有测量距离集合
	_simpleMeasure.MouseEvent = null; //跟随鼠标的位置参数
	_simpleMeasure.isActive = false; //测量线是否激活
	let AnimationFrame = null;
	let CAMERA_POSITION;
	let MeasurePink_ChuiDian = null;
	_simpleMeasure.currentMeasure = { //当前测量距离
		start: null, //起点
		end: null, //终点
		start_normal: null, //起点
		end_normal: null, //终点

		temp_end: null, //中间过程点
		dis: 0, //距离
		id: "", //id
		chuiDian: null
	};
	//激活
	_simpleMeasure.Active = function() {
		bimengine.CaptureMark.Active()
		_simpleMeasure.models = bimengine.GetAllVisibilityModel();
		var root = getRootDom(_container)
		MeasurePink_ChuiDian = document.createElement("div")
		MeasurePink_ChuiDian.id = "MeasureChuiDianPink";
		root.appendChild(MeasurePink_ChuiDian);
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointermove', onMouseMove);
		_container.addEventListener('pointerup', onMouseUp);
		window.addEventListener('keydown', DeleteMeasureItem); //监听键盘delete
		bimengine.StopClick = true
		function render() {
			AnimationFrame = requestAnimationFrame(render);
			_simpleMeasure.MouseEvent && Animate_MeasureLinePink(_simpleMeasure.MouseEvent)
			_simpleMeasure.TotalMeasures && Animate_MeasureLines(_simpleMeasure.TotalMeasures)
		}
		render() //开启动画
		_simpleMeasure.isActive = true
	}

	//关闭
	_simpleMeasure.DisActive = function() {
		bimengine.CaptureMark.DisActive()
		var root = getRootDom(_container);
		root && root.remove() //删除坐标点dom
		clear()
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointermove', onMouseMove);
		_container.removeEventListener('pointerup', onMouseUp);
		window.removeEventListener('keydown', DeleteMeasureItem); //监听键盘delete
		bimengine.StopClick = false
		cancelAnimationFrame(AnimationFrame) //清除动画
		_simpleMeasure.isActive = false
		_simpleMeasure.TotalMeasures = [];
	}

	//设置标注连线
	_simpleMeasure.SetMeasureLine = function(start, end) {
		var currentMeasure = {
			start: start,
			end: end,
			dis: start.distanceTo(end),
			id: guid()
		}
		_simpleMeasure.TotalMeasures.push(currentMeasure);
	}
	_simpleMeasure.GetMeasureList = function() {
		return _simpleMeasure.TotalMeasures;
	}
	_simpleMeasure.ReductionMeasureList = function(datas) {
		for (var data of datas) {
			let start = new THREE.Vector3(data.start.x, data.start.y, data.start.z);
			let end = new THREE.Vector3(data.end.x, data.end.y, data.end.z);
			let dis = start.distanceTo(end);
			var measure = {
				start: start,
				end: end,
				dis: dis,
				id: guid()
			}
			_simpleMeasure.TotalMeasures.push(measure);
		}
	}

	_simpleMeasure.MeasurePointPinkOnMouseMove = function(point) {

	}

	//鼠标移动
	var lastMove = Date.now();

	function onMouseMove(event) {
		_simpleMeasure.MouseEvent = {
			x: event.clientX,
			y: event.clientY,
			event: event
		}
	}
	//捕捉点
	function SnapPoint(intersect) {
		if (_simpleMeasure.currentMeasure.start == null) {
			//捕捉第一个点


		} else {
			//捕捉第二个的
			var ray = new THREE.Raycaster(_simpleMeasure.currentMeasure.start.clone().add(_simpleMeasure.currentMeasure
				.start_normal.clone().multiplyScalar(0.01)), _simpleMeasure.currentMeasure.start_normal);
			var intersects = ray.intersectObjects(_simpleMeasure.models);
			if (intersects.length > 0) {
				//判断如果投影点比较近
				var point = intersects[0].point;
				const dis = point.distanceTo(intersect);
				if (dis < 0.1) {
					let position = worldPointToScreenPoint(new THREE.Vector3(point.x, point.y, point.z), camera);
					MeasurePink_ChuiDian.style.top = (position.y) + "px";
					MeasurePink_ChuiDian.style.left = (position.x) + "px";
					MeasurePink_ChuiDian.style.display = "block";
					return point;
				}
			}
			return null;
		}
	}
	//鼠标按下
	function onMouseDown(event) {
		event.preventDefault(); // 阻止默认的点击事件执行
		CAMERA_POSITION = {
			x: event.x,
			y: event.y
		}
	}
	//鼠标抬起
	function onMouseUp(event) {
		ResetCurrentDom()
		if (event.button === 0) {
			if (Math.abs(event.x - CAMERA_POSITION.x) < 2 && Math.abs(event.y - CAMERA_POSITION.y) < 2) {
				if (bimengine.CaptureMark.Position) {
					let Position = JSON.parse(JSON.stringify(bimengine.CaptureMark.Position))
					let point = new THREE.Vector3(Position.worldPoint.x, Position.worldPoint.y, Position.worldPoint.z)
					window.bimEngine.scene.controls.origin = point;
					if (Position.capture && (Position.capture.type === "point" || Position.capture.type === "line")) {
						point = new THREE.Vector3(Position.capture.val.x, Position.capture.val.y, Position.capture.val
							.z)
					}
					//判断当前的状态，
					//第一种：新开始画一个标注 
					if (_simpleMeasure.currentMeasure.start == null && _simpleMeasure.currentMeasure.end == null) {
						_simpleMeasure.currentMeasure = {};
						_simpleMeasure.currentMeasure.start = point;
						_simpleMeasure.currentMeasure.start_normal = new THREE.Vector3(Position.capture.faceNormal.x,
							Position.capture.faceNormal.y, Position.capture.faceNormal.z);
						_simpleMeasure.currentMeasure.id = guid();
					}
					//第二种：画第二个点
					else if (_simpleMeasure.currentMeasure.start != null && _simpleMeasure.currentMeasure.end == null) {
						_simpleMeasure.currentMeasure.end = (_simpleMeasure.currentMeasure.chuiDian ? _simpleMeasure
							.currentMeasure.chuiDian : point);

						_simpleMeasure.currentMeasure.dis = (_simpleMeasure.currentMeasure.start.distanceTo(
							_simpleMeasure
							.currentMeasure.end));
						_simpleMeasure.TotalMeasures.push(JSON.parse(JSON.stringify(_simpleMeasure.currentMeasure)));
						let item = document.getElementById(_simpleMeasure.currentMeasure.id)
						item.className = "LineItem Temporary LineFinal Actived"
						CurrentDom = item
						_simpleMeasure.currentMeasure = {};
						MeasurePink_ChuiDian.style.display = "none";
					}

				}
			}
		}
	}
	//渲染测量线
	function render_MeasureLine(flag) {
		var start;
		var end;
		//第一种：没有点 
		if (_simpleMeasure.currentMeasure == null) {
			let eles = document.getElementsByClassName("LineItem Temporary");
			if (eles.length > 0) {
				eles[0].parentNode.removeChild(eles[0]);
			}
			return;
		}
		if (_simpleMeasure.currentMeasure.start == null && _simpleMeasure.currentMeasure.end == null) {

			return;
		}
		//第二种：有一个点
		if (_simpleMeasure.currentMeasure.start != null && _simpleMeasure.currentMeasure.end == null) {
			if (_simpleMeasure.currentMeasure.temp_end != null) {
				start = worldPointToScreenPoint(_simpleMeasure.currentMeasure.start.clone(), bimengine.scene.camera)
				end = worldPointToScreenPoint(_simpleMeasure.currentMeasure.temp_end.clone(), bimengine.scene.camera)
			}
		}
		//第三种：有两个点
		if (_simpleMeasure.currentMeasure.start != null && _simpleMeasure.currentMeasure.end != null) {
			start = worldPointToScreenPoint(_simpleMeasure.currentMeasure.start.clone(), bimengine.scene.camera)
			end = worldPointToScreenPoint(_simpleMeasure.currentMeasure.end.clone(), bimengine.scene.camera)
		}
		if (start != null && end != null) {
			var root = getRootDom(_container)
			//获取起点和终点 
			var line_item = document.getElementById(_simpleMeasure.currentMeasure.id);
			if (line_item == null) {
				//新增坐标点
				line_item = document.createElement("div");
				line_item.id = _simpleMeasure.currentMeasure.id;
				line_item.className = "LineItem Temporary"
				line_item.dataset.dataId = _simpleMeasure.currentMeasure.id;
				line_item.dataset.cameraId = bimEngine.scene.camera.type + "_" + bimEngine.scene.camera.Id;
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
				dom_start.dataset.dataId = _simpleMeasure.currentMeasure.id;
				let dom_end = document.createElement("div");
				dom_end.className = "dom_end BoxControllerUI";
				dom_end.dataset.dataId = _simpleMeasure.currentMeasure.id;
				//其次是中间的线
				let dom_line = document.createElement("div");
				dom_line.className = "dom_line";
				dom_line.dataset.dataId = _simpleMeasure.currentMeasure.id;
				//再然后是距离的标识
				let dom_text = document.createElement("div");
				dom_text.className = "dom_text";
				dom_text.dataset.dataId = _simpleMeasure.currentMeasure.id;
				// dom_text.innerText = Math.round(1000 * _simpleMeasure.currentMeasure.dis) + "mm";
				dom_text.style.display = "none"
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

				dom_start.style.top = (start.y) + "px";
				dom_start.style.left = (start.x) + "px";
				if (flag) {
					dom_end.style.top = (end.y) + "px";
					dom_end.style.left = (end.x) + "px";
					const dis = Math.sqrt((start.y - end.y) * (start.y - end.y) + (start.x - end.x) * (start.x - end
						.x));
					dom_line.style.top = 0.5 * (start.y + end.y) + "px";
					dom_line.style.left = 0.5 * (start.x + end.x - dis) + "px";
					dom_line.style.width = dis + "px"
					dom_line.style.transformOrigin = 0.5 * (start.y + end.y) + "px" + 0.5 * (start.x + end.x) + "px "
					dom_line.style.transform = "rotate(" + 180 * Math.atan((start.y - end.y) / (start.x - end.x)) / Math
						.PI + "deg)"
					dom_end.style.display = "block"
					dom_line.style.display = "block"
				} else {
					dom_end.style.display = "none"
					dom_line.style.display = "none"
				}


				// dom_text.style.top = 0.5 * (start.y + end.y) + "px";
				// dom_text.style.left = 0.5 * (start.x + end.x) + "px";
				// dom_text.innerText = Math.round(1000 * _simpleMeasure.currentMeasure.dis) + "mm";
				dom_text.style.display = "none"
			}
		}
	}
	//鼠标移动更新捕捉点位置
	function Animate_MeasureLinePink(mouseEvent) {
		if (bimengine.CaptureMark.Position) {
			let Position = JSON.parse(JSON.stringify(bimengine.CaptureMark.Position))
			//第一种：新开始画一个标注
			if (_simpleMeasure.currentMeasure.start == null && _simpleMeasure.currentMeasure.end == null) {

			}
			//第二种：画第二个点
			if (_simpleMeasure.currentMeasure.start != null && _simpleMeasure.currentMeasure.end == null) {
				var snap = SnapPoint(new THREE.Vector3(Position.worldPoint.x, Position.worldPoint.y, Position.worldPoint
					.z))
				// _simpleMeasure.currentMeasure.temp_end = (snap != null ? snap : intersects[0].point).clone();
				if (snap) {
					_simpleMeasure.currentMeasure.chuiDian = snap
				}
				_simpleMeasure.currentMeasure.temp_end = new THREE.Vector3(Position.worldPoint.x, Position.worldPoint.y,
					Position.worldPoint.z);
				_simpleMeasure.currentMeasure.dis = (_simpleMeasure.currentMeasure.start.distanceTo(
					_simpleMeasure.currentMeasure.temp_end));

			}
			render_MeasureLine(true);
		} else {
			render_MeasureLine(false);
		}
	}


	//鼠标移动更新标记线位置
	function Animate_MeasureLines(TotalMeasures) {
		if (TotalMeasures.length == 0) {
			return;
		}
		var root = getRootDom(_container)
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
					line_item.className = "LineItem"
					line_item.dataset.cameraId = bimEngine.scene.camera.type + "_" + bimEngine.scene.camera.Id;
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
					dom_text.innerText = Math.round(1000 * measure.dis) / 1000 + " m"; 
					dom_text.style.display = "block"
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
					dom_line.style.transform = "rotate(" + 180 * Math.atan((start.y - end.y) / (start.x - end
							.x)) /
						Math
						.PI + "deg)"

					dom_text.style.top = 0.5 * (start.y + end.y) + "px";
					dom_text.style.left = 0.5 * (start.x + end.x) + "px";
					dom_text.innerText = Math.round(1000 * measure.dis) / 1000 + " m";
					dom_text.style.display = "block"
				}
			}
		}

		//更新正在创建的标线的位置
		var current_item = document.getElementById(_simpleMeasure.currentMeasure.id);
		if (current_item) {
			var start = worldPointToScreenPoint(new THREE.Vector3(_simpleMeasure.currentMeasure.start.x, _simpleMeasure
				.currentMeasure.start.y,
				_simpleMeasure.currentMeasure.start.z), camera);
			var end = worldPointToScreenPoint(new THREE.Vector3(_simpleMeasure.currentMeasure.temp_end.x, _simpleMeasure
				.currentMeasure.temp_end.y,
				_simpleMeasure.currentMeasure.temp_end.z), camera);
			let children = current_item.children;
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

			// dom_text.style.top = 0.5 * (start.y + end.y) + "px";
			// dom_text.style.left = 0.5 * (start.x + end.x) + "px";
			// dom_text.innerText = Math.round(1000 * _simpleMeasure.currentMeasure.dis) + "mm";
			dom_text.style.display = "none"
		}

	}

	// 选中标记点-点击delete可删除
	function DeleteMeasureItem(e) {
		if (e.key === "Delete" && CurrentDom) {
			let index = _simpleMeasure.TotalMeasures.findIndex(item => item.id === CurrentDom.id);
			_simpleMeasure.TotalMeasures.splice(index, 1)
			document.getElementById(MeasureDomeId).removeChild(CurrentDom)
			ResetCurrentDom()
		}
		if (e.keyCode == 27) {
			let tempDom = document.getElementById(_simpleMeasure.currentMeasure.id)
			tempDom.remove()
			_simpleMeasure.currentMeasure = {};
		}
	}

	function ResetCurrentDom(id){
		let DomList = document.getElementById(MeasureDomeId)?document.getElementById(MeasureDomeId).children:[]
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
	//清除数据
	function clear() {
		_simpleMeasure.TotalMeasures = []; //所有测量距离集合
		_simpleMeasure.currentMeasure = { //当前测量距离
			start: null, //起点
			end: null, //终点
			temp_end: null, //中间过程点
			dis: 0, //距离
			id: "" //id
		};
	}
	//获得点标记的dom根节点
	function getRootDom(_container) {
		var root = document.getElementById(MeasureDomeId);
		if (root == null) { //不存在点标记包裹div
			root = document.createElement("div");
			root.id = MeasureDomeId;
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
	return _simpleMeasure;
}
