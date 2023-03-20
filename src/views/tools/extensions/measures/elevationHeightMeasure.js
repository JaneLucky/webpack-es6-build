const THREE = require('@/three/three.js')
import {
	worldPointToScreenPoint
} from "@/views/tools/common/index.js"
export function elevationHeightMeasure(bimengine) {
	var _elevationHeightMeasure = new Object();
	var _container = bimengine.scene.renderer.domElement.parentElement;
	var camera = bimengine.scene.camera;
	let CurrentDom; //当前选中的dom
  let MeasureDomeId = "MeasureElevationHeight";//捕捉dom的根节点
	_elevationHeightMeasure.TotalMeasures = []; //所有测量点集合
	_elevationHeightMeasure.isActive = false; //测量点是否激活
	let AnimationFrame = null //动画
	let CAMERA_POSITION;
	//激活
	_elevationHeightMeasure.Active = function() {
		bimengine.CaptureMark.Active()
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointerup', onMouseUp);
		window.addEventListener('keydown', DeleteMeasureItem);//监听键盘delete
		bimengine.StopClick = true

		function render() {
			AnimationFrame = requestAnimationFrame(render);
			_elevationHeightMeasure.TotalMeasures && Animate_MeasurePoints(_elevationHeightMeasure.TotalMeasures)
		}
		render() //开启动画
		_elevationHeightMeasure.isActive = true
	}
	//关闭
	_elevationHeightMeasure.DisActive = function() {
		bimengine.CaptureMark.DisActive()
		var root = getRootDom(_container);
		root && root.remove() //删除坐标点dom
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointerup', onMouseUp);
		window.removeEventListener('keydown',DeleteMeasureItem)
		bimengine.StopClick = false
		cancelAnimationFrame(AnimationFrame) //清除动画
		_elevationHeightMeasure.isActive = false
		_elevationHeightMeasure.TotalMeasures = []
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
					_elevationHeightMeasure.TotalMeasures.push(JSON.parse(JSON.stringify(point)))
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
				item.style.top = (offy - 40) + "px";
				item.style.left = (offx - 13) + "px";
			}
		}
	}

	//渲染选中点
	function renderPoint(point) {
		var root = getRootDom(_container)
		// 当前点dom
		var height_item = document.createElement("div");
		height_item.className = "HeightItem Actived";
		height_item.dataset.dataId = point.id;
		height_item.dataset.cameraId = bimengine.scene.camera.type + "_" + bimengine.scene.camera.Id;
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
			console.log(e.target.dataset.dataId)
			if(e.target.dataset.dataId){//选择标记
				ResetCurrentDom(e.target.dataset.dataId)
			}else{// 非标记
				ResetCurrentDom()
			}
		})
		const printPoint = worldPointToScreenPoint(point.position, bimengine.scene.camera); //世界坐标转为屏幕坐标
		height_item.style.top = (printPoint.y - 40) + "px";
		height_item.style.left = (printPoint.x - 13) + "px";
	}

	// 选中标记点-点击delete可删除
	function DeleteMeasureItem(e) {
		if (e.key === "Delete" && CurrentDom) {
			let index = _elevationHeightMeasure.TotalMeasures.findIndex(item => item.id === CurrentDom.id);
			_elevationHeightMeasure.TotalMeasures.splice(index, 1)
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
	return _elevationHeightMeasure;
}
