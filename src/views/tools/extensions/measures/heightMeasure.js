const THREE = require('@/three/three.js')
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js"
import {
	worldPointToScreenPoint
} from "@/views/tools/common/index.js"
import { IncludeElement, ClipInclude } from "@/views/tools/initialize/InitEvents.js"
export function heightMeasure(bimengine) {
  require('@/views/tools/style/'+SetDeviceStyle()+'/measuresStyle.scss')
	var _heightMeasure = new Object();
	var _container = bimengine.scene.renderer.domElement;
	var camera = bimengine.scene.camera;
	let CurrentDom; //当前选中的dom
  let MeasureDomeId = "MeasureHeight";//捕捉dom的根节点
	_heightMeasure.TotalMeasures = []
	let AnimationFrame = null //动画
	let CAMERA_POSITION;
	let FormList = [
		{
			name: "HType",
			checked: "0",
			children:[
				{
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
			children:[
				{
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
			children:[
				{
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
	//激活功能
	_heightMeasure.Active = function() {
		CreateUI(bimengine.scene.renderer.domElement.parentElement);
		_heightMeasure.models = bimengine.GetAllVisibilityModel();
		// if(bimengine.EngineRay){
		// 	bimengine.EngineRay.Active()
		// 	_heightMeasure.models = _heightMeasure.models.filter(o => o.TypeName == "InstancedMesh" || o
		// 		.TypeName == "InstancedMesh-Pipe");
		// 		_heightMeasure.models.push(bimengine.scene.children[5]);
		// }
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointermove', onMouseMove);
		_container.addEventListener('pointerup', onMouseUp);
		window.addEventListener('keydown', DeleteMeasureItem);//监听键盘delete
		bimengine.StopClick = true
		function render() {
			AnimationFrame = requestAnimationFrame(render);
			_heightMeasure.TotalMeasures && Animate_MeasureLines(_heightMeasure.TotalMeasures)
		}
		render() //开启动画
	}
	//取消功能
	_heightMeasure.DisActive = function() {
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointermove', onMouseMove);
		_container.removeEventListener('pointerup', onMouseUp);
		window.removeEventListener('keydown',DeleteMeasureItem)
		bimengine.StopClick = false
		cancelAnimationFrame(AnimationFrame) //清除动画
		document.getElementById("HeightMeasuePanel").remove()
		var root = document.getElementById(MeasureDomeId);
		root && root.remove() //删除坐标点dom
		_heightMeasure.TotalMeasures = []
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
				mouse.x = ((event.clientX - bimengine.scene.camera.viewport.x) / bimengine.scene.camera.viewport.z) * 2 - 1;
				mouse.y = -((event.clientY - bimengine.scene.camera.viewport.y) / bimengine.scene.camera.viewport.w) * 2 + 1; //这里为什么是-号，没有就无法点中
					 
				//通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
				rayCaster.setFromCamera(mouse, bimengine.scene.camera);
				//获取与射线相交的对象数组， 其中的元素按照距离排序，越近的越靠前。
				//+true，是对其后代进行查找，这个在这里必须加，因为模型是由很多部分组成的，后代非常多。
				let intersects = (rayCaster.intersectObjects(_heightMeasure.models, true));
				if (intersects.length > 0) {
					bimengine.scene.controls.origin = intersects[0].point;
					for (var intersect of intersects) {
						if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName == "PipeMesh") {
							var clickObj = IncludeElement(intersect.object, intersect.point); //选中的构建位置信息
							if(clickObj && intersect.object.geometry.groups[clickObj.dbid].visibility !== false){
								pickobject = {
									dbid: clickObj.dbid,
									name: clickObj.name,
									glb: intersect.object.url,
									TypeName: intersect.object.TypeName,
									basePath:clickObj.basePath,
									relativePath:clickObj.relativePath,
									indexs:[intersect.object.index, clickObj.dbid]
								}
								break;
							}
						} else if (intersect.object.TypeName == "InstancedMesh" || intersect.object.TypeName == "InstancedMesh-Pipe") {
							if(!ClipInclude(intersect.object.ElementInfos[intersect.instanceId].min, intersect.object.ElementInfos[intersect.instanceId].max, intersect.object.material.clippingPlanes)){
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

				if (pickobject==null || pickobject.glb == null) {
					return;
				}
				//获取模型的box数据
				var item = bimengine.scene.children[pickobject.indexs[0]].ElementInfos[pickobject.dbid];
				var setting = GetMeasureSettingType();
				var ray_result = intersects?intersects[0]:null;
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
					case "0"://向上
						ray_dir = new THREE.Vector3(0, 1, 0);
						break;
					case "1"://向下
						ray_dir = new THREE.Vector3(0, -1, 0);
						break;
				}
				if(setting.VerticalType == "1"){ // 垂直净高(默认：竖直净高)
					//取地面法向量
					var result1 = rayDirectResult(ray_point, ray_dir);
					if (!result1) {
						return
					}
					ray_dir = result1[0].face.normal.clone().multiplyScalar(-1);
				}
				//接下来就是获取碰撞
				var results = rayDirectResult(ray_point, ray_dir);
				if(results){
					//遍历，找到不在包围盒范围内的数据 
					for (let i = 1; i < results.length; i++) {
						let picker = results[i].point;
						if (picker.x >= item.min.x && picker.y >= item.min.y && picker.z >= item.min.z &&
							picker.x <= item.max.x && picker.y <= item.max.y && picker.z <= item.max.z) {
							continue;
						}
						//接下来就是绘制两点了  
						var currentMeasure = {
							start: ray_point,
							end: picker,
							dis: ray_point.distanceTo(picker),
							id: guid()
						}
						_heightMeasure.TotalMeasures.push(currentMeasure)
						bimengine.CurrentSelect = null
						break
					}
				}
			}
		}
	}

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
			let index = _heightMeasure.TotalMeasures.findIndex(item => item.id === CurrentDom.id);
			_heightMeasure.TotalMeasures.splice(index, 1)
			document.getElementById(MeasureDomeId).removeChild(CurrentDom)
			ResetCurrentDom()
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


	function CreateUI(domElem) {
		let dom = document.createElement("div");
		dom.id = "HeightMeasuePanel";
		for (let i=0;i<FormList.length;i++) {
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
				input.addEventListener("change",()=>{
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
		if (intersects.length > 0) {
			return intersects;
		} else {
			return null;
		}
	}

	function rayCameraResult(evt) {
		let rayCaster = new THREE.Raycaster();
		let mouse = new THREE.Vector2();
		mouse.x = ((evt.clientX - bimengine.scene.camera.viewport.x) / bimengine.scene.camera.viewport.z) * 2 - 1;
		mouse.y = -((evt.clientY - bimengine.scene.camera.viewport.y) / bimengine.scene.camera.viewport.w) * 2 + 1;
		//这里为什么是-号，没有就无法点中
		rayCaster.setFromCamera(mouse, bimengine.scene.camera);
		let intersects = rayCaster.intersectObjects(_heightMeasure.models, true);
		if (intersects.length > 0) {
			return intersects[0];
		} else {
			return null;
		}
	}
	//获得点标记的dom根节点
	function getRootDom(domName) {
    var root = document.getElementById(domName);
    if (root == null) { //不存在点标记包裹div
      root = document.createElement("div");
      root.id = domName;
      bimengine.scene.renderer.domElement.parentElement.appendChild(root);
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

	return _heightMeasure;
}
