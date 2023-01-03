const THREE = require('three')
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
} from "./MeasurePink"
export function pointMeasure(bimengine) {
	var _pointMeasure = new Object();
	var _container = bimengine.scene.renderer.domElement.parentElement;
	var camera = bimengine.scene.camera;
	let MeasurePink_Quadrangle; //渲染捕捉点
	let MeasurePink_Triangle; //渲染捕捉中点三角形
	let MeasurePink_Area; //渲染捕捉面
	let CurrentDom; //当前选中的dom
	_pointMeasure.TotalMeasures = []; //所有测量点集合
	_pointMeasure.MouseEvent = null; //跟随鼠标的位置参数
	let AnimationFrame = null //动画
	let CAMERA_POSITION, PINK_DETAILS = {
		type: "area",
		val: null,
		isCenter: false
	}
	//激活
	_pointMeasure.Active = function() {
		let pinks = renderMeasurePink('MeasurePoint')//渲染捕捉点
		MeasurePink_Triangle = pinks.Triangle
		MeasurePink_Quadrangle = pinks.Quadrangle
		MeasurePink_Area = pinks.Area
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointerup', onMouseUp);
		_container.addEventListener('pointermove', onMouseMove);
		window.addEventListener('keydown', function(e) { //监听键盘delete
			if(e.key === "Delete" && CurrentDom){
				document.getElementById("MeasurePoint").removeChild(CurrentDom)
				CurrentDom = null
			}
		});
		_pointMeasure.models = bimengine.GetAllVisibilityModel();
		_container.className = "custom-cursor"
		bimengine.StopClick = true

		function render() {
			AnimationFrame = requestAnimationFrame(render);
			_pointMeasure.MouseEvent && Animate_MeasurePointPink(_pointMeasure.MouseEvent)
			_pointMeasure.TotalMeasures && Animate_MeasurePoints(_pointMeasure.TotalMeasures)
		}
		render() //开启动画
	}
	//关闭
	_pointMeasure.DisActive = function() {
		var root = document.getElementById("MeasurePoint");
		root && root.remove() //删除坐标点dom
		_container.removeEventListener('pointerup', onMouseUp);
		_container.removeEventListener('pointermove', onMouseMove);
		_container.className = "default-cursor"
		bimengine.StopClick = false
		cancelAnimationFrame(AnimationFrame) //清除动画
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
		_pointMeasure.MouseEvent = {
			x: event.clientX,
			y: event.clientY,
			event : event
		}
	}
	//鼠标抬起
	function onMouseUp(event) {
		CurrentDom = null
		if(!(event.target instanceof HTMLCanvasElement)){ //当点击不在场景上，直接返回
			return;
		}
		if (event.button === 0) {
			if (Math.abs(event.x - CAMERA_POSITION.x) < 2 && Math.abs(event.y - CAMERA_POSITION.y) < 2) {
				let rayCaster = new THREE.Raycaster();
				let mouse = new THREE.Vector2();
				mouse.x = ((event.clientX - document.body.getBoundingClientRect().left) / document.body.offsetWidth) *
					2 - 1;
				mouse.y = -((event.clientY - document.body.getBoundingClientRect().top) / document.body.offsetHeight) *
					2 + 1;
				//这里为什么是-号，没有就无法点中
				rayCaster.setFromCamera(mouse, camera);
				let intersects = rayCaster.intersectObjects(_pointMeasure.models, true);
				if (intersects.length > 0) {
					let point = {
						position: intersects[0].point.clone(),
						id: guid()
					}
					if(PINK_DETAILS.type === "point" || PINK_DETAILS.type === "line"){
						point.position = new THREE.Vector3(PINK_DETAILS.val.x, PINK_DETAILS.val.y, PINK_DETAILS.val.z)
					}
					_pointMeasure.TotalMeasures.push(JSON.parse(JSON.stringify(point)))
					renderPoint(point)
				}
			}
		}
	}
	//鼠标移动更新捕捉点位置
	function Animate_MeasurePointPink(mouseEvent) {
		MeasurePink_Quadrangle.style.display = "none";
		MeasurePink_Triangle.style.display = "none";
		MeasurePink_Area.style.display = "none";
		clearDrawLineModel(bimengine.scene)
		PINK_DETAILS = {
			type: "area",
			val: null,
			isCenter: false
		}
		if(!(mouseEvent.event.target instanceof HTMLCanvasElement)){ //当鼠标不在场景上，直接返回
			return;
		}
		let rayCaster = new THREE.Raycaster();
		let mouse = new THREE.Vector2();
		mouse.x = ((mouseEvent.x - document.body.getBoundingClientRect().left) / document.body.offsetWidth) * 2 - 1;
		mouse.y = -((mouseEvent.y - document.body.getBoundingClientRect().top) / document.body.offsetHeight) * 2 + 1;
		//这里为什么是-号，没有就无法点中
		rayCaster.setFromCamera(mouse, camera);
		let intersects = rayCaster.intersectObjects(_pointMeasure.models, true);
		if (intersects.length) {
			let intersect = intersects[0]
			if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName == "PipeMesh") {
				var clickObj = IncludeElement(intersect.object.ElementInfos, intersect
					.point); //选中的构建位置信息
				if (clickObj != null && (intersect.object.hideElements == null || !intersect.object.hideElements
						.includes(clickObj.dbid))) {
					let EdgeList = intersect.object.ElementInfos[clickObj.dbid].EdgeList
					PINK_DETAILS = getPinkType(bimengine.scene, intersect, EdgeList)
				}
			} else if (intersects[0].object.TypeName == "InstancedMesh") {
				let EdgeList = intersect.object.ElementInfos[intersect.instanceId].EdgeList
				PINK_DETAILS = getPinkType(bimengine.scene, intersect, EdgeList)
			}
		}
		switch (PINK_DETAILS.type) {
			case "area":
				if (intersects.length) {
					// drawCircle(bimengine.scene, intersects[0].point, intersects[0].face.normal)
					//新增
					let areaPoints = PINK_DETAILS.val.map(item=>{
						let p = worldPointToScreenPoint(new THREE.Vector3(item.x, item.y, item.z), camera)
						return p.x+','+p.y
					})
					MeasurePink_Area.style.display = "block";
					MeasurePink_Area.firstChild.setAttribute('points', areaPoints.join(' '))
				}
				break;
			case "line":
				drawLine(bimengine.scene, PINK_DETAILS.line)
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

	//鼠标移动更新标记点位置标
	function Animate_MeasurePoints(TotalMeasures) {
		for (let measure of TotalMeasures) {
			let position = worldPointToScreenPoint(new THREE.Vector3(measure.position.x, measure.position.y, measure
				.position.z), camera);
			if (position != null) {
				let item = document.getElementById(measure.id);
				if (item) {
					item.style.top = position.y + "px";
					item.style.left = position.x + "px";
				}
			}
		}
	}

	//渲染选中点
	function renderPoint(point) {
		var root = getRootDom(_container)
		// 当前点dom
		var point_item = document.createElement("div");
		point_item.className = "PointItem";
		point_item.id = point.id;
		root.appendChild(point_item);
		var item_contain = document.createElement("div");
		item_contain.className = "ItemContain";
		point_item.appendChild(item_contain);
		point_item.addEventListener('click',(e)=>{
			let item = e.path.filter(item=>{ return item.className === "PointItem"})
			CurrentDom = item && item.length?item[0]:null
		})
		//三维坐标包裹dom
		var point_xyz = document.createElement("div");
		point_xyz.className = "PointXYZ";
		item_contain.appendChild(point_xyz);

		// X轴坐标信息dom
		var x_line = document.createElement("div");
		x_line.className = "Point PointX";
		var x_span = document.createElement("span");
		x_span.className = "Span";
		x_span.innerText = "X";
		x_line.appendChild(x_span);
		var x_text = document.createElement("span");
		x_text.className = "Text";
		x_text.innerText = Math.ceil(point.position.x * 1000);
		x_line.appendChild(x_text);
		point_xyz.appendChild(x_line);
		// Y轴坐标信息dom
		var y_line = document.createElement("div");
		y_line.className = "Point PointY";
		var y_span = document.createElement("span");
		y_span.className = "Span";
		y_span.innerText = "Y";
		y_line.appendChild(y_span);
		var y_text = document.createElement("span");
		y_text.className = "Text";
		y_text.innerText = Math.ceil(point.position.y);
		y_line.appendChild(y_text);
		point_xyz.appendChild(y_line);
		// Z轴坐标信息dom
		var z_line = document.createElement("div");
		z_line.className = "Point PointZ";
		var z_span = document.createElement("span");
		z_span.className = "Span";
		z_span.innerText = "Z";
		z_line.appendChild(z_span);
		var z_text = document.createElement("span");
		z_text.className = "Text";
		z_text.innerText = Math.ceil(point.position.z);
		z_line.appendChild(z_text);
		point_xyz.appendChild(z_line);

		const printPoint = worldPointToScreenPoint(point.position, bimengine.scene.camera); //世界坐标转为屏幕坐标
		point_item.style.top = (printPoint.y - 5) + "px";
		point_item.style.left = (printPoint.x - 5) + "px";
	}
	//获得点标记的dom根节点
	function getRootDom(_container) {
		var root = document.getElementById("MeasurePoint");
		if (root == null) { //不存在点标记包裹div
			root = document.createElement("div");
			root.id = "MeasurePoint";
			_container.appendChild(root);
		}
		return root
	}
	//屏幕坐标转时接坐标
	function screenPointToWorldPoint(pos, camera) {
		const mouseX = pos.x;
		const mouseY = pos.y;
		const x = (mouseX / window.innerWidth) * 2 - 1;
		const y = -(mouseY / window.innerHeight) * 2 + 1;
		const stdVector = new THREE.Vector3(x, y, 0.5);
		const worldVector = stdVector.unproject(camera);
		return worldVector
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
