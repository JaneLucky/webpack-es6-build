const THREE = require('@/three/three.js')
import {
	worldPointToScreenPoint
} from "@/views/tools/common/index.js"
import { getRootDom, guidId } from './index.js'
export function elevationHeightMeasure(_Engine) {
	var _elevationHeightMeasure = new Object();
	var _container = _Engine.scene.renderer.domElement.parentElement;
	var camera = _Engine.scene.camera;
	let CurrentDom; //当前选中的dom
  let MeasureDomeId = "MeasureElevationHeight";//捕捉dom的根节点
	_elevationHeightMeasure.TotalMeasures = []; //所有测量点集合
	_elevationHeightMeasure.isActive = false; //测量点是否激活
	let AnimationFrame = null //动画
	let CAMERA_POSITION;
	let DrawDomeId; // 视点绘画捕捉dom的根节点
	_elevationHeightMeasure.PinkClick = true; // 标记点是否点击
	//激活
	_elevationHeightMeasure.Active = function(dom) {
		_elevationHeightMeasure.PinkClick = true;
		DrawDomeId = dom
		_Engine.CaptureMark.Active()
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointerup', onMouseUp);
		window.addEventListener('keydown', DeleteMeasureItem);//监听键盘delete
		_Engine.StopClick = true

		function render() {
			AnimationFrame = requestAnimationFrame(render);
			_elevationHeightMeasure.TotalMeasures && Animate_MeasurePoints(_elevationHeightMeasure.TotalMeasures)
		}
		render() //开启动画
		_elevationHeightMeasure.isActive = true
	}
	//关闭
	_elevationHeightMeasure.DisActive = function() {
		_Engine.CaptureMark.DisActive()
		var root = getRootDom(_container, MeasureDomeId, false);
		root && root.remove() //删除坐标点dom
		DrawDomeId && ResetCurrentDom()
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointerup', onMouseUp);
		window.removeEventListener('keydown',DeleteMeasureItem)
		_Engine.StopClick = false
		cancelAnimationFrame(AnimationFrame) //清除动画
		_elevationHeightMeasure.isActive = false
		_elevationHeightMeasure.TotalMeasures = []
	}
	
	//创建测量标记
	_elevationHeightMeasure.CreateMeasureDom = function(dom, list) {
		DrawDomeId = dom
		_elevationHeightMeasure.PinkClick = false
		for (let item of list) {
			item.position = new THREE.Vector3(item.position.x, item.position.y, item.position.z)
			renderPoint(item, false)
		}
	}

	// 开启监听键盘delete
	_elevationHeightMeasure.OpenDrawDeleteListener = function() {
		CurrentDom = null
		_elevationHeightMeasure.PinkClick = true
		window.addEventListener('keydown', DeleteDrawMeasureItem);
	}

	//清除键盘delete
	_elevationHeightMeasure.CloseDrawDeleteListener = function() {
		_elevationHeightMeasure.PinkClick = false
		window.removeEventListener('keydown',DeleteDrawMeasureItem);
	}

	// 视点中-选中标记点-点击delete可删除
	function DeleteDrawMeasureItem(e) {
		if(!_elevationHeightMeasure.isActive){
			if (e.key === "Delete" && CurrentDom) {
				var root = getRootDom(_container, DrawDomeId, false)
				root && root.removeChild(CurrentDom)
				ResetCurrentDom()
			}
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
				if(_Engine.CaptureMark.Position){
					let Position = JSON.parse(JSON.stringify(_Engine.CaptureMark.Position)) 
					let pos = new THREE.Vector3(Position.worldPoint.x, Position.worldPoint.y, Position.worldPoint.z)
					_Engine.scene.controls.origin = pos;
					let point = {
						position: pos,
						id: guidId()
					}
					if(Position.capture && (Position.capture.type === "point" || Position.capture.type === "line")){
						point.position = new THREE.Vector3(Position.capture.val.x, Position.capture.val.y, Position.capture.val.z)
					}
					_elevationHeightMeasure.TotalMeasures.push(JSON.parse(JSON.stringify(point)))
					renderPoint(point)
				}
			}
		}
	}

	//鼠标移动更新标记点位置标
	function Animate_MeasurePoints(TotalMeasures) {
		if(_Engine.scene==null){
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
				.position.z), _Engine.scene.camera);
			if (position != null) {
				let offy = position.y
				let offx = position.x;
				item.style.top = (offy - 40) + "px";
				item.style.left = (offx - 13) + "px";
			}
		}
	}

	//渲染选中点
	function renderPoint(point, active = true) {
		let DomeId = DrawDomeId?DrawDomeId:MeasureDomeId
		var root = getRootDom(_container, DomeId)
		// 当前点dom
		var height_item = document.createElement("div");
		let itemClassName = active?"HeightItem Actived":"HeightItem";
		height_item.className = itemClassName;
		height_item.dataset.dataInfo = JSON.stringify(point);
		height_item.dataset.dataId = point.id;
		height_item.dataset.cameraId = _Engine.scene.camera.type + "_" + _Engine.scene.camera.Id;
		height_item.id = point.id;
		CurrentDom = height_item;
		let item_box = document.createElement("div");
		item_box.className = "Box";
		item_box.dataset.dataId = point.id;
		item_box.innerText = Math.floor(point.position.y * 1000) / 1000 + "m";
		height_item.appendChild(item_box);
		let NS_SVG = 'http://www.w3.org/2000/svg'
		let pink_svg = document.createElementNS(NS_SVG, 'svg')
		pink_svg.setAttribute('style', 'width:65px;height:13px;display:block;pointer-events:none;')
		pink_svg.dataset.dataId = point.id;
		let pink_polygon = document.createElementNS(NS_SVG, "polygon")
		pink_polygon.setAttribute('points', '0,0 65,0 26,0 13,13 0,0')
		pink_polygon.setAttribute('style', 'fill:none;stroke:rgba(0,155,255,1);stroke-width:2;pointer-events:none;')
		pink_svg.appendChild(pink_polygon);
		height_item.appendChild(pink_svg);
		root.appendChild(height_item);
		height_item.addEventListener('click',(e)=>{
			if(e.target.dataset.dataId){//选择标记
				ResetCurrentDom(e.target.dataset.dataId)
			}else{// 非标记
				ResetCurrentDom()
			}
		})
		const printPoint = worldPointToScreenPoint(point.position, _Engine.scene.camera); //世界坐标转为屏幕坐标
		height_item.style.top = (printPoint.y - 40) + "px";
		height_item.style.left = (printPoint.x - 13) + "px";
	}

	// 选中标记点-点击delete可删除
	function DeleteMeasureItem(e) {
		if (e.key === "Delete" && CurrentDom) {
			let index = _elevationHeightMeasure.TotalMeasures.findIndex(item => item.id === CurrentDom.id);
			_elevationHeightMeasure.TotalMeasures.splice(index, 1)
			let DomeId = DrawDomeId?DrawDomeId:MeasureDomeId
			var root = getRootDom(_container, DomeId, false)
			root && root.removeChild(CurrentDom)
			ResetCurrentDom()
		}
	}

	function ResetCurrentDom(id){
		if (!_elevationHeightMeasure.isActive && !_elevationHeightMeasure.PinkClick){
			return
		}
		let DomeId = DrawDomeId?DrawDomeId:MeasureDomeId
		var root = getRootDom(_container, DomeId, false)
		if(!root){
			return
		}
		let DomList = root.children
		for (let item of DomList) {
			if(item.id){
				item.className = "HeightItem"
			}
		}
		CurrentDom = null
		if(id){
			for (let item of DomList) {
				if(item.id === id){
					item.className = "HeightItem Actived"
					CurrentDom = item
					break
				}
			}
		}
	}
	return _elevationHeightMeasure;
}
