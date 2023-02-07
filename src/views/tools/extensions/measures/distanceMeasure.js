const THREE = require('three')
export function distanceMeasure(bimengine) {
	var _distanceMeasure = new Object();
	var _container = bimengine.scene.renderer.domElement.parentElement;
	var camera = bimengine.scene.camera;
	var drag = true;
	_distanceMeasure.Active = function() {
		//启动
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointermove', onMouseMove);
		_container.addEventListener('pointerup', onMouseUp)
		_distanceMeasure.models = bimengine.GetAllVisibilityModel();
		bimengine.Measures.SimpleMeasure.UpdateRender()
	}
	_distanceMeasure.DisActive = function() {
		//不启动
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointermove', onMouseMove);
		_container.removeEventListener('pointerup', onMouseUp)
		bimengine.Measures.SimpleMeasure.DisActive();
	}

	let State = 0; //0代表空，1代表正在绘制

	//鼠标移动
	function onMouseMove(evt) {
		let rayCaster = new THREE.Raycaster();
		let mouse = new THREE.Vector2();
		mouse.x = ((evt.clientX - bimengine.scene.camera.viewport.x) / bimengine.scene.camera.viewport.z) * 2 - 1;
		mouse.y = -((evt.clientY - bimengine.scene.camera.viewport.y) / bimengine.scene.camera.viewport.w) * 2 + 1;
		//这里为什么是-号，没有就无法点中
		rayCaster.setFromCamera(mouse, camera);
		let intersects = rayCaster.intersectObjects(_distanceMeasure.models, true);
		// if (intersects.length < 1) {
		// 	bimengine.Measures.SimpleMeasure.currentMeasure = null;
		// 	bimengine.Measures.SimpleMeasure.cameraRefresh();
		// 	return;
		// }


		//第一次绘制:渲染一个点
		let point = intersects.length ? {
			x: evt.clientX - 4,
			y: evt.clientY - 4
		} : null;

		// bimengine.Measures.SimpleMeasure.MeasurePointPinkOnMouseMove(point);
		if (State == 0) {

		} else if (State == 1) {
			//第二次绘制:渲染一条线
			let normal = intersects[0].face.normal;
			let point = intersects[0].point;
			let results = rayDirectResult(point, normal);
			if (results != null) {
				var result = results[0];
				bimengine.Measures.SimpleMeasure.currentMeasure = {
					start: point,
					end: result.point,
					dis: point.distanceTo(result.point),
					id: "temp"
				};
				bimengine.Measures.SimpleMeasure.cameraRefresh();
			} else {
				// bimengine.Measures.SimpleMeasure.currentMeasure = null;
				// bimengine.Measures.SimpleMeasure.cameraRefresh();
			}
		}
	}
	//射线结果
	function rayDirectResult(start, normal) {
		var ray = new THREE.Raycaster(start.clone().add(normal.clone().multiplyScalar(0.01)), normal.clone());
		var intersects = ray.intersectObjects(_distanceMeasure.models);
		if (intersects.length > 0) {
			return intersects;
		} else {
			return null;
		}
	}
	//鼠标按下
	function onMouseDown(evt) {
		if (evt.button != 0) {
			return;
		}
		drag = false
		setTimeout(function() {
			drag = true
		}, 100)
	}
	//鼠标谈起
	function onMouseUp(evt) {
		if (evt.button != 0) {
			return;
		}
		if (drag == true) {
			return;
		}
		setTimeout(function() {
			if (State == 0) {
				//第一次绘制
				State = State + 1;
			} else if (State == 1) {
				//第二次绘制
				var val = JSON.parse(JSON.stringify(bimengine.Measures.SimpleMeasure.currentMeasure));
				if (val == null) {
					return;
				}
				val.id = guid();
				bimengine.Measures.SimpleMeasure.TotalMeasures.push(val);
				bimengine.Measures.SimpleMeasure.currentMeasure = {};
				bimengine.Measures.SimpleMeasure.cameraRefresh();
				State = 0;
			}
		}, 100);
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
