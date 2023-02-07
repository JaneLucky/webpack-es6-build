const THREE = require('three')
import "./style.scss"
export function heightMeasure(bimengine) {
	var _heightMeasure = new Object();
	var _container = bimengine.scene.renderer.domElement.parentElement;
	var camera = bimengine.scene.camera;
	var drag = true;
	//激活功能
	_heightMeasure.Active = function() {
		CreateUI(_container);
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointermove', onMouseMove);
		_container.addEventListener('pointerup', onMouseUp);
		_heightMeasure.models = bimengine.GetAllVisibilityModel();
		bimengine.Measures.SimpleMeasure.UpdateRender()
	}
	//取消功能
	_heightMeasure.DisActive = function() {
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointermove', onMouseMove);
		_container.removeEventListener('pointerup', onMouseUp);
		bimengine.Measures.SimpleMeasure.DisActive();
		let doms = document.getElementsByClassName("HeightMeasuePanel");
		for (; doms.length >= 1;) {
			doms[0].remove();
		}
	}
	//鼠标弹起
	function onMouseUp(evt) {
		if (evt.button != 0) {
			return;
		}
		if (drag == true) {
			return;
		}
		setTimeout(function() {
			var pickobject = bimEngine.CurrentSelect;
			if (pickobject == null) {
				return;
			}
			//获取模型的box数据
			var item = bimengine.scene.children.filter(x => x.url == pickobject.glb)[0].ElementInfos[pickobject
				.dbid];
			var setting = GetMeasureSettingType();
			var ray_result = rayCameraResult(evt);
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
			switch (setting.VerticalType) {
				case "0":
					ray_dir = new THREE.Vector3(0, -1, 0);
					break;
				case "1":
					ray_dir = new THREE.Vector3(0, -1, 0);
					//然后朝下进行射线
					var result1 = rayDirectResult(ray_point, ray_dir);
					if (result1 != null) {
						ray_dir = result1.face.normal.clone().multiplyScalar(-1);
					}
			}
			if (setting.Direction == 0) {
				ray_dir = new THREE.Vector3(0, 1, 0);
			}
			//接下来就是获取碰撞
			var results = rayDirectResult(ray_point, ray_dir);
			//遍历，找到不在包围盒范围内的数据 
			for (let i = 0; i < results.length; i++) {
				let picker = results[i].point;
				if (picker.x >= item.min.x && picker.y >= item.min.y && picker.z >= item.min.z &&
					picker.x <= item.max.x && picker.y <= item.max.y && picker.z <= item.max.z) {
					continue;
				}
				//接下来就是绘制两点了  
				bimengine.Measures.SimpleMeasure.SetMeasureLine(ray_point, picker);
				break
			}
		}, 100);
	}
	//按下
	function onMouseDown(evt) {
		if (evt.button != 0) {
			return;
		}
		drag = false
		setTimeout(function() {
			drag = true
		}, 100)
	}
	//移动
	function onMouseMove() {

	}



	function CreateUI(domElem) {
		var dom = document.createElement("div");
		dom.className = "HeightMeasuePanel";
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
		dom.innerHTML = html;
		domElem.appendChild(dom);
	}
	//获取设置数据
	function GetMeasureSettingType() {
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
		mouse.x = ((evt.clientX - document.body.getBoundingClientRect().left) / document.body.offsetWidth) * 2 - 1;
		mouse.y = -((evt.clientY - document.body.getBoundingClientRect().top) / document.body.offsetHeight) * 2 + 1;
		//这里为什么是-号，没有就无法点中
		rayCaster.setFromCamera(mouse, camera);
		let intersects = rayCaster.intersectObjects(_heightMeasure.models, true);
		if (intersects.length > 0) {
			return intersects[0];
		} else {
			return null;
		}
	}

	return _heightMeasure;
}
