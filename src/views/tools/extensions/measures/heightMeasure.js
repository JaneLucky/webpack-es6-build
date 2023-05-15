const THREE = require('@/three/three.js')
import {
	SetDeviceStyle
} from "@/views/tools/style/deviceStyleSet.js"
import {
	worldPointToScreenPoint
} from "@/views/tools/common/index.js"
import {
	IncludeElement,
	ClipInclude
} from "@/views/tools/initialize/InitEvents.js"
import {
	getRootDom,
	guidId
} from './index.js'
export function heightMeasure(_Engine) {
	require('@/views/tools/style/' + SetDeviceStyle() + '/measuresStyle.scss')
	var _heightMeasure = new Object();
	var _container = _Engine.scene.renderer.domElement.parentElement;
	var _sceneContainer = _Engine.scene.renderer.domElement;
	var camera = _Engine.scene.camera;
	let CurrentDom; //当前选中的dom
	let MeasureDomeId = "MeasureHeight"; //捕捉dom的根节点
	_heightMeasure.TotalMeasures = []
	_heightMeasure.isActive = false; //测量净高是否激活
	let AnimationFrame = null //动画
	let CAMERA_POSITION;
	let FormList = [{
			name: "HType",
			checked: "0",
			children: [{
					label: "底部标高",
					value: "0"
				},
				{
					label: "中心标高",
					value: "1"
				},
				{
					label: "顶部标高",
					value: "2"
				}
			]
		},
		{
			name: "VerticalType",
			checked: "0",
			children: [{
					label: "竖直净高",
					value: "0"
				},
				{
					label: "垂直净高",
					value: "1"
				}
			]
		},
		{
			name: "Direction",
			checked: "1",
			children: [{
					label: "向上",
					value: "0"
				},
				{
					label: "向下",
					value: "1"
				}
			]
		}
	]
	let DrawDomeId; // 视点绘画捕捉dom的根节点
	_heightMeasure.PinkClick = true; // 标记点是否点击
	//激活功能
	_heightMeasure.Active = function(dom) {
		_heightMeasure.PinkClick = true;
		DrawDomeId = dom
		CreateUI(_container);
		_heightMeasure.models = _Engine.GetAllVisibilityModel();
		// if(_Engine.EngineRay){
		// 	_Engine.EngineRay.Active()
		// 	_heightMeasure.models = _heightMeasure.models.filter(o => o.TypeName == "InstancedMesh" || o
		// 		.TypeName == "InstancedMesh-Pipe");
		// 		_heightMeasure.models.push(_Engine.scene.children[5]);
		// }
		_Engine.ResetSelectedModels_("highlight", [], true);
		_sceneContainer.addEventListener('pointerdown', onMouseDown);
		_sceneContainer.addEventListener('pointermove', onMouseMove);
		_sceneContainer.addEventListener('pointerup', onMouseUp);
		window.addEventListener('keydown', DeleteMeasureItem); //监听键盘delete
		_Engine.StopClick = true

		function render() {
			AnimationFrame = requestAnimationFrame(render);
			_heightMeasure.TotalMeasures && Animate_MeasureLines(_heightMeasure.TotalMeasures)
		}
		render() //开启动画
		_heightMeasure.isActive = true
	}
	//取消功能
	_heightMeasure.DisActive = function() {
		_sceneContainer.removeEventListener('pointerdown', onMouseDown);
		_sceneContainer.removeEventListener('pointermove', onMouseMove);
		_sceneContainer.removeEventListener('pointerup', onMouseUp);
		window.removeEventListener('keydown', DeleteMeasureItem)
		_Engine.StopClick = false
		cancelAnimationFrame(AnimationFrame) //清除动画
		var MeasuePanel = getRootDom(_container, "HeightMeasuePanel", false)
		MeasuePanel && MeasuePanel.remove() //删除坐标点dom
		var root = getRootDom(_container, MeasureDomeId, false)
		root && root.remove() //删除坐标点dom
		DrawDomeId && ResetCurrentDom()
		_heightMeasure.isActive = false
		_heightMeasure.TotalMeasures = []
	}

	//创建测量标记
	_heightMeasure.CreateMeasureDom = function(dom, list) {
		DrawDomeId = dom
		_heightMeasure.PinkClick = false
		list.map(item => {
			if (item.start) {
				item.start = new THREE.Vector3(item.start.x, item.start.y, item.start.z)
			}
			if (item.end) {
				item.end = new THREE.Vector3(item.end.x, item.end.y, item.end.z)
			}
			return item
		})
		Animate_MeasureLines(list, false)
	}

	// 开启监听键盘delete
	_heightMeasure.OpenDrawDeleteListener = function() {
		CurrentDom = null
		_heightMeasure.PinkClick = true
		window.addEventListener('keydown', DeleteDrawMeasureItem);
	}

	//清除键盘delete
	_heightMeasure.CloseDrawDeleteListener = function() {
		_heightMeasure.PinkClick = false
		window.removeEventListener('keydown', DeleteDrawMeasureItem);
	}

	// 视点中-选中标记点-点击delete可删除
	function DeleteDrawMeasureItem(e) {
		if (!_heightMeasure.isActive) {
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

	//移动
	function onMouseMove() {

	}

	//鼠标弹起
	function onMouseUp(event) {
		ResetCurrentDom()
		if (event.button === 0) {
			if (Math.abs(event.x - CAMERA_POSITION.x) < 2 && Math.abs(event.y - CAMERA_POSITION.y) < 2) {
				var pickobject = null
				//声明 rayCaster 和 mouse 变量
				let rayCaster = new THREE.Raycaster();
				let mouse = new THREE.Vector2();
				//通过鼠标点击位置，计算出raycaster所需点的位置，以屏幕为中心点，范围-1到1
				mouse.x = ((event.clientX - _Engine.scene.camera.viewport.x) / _Engine.scene.camera.viewport.z) * 2 - 1;
				mouse.y = -((event.clientY - _Engine.scene.camera.viewport.y) / _Engine.scene.camera.viewport.w) * 2 +
				1; //这里为什么是-号，没有就无法点中

				//通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
				rayCaster.setFromCamera(mouse, _Engine.scene.camera);
				//获取与射线相交的对象数组， 其中的元素按照距离排序，越近的越靠前。
				//+true，是对其后代进行查找，这个在这里必须加，因为模型是由很多部分组成的，后代非常多。
				let intersects = (rayCaster.intersectObjects(_heightMeasure.models, true));
				if (intersects.length > 0) {
					_Engine.scene.controls.origin = intersects[0].point;
					for (var intersect of intersects) {
						if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName == "Mesh-Structure" ||
							intersect.object.TypeName == "PipeMesh") {
							var clickObj = IncludeElement(_Engine, intersect.object, intersect.point); //选中的构建位置信息
							if (clickObj && intersect.object.geometry.groups[clickObj.dbid].visibility !== false) {
								pickobject = {
									dbid: clickObj.dbid,
									name: clickObj.name,
									glb: intersect.object.url,
									TypeName: intersect.object.TypeName,
									basePath: clickObj.basePath,
									relativePath: clickObj.relativePath,
									indexs: [intersect.object.index, clickObj.dbid]
								}
								break;
							}
						} else if (intersect.object.TypeName == "InstancedMesh" || intersect.object.TypeName ==
							"InstancedMesh-Pipe") {
							if (!ClipInclude(intersect.object.ElementInfos[intersect.instanceId].min, intersect.object
									.ElementInfos[intersect.instanceId].max, intersect.object.material.clippingPlanes
									)) {
								pickobject = {
									dbid: intersect.instanceId,
									name: intersect.object.ElementInfos[intersect.instanceId].name,
									glb: intersect.object.url,
									TypeName: intersect.object.TypeName,
									basePath: intersect.object.ElementInfos[0].basePath,
									relativePath: intersect.object.ElementInfos[0].relativePath,
									indexs: [intersect.object.index, intersect.instanceId]
								}
								break;
							}
						}
					}
				}

				if (pickobject == null || pickobject.glb == null) {
					return;
				}
				//获取模型的box数据
				var item = _Engine.scene.children[pickobject.indexs[0]].ElementInfos[pickobject.dbid];
				var setting = GetMeasureSettingType();
				var ray_result = intersects ? intersects[0] : null;
				if (ray_result == null) {
					return;
				}
				//获取射线数据
				let ray_dir;
				let ray_point;
				let pickInster = ray_result;
				let offset;
				switch (setting.HType) {
					case "0":
						//底
						ray_point = new THREE.Vector3(pickInster.point.x, item.min.y, pickInster.point.z);
						break;
					case "1":
						//中
						ray_point = new THREE.Vector3(pickInster.point.x, item.center.y, pickInster.point.z);
						break;
					case "2":
						//顶
						ray_point = new THREE.Vector3(pickInster.point.x, item.max.y, pickInster.point.z);
						break;
				}
				switch (setting.Direction) {
					case "0": //向上
						ray_dir = new THREE.Vector3(0, 1, 0);
						break;
					case "1": //向下
						ray_dir = new THREE.Vector3(0, -1, 0);
						break;
				}
				if (setting.VerticalType == "1") { // 垂直净高(默认：竖直净高)
					//取地面法向量
					var result1 = rayDirectResult(ray_point, ray_dir);
					if (!result1) {
						return
					}
					ray_dir = result1[0].face.normal.clone().multiplyScalar(-1);
				}
				//接下来就是获取碰撞
				var results = rayDirectResult(ray_point, ray_dir);
				if (results) {
					//遍历，找到不在包围盒范围内的数据 
					for (let i = 0; i < results.length; i++) {
						// if(results[i].object.uuid==){
						// 	continue;
						// }
						let picker = results[i].point;
						if (picker.y >= item.min.y - 0.3 && picker.y <= item.max.y + 0.3) {
							continue;
						}
						//接下来就是绘制两点了  
						var currentMeasure = {
							start: ray_point,
							end: picker,
							dis: ray_point.distanceTo(picker),
							id: guidId()
						}
						_heightMeasure.TotalMeasures.push(currentMeasure)
						_Engine.CurrentSelect = null
						break
					}
				}
			}
		}
	}

	//鼠标移动更新标记线位置
	function Animate_MeasureLines(TotalMeasures, active = true) {
		if (TotalMeasures.length == 0) {
			return;
		}
		let DomeId = DrawDomeId ? DrawDomeId : MeasureDomeId
		var root = getRootDom(_container, DomeId)
		for (var measure of TotalMeasures) {
			if (measure.start == null) {
				continue;
			}

			let vectorStart = new THREE.Vector3(measure.start.x, measure.start.y, measure.start.z)
			let vectorEnd = new THREE.Vector3(measure.end.x, measure.end.y, measure.end.z)
			let vectorCenter = new THREE.Vector3((measure.start.x + measure.end.x) / 2, (measure.start.y + measure.end
				.y) / 2, (measure.start.z + measure.end.z) / 2)

			let tempS = vectorStart.clone().applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera
				.projectionMatrix);
			let outSceneS = (Math.abs(tempS.x) > 1) || (Math.abs(tempS.y) > 1) || (Math.abs(tempS.z) > 1)
			let tempE = vectorEnd.clone().applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
			let outSceneE = (Math.abs(tempE.x) > 1) || (Math.abs(tempE.y) > 1) || (Math.abs(tempE.z) > 1)
			let tempC = vectorCenter.clone().applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera
				.projectionMatrix);
			let outSceneC = (Math.abs(tempC.x) > 1) || (Math.abs(tempC.y) > 1) || (Math.abs(tempC.z) > 1)
			var line_item = document.getElementById(measure.id);
			if (outSceneS && outSceneE && outSceneC) {
				line_item && (line_item.style.display = "none")
				continue
			}
			line_item && (line_item.style.display = "block")

			var start = worldPointToScreenPoint(vectorStart, camera);
			var end = worldPointToScreenPoint(vectorEnd, camera);

			if (start != null && end != null) {
				var line_item = document.getElementById(measure.id);
				if (line_item == null) {
					//新增坐标点
					line_item = document.createElement("div");
					line_item.id = measure.id;
					let itemClassName = active ? "LineItem Temporary LineFinal Actived" :
					"LineItem Temporary LineFinal";
					line_item.className = itemClassName;
					line_item.dataset.dataId = measure.id;
					line_item.dataset.cameraId = _Engine.scene.camera.type + "_" + _Engine.scene.camera.Id;
					line_item.dataset.dataInfo = JSON.stringify(measure);
					line_item.addEventListener('click', (e) => {
						if (e.target.dataset.dataId) { //选择标记
							ResetCurrentDom(e.target.dataset.dataId)
						} else { // 非标记
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
			let index = _heightMeasure.TotalMeasures.findIndex(item => item.id === CurrentDom.id);
			_heightMeasure.TotalMeasures.splice(index, 1)
			let DomeId = DrawDomeId ? DrawDomeId : MeasureDomeId
			var root = getRootDom(_container, DomeId, false)
			root && root.removeChild(CurrentDom)
			ResetCurrentDom()
		}
	}

	function ResetCurrentDom(id) {
		if (!_heightMeasure.isActive && !_heightMeasure.PinkClick) {
			return
		}
		let DomeId = DrawDomeId ? DrawDomeId : MeasureDomeId
		var root = getRootDom(_container, DomeId, false)
		if (!root) {
			return
		}
		let DomList = root.children
		for (let item of DomList) {
			if (item.id) {
				item.className = "LineItem Temporary LineFinal"
			}
		}
		CurrentDom = null
		if (id) {
			for (let item of DomList) {
				if (item.id === id) {
					item.className = "LineItem Temporary LineFinal Actived"
					CurrentDom = item
					break
				}
			}
		}
	}


	function CreateUI(domElem) {
		let dom = document.createElement("div");
		dom.className = "HeightMeasuePanel";
		for (let i = 0; i < FormList.length; i++) {
			let item = FormList[i]
			let form_item = document.createElement("div");
			form_item.className = "form_item";

			for (let child of item.children) {
				let label = document.createElement("label");
				label.className = "label";
				let input = document.createElement("input");
				input.className = "radio_input";
				input.type = "radio";
				input.name = item.name;
				input.value = child.value;
				input.checked = item.checked === child.value ? true : false;
				input.addEventListener("change", () => {
					FormList[i].checked = input.value
				})
				let labelTxt = document.createElement("span");
				labelTxt.className = "label_txt";
				labelTxt.innerText = child.label
				label.appendChild(input);
				label.appendChild(labelTxt);
				form_item.appendChild(label);
			}
			dom.appendChild(form_item);
		}


		var html = [
			"<div style='margin-top: 15px;'>",
			"<label style='margin-left: 10px;'><input class='measure_HType radio_input' type='radio' name='HType' checked='true' value='0'>底部标高</label>",
			"<label style='margin-left: 10px;'><input class='measure_HType radio_input' type='radio' name='HType' value='1'>中心标高</label>",
			"<label style='margin-left: 10px;'><input class='measure_HType radio_input' type='radio' name='HType' value='2'>顶部标高</label>",
			"</div>",
			"<div style='margin-top: 15px;'>",
			"<label style='margin-left: 10px;'><input class='measure_VerticalType radio_input' type='radio' checked='true' name='VerticalType' value='0'>竖直净高</label>",
			"<label style='margin-left: 10px;'><input class='measure_VerticalType radio_input' type='radio' name='VerticalType' value='1'>垂直净高</label>",
			"</div>",
			"<div style='margin-top: 15px;'>",
			"<label style='margin-left: 10px;'><input class='measure_Direction radio_input' type='radio' name='Direction' value='0'>向上</label>",
			"<label style='margin-left: 38px;'><input class='measure_Direction radio_input' type='radio' checked='true' name='Direction' value='1'>向下</label>",
			"</div>"
		].join('');
		// dom.innerHTML = html;
		domElem.appendChild(dom);
	}
	//获取设置数据
	function GetMeasureSettingType() {
		return {
			HType: FormList[0].checked,
			VerticalType: FormList[1].checked,
			Direction: FormList[2].checked,
		}
		var HTypeElements = document.getElementsByClassName("measure_HType radio_input");
		var VerticalTypeElements = document.getElementsByClassName("measure_VerticalType radio_input");
		var DirectionElements = document.getElementsByClassName("measure_Direction radio_input");
		var Setting = {
			HType: 0,
			VerticalType: 0,
			Direction: 1
		}
		//有了默认值
		for (var val of HTypeElements) {
			if (val.checked) {
				Setting.HType = val.value;
				break;
			}
		}
		for (var val of VerticalTypeElements) {
			if (val.checked) {
				Setting.VerticalType = val.value;
				break;
			}
		}
		for (var val of DirectionElements) {
			if (val.checked) {
				Setting.Direction = val.value;
				break;
			}
		}
		return Setting;
	}
	//射线结果
	function rayDirectResult(start, normal) {
		var ray = new THREE.Raycaster(start.clone().add(normal.clone().multiplyScalar(0.01)), normal.clone());
		var intersects = ray.intersectObjects(_heightMeasure.models);
		let bkIntersect = []
		console.log(intersects)
		for (let intersect of intersects) {
			if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName == "Mesh-Structure" || intersect.object
				.TypeName == "PipeMesh") {
				var clickObj = IncludeElement(_Engine, intersect.object, intersect.point); //选中的构建位置信息
				if (clickObj && intersect.object.geometry.groups[clickObj.dbid].visibility !== false) {
					bkIntersect.push(intersect)
				}
			} else {
				bkIntersect.push(intersect)
			}
		}

		if (bkIntersect.length > 0) {
			return bkIntersect;
		} else {
			return null;
		}
	}

	function rayCameraResult(evt) {
		let rayCaster = new THREE.Raycaster();
		let mouse = new THREE.Vector2();
		mouse.x = ((evt.clientX - _Engine.scene.camera.viewport.x) / _Engine.scene.camera.viewport.z) * 2 - 1;
		mouse.y = -((evt.clientY - _Engine.scene.camera.viewport.y) / _Engine.scene.camera.viewport.w) * 2 + 1;
		//这里为什么是-号，没有就无法点中
		rayCaster.setFromCamera(mouse, _Engine.scene.camera);
		let intersects = rayCaster.intersectObjects(_heightMeasure.models, true);
		if (intersects.length > 0) {
			return intersects[0];
		} else {
			return null;
		}
	}
	return _heightMeasure;
}