const THREE = require('@/three/three.js')
import {
	worldPointToScreenPoint
} from "@/views/tools/common/index.js"
export function pointMeasure(bimengine) {
	var _pointMeasure = new Object();
	var _container = bimengine.scene.renderer.domElement.parentElement;
	var camera = bimengine.scene.camera;
	let CurrentDom; //当前选中的dom
  let MeasureDomeId = "MeasurePoint";//捕捉dom的根节点
	_pointMeasure.TotalMeasures = []; //所有测量点集合
	_pointMeasure.isActive = false; //测量点是否激活
	let AnimationFrame = null //动画
	let CAMERA_POSITION;
	//激活
	_pointMeasure.Active = function() {
		bimengine.CaptureMark.Active()
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointerup', onMouseUp);
		window.addEventListener('keydown', DeleteMeasureItem);//监听键盘delete
		bimengine.StopClick = true

		function render() {
			AnimationFrame = requestAnimationFrame(render);
			_pointMeasure.TotalMeasures && Animate_MeasurePoints(_pointMeasure.TotalMeasures)
		}
		render() //开启动画
		_pointMeasure.isActive = true
	}
	//关闭
	_pointMeasure.DisActive = function() {
		bimengine.CaptureMark.DisActive()
		var root = getRootDom(_container);
		root && root.remove() //删除坐标点dom
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointerup', onMouseUp);
		window.removeEventListener('keydown',DeleteMeasureItem)
		bimengine.StopClick = false
		cancelAnimationFrame(AnimationFrame) //清除动画
		_pointMeasure.isActive = false
		_pointMeasure.TotalMeasures = [];
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
				if(bimengine.CaptureMark.Position){
					let Position = JSON.parse(JSON.stringify(bimengine.CaptureMark.Position)) 
					let pos = new THREE.Vector3(Position.worldPoint.x, Position.worldPoint.y, Position.worldPoint.z)
					window.bimEngine.scene.controls.origin = pos;
					let point = {
						position: pos,
						id: guid()
					}
					if(Position.capture && (Position.capture.type === "point" || Position.capture.type === "line")){
						point.position = new THREE.Vector3(Position.capture.val.x, Position.capture.val.y, Position.capture.val.z)
					}
					_pointMeasure.TotalMeasures.push(JSON.parse(JSON.stringify(point)))
					renderPoint(point)
				}
			}
		}
	}

	//鼠标移动更新标记点位置标
	function Animate_MeasurePoints(TotalMeasures) {
		if(bimengine.scene==null){
			return;
		}
		for (let measure of TotalMeasures) {
			let item = document.getElementById(measure.id);
			let temp = new THREE.Vector3(measure.position.x, measure.position.y, measure.position.z).applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
			let outScene = (Math.abs(temp.x) > 1) || (Math.abs(temp.y) > 1) || (Math.abs(temp.z) > 1)
			if ( outScene ) {
				item && (item.style.display = "none");
				continue
			}
			item && (item.style.display = "block");
			let position = worldPointToScreenPoint(new THREE.Vector3(measure.position.x, measure.position.y, measure
				.position.z), bimengine.scene.camera);
			if (position != null) {
				let offy = position.y
				let offx = position.x;
				item.style.top = offy + "px";
				item.style.left = offx + "px";
			}
		}
	}

	//渲染选中点
	function renderPoint(point) {
		var root = getRootDom(_container)
		// 当前点dom
		var point_item = document.createElement("div");
		point_item.className = "PointItem Actived";
		point_item.dataset.dataId = point.id;
		point_item.dataset.cameraId = bimengine.scene.camera.type + "_" + bimengine.scene.camera.Id;
		CurrentDom = point_item;
		point_item.id = point.id;
		root.appendChild(point_item);
		var item_contain = document.createElement("div");
		item_contain.className = "ItemContain";
		item_contain.dataset.dataId = point.id;
		point_item.appendChild(item_contain);
		point_item.addEventListener('click',(e)=>{
			if(e.target.dataset.dataId){//选择标记
				ResetCurrentDom(e.target.dataset.dataId)
			}else{// 非标记
				ResetCurrentDom()
			}
		})
		//三维坐标包裹dom
		var point_xyz = document.createElement("div");
		point_xyz.className = "PointXYZ";
		point_xyz.dataset.dataId = point.id;
		item_contain.appendChild(point_xyz);

		// X轴坐标信息dom
		var x_line = document.createElement("div");
		x_line.className = "Point PointX";
		x_line.dataset.dataId = point.id;
		var x_span = document.createElement("span");
		x_span.className = "Span";
		x_span.dataset.dataId = point.id;
		x_span.innerText = "X";
		x_line.appendChild(x_span);
		var x_text = document.createElement("span");
		x_text.className = "Text";
		x_text.dataset.dataId = point.id;
		x_text.innerText = Math.round(point.position.x * 1000) / 1000 + " m";
		x_line.appendChild(x_text);
		point_xyz.appendChild(x_line);
		// Y轴坐标信息dom
		var y_line = document.createElement("div");
		y_line.className = "Point PointY";
		y_line.dataset.dataId = point.id;
		var y_span = document.createElement("span");
		y_span.className = "Span";
		y_span.dataset.dataId = point.id;
		y_span.innerText = "Y";
		y_line.appendChild(y_span);
		var y_text = document.createElement("span");
		y_text.className = "Text";
		y_text.dataset.dataId = point.id;
		y_text.innerText = Math.round(point.position.y * 1000) / 1000 + " m";
		y_line.appendChild(y_text);
		point_xyz.appendChild(y_line);
		// Z轴坐标信息dom
		var z_line = document.createElement("div");
		z_line.className = "Point PointZ";
		z_line.dataset.dataId = point.id;
		var z_span = document.createElement("span");
		z_span.className = "Span";
		z_span.dataset.dataId = point.id;
		z_span.innerText = "Z";
		z_line.appendChild(z_span);
		var z_text = document.createElement("span");
		z_text.className = "Text";
		z_text.dataset.dataId = point.id;
		z_text.innerText = Math.round(point.position.z * 1000) / 1000 + " m";
		z_line.appendChild(z_text);
		point_xyz.appendChild(z_line);

		const printPoint = worldPointToScreenPoint(point.position, bimengine.scene.camera); //世界坐标转为屏幕坐标
		point_item.style.top = (printPoint.y - 5) + "px";
		point_item.style.left = (printPoint.x - 5) + "px";
	}

	// 选中标记点-点击delete可删除
	function DeleteMeasureItem(e) {
		if (e.key === "Delete" && CurrentDom) {
			let index = _pointMeasure.TotalMeasures.findIndex(item => item.id === CurrentDom.id);
			_pointMeasure.TotalMeasures.splice(index, 1)
			document.getElementById(MeasureDomeId).removeChild(CurrentDom)
			ResetCurrentDom()
		}
	}

	function ResetCurrentDom(id){
		if(!document.getElementById(MeasureDomeId)){
			return
		}
		let DomList = document.getElementById(MeasureDomeId).children
		for (let item of DomList) {
			if(item.id){
				item.className = "PointItem"
			}
		}
		CurrentDom = null
		if(id){
			for (let item of DomList) {
				if(item.id === id){
					item.className = "PointItem Actived"
					CurrentDom = item
					break
				}
			}
		}
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
	return _pointMeasure;
}
