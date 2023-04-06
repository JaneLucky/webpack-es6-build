import {
	GeometricOperation
} from "@/views/tools/Geo/GeometricOperation.js"
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js"
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
} from "../measures/MeasurePink"
export function SignMeasureLevel(bimEngine) {
  require('@/views/tools/style/'+SetDeviceStyle()+'/d3measure.scss')
	var _signMeasureLevel = new Object();
	_signMeasureLevel.MouseType = "none";
	_signMeasureLevel.Measures = [];
	_signMeasureLevel.Controls = [];
	//当前标注
	_signMeasureLevel.CurrentMeasure = null;
	_signMeasureLevel.HighLightMeasure = null;
	_signMeasureLevel.HighLightControl = null;
	let _D3Measure = bimEngine.D3Measure;
	let AnimationFrame = null;
	//
	function render() {
		AnimationFrame = requestAnimationFrame(render);
		CameraUpdate();
	}
	render() //开启动画
	//获取标记数据
	_signMeasureLevel.GetMeasureList = function() {

	}
	//还原标注数据
	_signMeasureLevel.ReductionMeasure = function(list) {

	}
	//启用
	_signMeasureLevel.Active = function() {
		// function render() {
		// 	AnimationFrame = requestAnimationFrame(render);
		// 	CameraUpdate();
		// }
		// render() //开启动画
	}

	//鼠标注册事件
	function addEventLicense() {
		var _container = bimEngine.scene.renderer.domElement.parentElement;
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointerup', onMouseUp);
		_container.addEventListener('pointermove', onMouseMove);
		_container.setAttribute('tabindex', 0)
		_container.focus()
		_container.onkeydown = onKeyDown
	}

	function removeEventLicense() {
		var _container = bimEngine.scene.renderer.domElement.parentElement;
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointerup', onMouseUp);
		_container.removeEventListener('pointermove', onMouseMove);
		//清除一些标记 
		clearDrawLineModel(bimEngine.scene);
		let root = document.getElementById("MeasurePoint");
		if (root != null) {
			root.remove();
		}
		bimEngine.StopClick = false;
	}
	//创建标注
	_signMeasureLevel.CreatorMeasure = function() {
		_signMeasureLevel.MouseType = "DrawPoint";
		_signMeasureLevel.CurrentMeasure = {
			Points: [],
			Id: guid(),
		};
		bimEngine.StopClick = true;
		addEventLicense();
	}
	/******************************************绑定事件*************************************************/
	_signMeasureLevel.drag = true;
	//鼠标按下
	function onMouseDown(event) {
		if (event.button != 0) {
			return;
		}
		_signMeasureLevel.drag = false
		setTimeout(function() {
			_signMeasureLevel.drag = true
		}, 1000)
	}
	//鼠标弹起
	function onMouseUp(event) {
		if (event.button != 0) {
			return;
		}
		//点击事件
		_signMeasureLevel.mouse = mousePosition(event);
		if (_signMeasureLevel.MouseType == "DrawPoint") {
			let point = GetRayWorldPointPlane(_signMeasureLevel.mouse);
			if (_signMeasureLevel.CurrentMeasure.Points.length == 0) {
				point = GetRayInterModelPoint(_signMeasureLevel.mouse);
				if (point == null) {
					return;
				}
				_signMeasureLevel.CurrentMeasure.Points.push(point);
				//设置工作平面
				let plane_ = GetCurrentWorkPlane(point);
				_signMeasureLevel.CurrentMeasure.workerPlane = plane_;
			} else if (_signMeasureLevel.CurrentMeasure.Points.length == 1) {
				_signMeasureLevel.CurrentMeasure.Points.push(point);
			} else if (_signMeasureLevel.CurrentMeasure.Points.length == 2) {
				_signMeasureLevel.CurrentMeasure.Points.push(point);
				//第三个点结束
				_signMeasureLevel.Measures.push(JSON.parse(JSON.stringify(_signMeasureLevel.CurrentMeasure)));
				let index = bimEngine.scene.children.findIndex(x => x.Id == "temp");
				if (index != -1) {
					bimEngine.scene.children[index].Id = _signMeasureLevel.CurrentMeasure.Id;
				}
				_signMeasureLevel.MouseType = "none";
				removeEventLicense();
				bimEngine.StopClick = false;
			}
		}
		if (_signMeasureLevel.MouseType == "none") {
			removeEventLicense();
		}
		if (_signMeasureLevel.MouseType == "DragMeasure") {
			_signMeasureLevel.MouseType = "none";
			_signMeasureLevel.HighLightControl.style.pointerevents = "all";
			_signMeasureLevel.HighLightControl = null;
			removeEventLicense();
		}

	}
	//鼠标移动
	function onMouseMove(event) {
		_signMeasureLevel.mouse = mousePosition(event);
		if (_signMeasureLevel.MouseType == "DrawPoint") {
			// Animate_MeasurePointPink(event); 
			let point = GetRayWorldPointPlane(_signMeasureLevel.mouse);
			if (point == null || point == "undefined" || point == undefined) {
				if (_signMeasureLevel.CurrentMeasure.Points.length == 0) {
					point = GetRayInterModelPoint(_signMeasureLevel.mouse);
					if (point == null) {
						return;
					}
					let plane_ = GetCurrentWorkPlane(point);
					_signMeasureLevel.CurrentMeasure.workerPlane = plane_;
				} else {
					return;
				}
			}
			_signMeasureLevel.CurrentMeasure.currentPoint = GetToVector3(point).clone();
			DrawSelectLineTemp(_signMeasureLevel.CurrentMeasure);
		}
		if (_signMeasureLevel.MouseType == "DragMeasure") {
			let point = GetRayWorldPointPlane(_signMeasureLevel.mouse);
			_signMeasureLevel.HighLightMeasure.currentPoint = point.clone();

			if (_signMeasureLevel.HighLightMeasure.Points.length == 3) {
				_signMeasureLevel.HighLightMeasure.Points = [
					new THREE.Vector3(_signMeasureLevel.HighLightMeasure.Points[0].x, _signMeasureLevel
						.HighLightMeasure
						.Points[0].y, _signMeasureLevel.HighLightMeasure.Points[0].z),
					new THREE.Vector3(_signMeasureLevel.HighLightMeasure.Points[1].x, _signMeasureLevel
						.HighLightMeasure
						.Points[1].y, _signMeasureLevel.HighLightMeasure.Points[1].z),
					_signMeasureLevel.HighLightMeasure.currentPoint
				]
			}
			_signMeasureLevel.HighLightMeasure.MeasureText = _signMeasureLevel.Controls.filter(x => x.Id ==
				_signMeasureLevel
				.HighLightMeasure.Id)[0];
			RenderMeasureLevelLine(_signMeasureLevel.HighLightMeasure, _signMeasureLevel.HighLightMeasure.Points);
		}
		if (_signMeasureLevel.MouseType == "none") {

		}
	}
	//键盘按下
	function onKeyDown(e) {

		if (e.keyCode == 27) {
			//ESC
			removeEventLicense();
		} else if (e.keyCode == 8 || e.keyCode == 46) {
			//退格，删除数据
			if (_signMeasureLevel.HighLightMeasure != null) {
				//模型索引
				let model_Index = bimEngine.scene.children.findIndex(x => x.Id == _signMeasureLevel.HighLightMeasure
					.Id);
				if (model_Index != -1) {
					bimEngine.scene.children.splice(model_Index, 1);
				}
				//UI索引
				let ui_Index = _signMeasureLevel.Controls.findIndex(x => x.Id == _signMeasureLevel.HighLightMeasure.Id);
				if (ui_Index != -1) {
					_signMeasureLevel.Controls[ui_Index].remove();
				}
				//核心
				let measure_Index = _signMeasureLevel.Measures.findIndex(x => x.Id == _signMeasureLevel.HighLightMeasure
					.Id);
				if (measure_Index != -1) {
					_signMeasureLevel.Measures.splice(measure_Index, 1);
				}
				removeEventLicense();
			}
		}
	}
	//绘制临时标注
	function DrawSelectLineTemp(measure) {
		let renderPoints = [];
		if (measure.Points.length == 0) {
			//第一个点
			renderPoints.push(measure.currentPoint);
			//第二个点
			renderPoints.push(measure.currentPoint);
			//第三个点重合
			renderPoints.push(measure.currentPoint);
			//绘制线条
			RenderMeasureLevelLine(measure, renderPoints);
		} else if (measure.Points.length == 1) {
			let renderPoints = [];
			//第一个点
			renderPoints.push(measure.Points[0]);
			//第二个点
			renderPoints.push(measure.currentPoint);
			//第三个点重合
			renderPoints.push(measure.currentPoint);
			//绘制线条
			RenderMeasureLevelLine(measure, renderPoints);
		} else if (measure.Points.length == 2) {
			let renderPoints = [];
			//第一个点
			renderPoints.push(measure.Points[0]);
			//第二个点
			renderPoints.push(measure.Points[1]);
			//第三个点
			renderPoints.push(measure.currentPoint);
			RenderMeasureLevelLine(measure, renderPoints);
		}
	}
	//渲染标高标注
	function RenderMeasureLevelLine(measure, points) {

		/* 
		              文字
		------------------------------- 
	      \    /
		   \  /
		    \/
		③------------------------------------------------②-------------------------------------------- ①
		*/
		//三个标准点 
		let basePoint = GetToVector3(points[0]);
		let dirPoint = GetToVector3(points[1]);
		let pointPoint = GetToVector3(points[2]);
		//获取屏幕的投影位置数据
		let project1 = get2DVec(dirPoint.clone());
		let project2 = get2DVec(pointPoint.clone());
		let catchPoint = new THREE.Vector2(project2.x, project1.y);
		//然后再投影回去 
		pointPoint = GetRayWorldPointPlane(mousePosition_(catchPoint));
		//
		let linePoints = [];
		let dir_x = pointPoint.clone().sub(dirPoint.clone()).normalize();
		let dir_y = dir_x.clone().cross(_signMeasureLevel.CurrentMeasure.workerPlane.normal.clone()).normalize();
		let p1 = get2DVec(dirPoint.clone().add(dir_y));
		if (p1.y < project1.y) {
			dir_y.multiplyScalar(-1);
		}

		let dir_xie_right = dir_x.clone().add(dir_y.clone());
		let dir_xie_left = dir_x.clone().multiplyScalar(-1).add(dir_y.clone());
		let l = 0.2;
		//引线
		linePoints.push(basePoint);
		linePoints.push(dirPoint);

		linePoints.push(dirPoint);
		linePoints.push(pointPoint.clone().add(dir_x.clone().multiplyScalar(l)));

		linePoints.push(pointPoint);
		linePoints.push(pointPoint.clone().sub(dir_xie_left.clone().multiplyScalar(l)));

		linePoints.push(pointPoint);
		linePoints.push(pointPoint.clone().sub(dir_xie_right.clone().multiplyScalar(l)));

		linePoints.push(pointPoint.clone().add(dir_x.clone().multiplyScalar(3 * l)).sub(dir_xie_left.clone()
			.multiplyScalar(l)));
		linePoints.push(pointPoint.clone().sub(dir_xie_right.clone().multiplyScalar(l)));

		//小三角

		measure.linePoints = linePoints;
		measure.interCenter = linePoints[5].clone().add(linePoints[7].clone()).multiplyScalar(0.5);

		/**********************************************开始渲染模型*************************************************/
		let index = bimEngine.scene.children.findIndex(x => x.Id == measure.Id);
		if (index != -1) {
			//更新模型线
			//已存在图形，更新形状
			let mesh = bimEngine.scene.children[index];
			for (let i = 0; i < linePoints.length; i++) {
				mesh.geometry.attributes.position.array[3 * i + 0] = linePoints[i].x;
				mesh.geometry.attributes.position.array[3 * i + 1] = linePoints[i].y;
				mesh.geometry.attributes.position.array[3 * i + 2] = linePoints[i].z;
			}
			mesh.geometry.attributes.position.needsUpdate = true;
			measure.MeasureText.innerHTML = Math.round(1000 * points[0].y) + "mm";
		} else {
			//新增模型线
			var geometry = new THREE.BufferGeometry(); //声明一个空几何体对象
			geometry.setFromPoints(linePoints);
			var material = new THREE.LineBasicMaterial({
				color: 0x000000, //三角面颜色
				wireframe: true,
				linewidth: 100,
				depthTest: false
			});
			var mesh = new THREE.LineSegments(geometry, material);
			mesh.name = "MeasureLevel";
			mesh.Id = measure.Id;
			bimEngine.scene.add(mesh);
			var dom = document.createElement("div");
			dom.className = "MeasureLevelText";
			dom.Id = measure.Id;
			dom.innerHTML = Math.round(1000 * points[0].y) + "mm";
			measure.MeasureText = dom;
			_signMeasureLevel.Controls.push(dom);
			var _container = bimEngine.scene.renderer.domElement.parentElement;
			_container.appendChild(dom);

			dom.addEventListener("click", function(res) {
				for (let m of _signMeasureLevel.Controls) {
					if (m.Id == res.target.Id) {
						m.style.color = "blue";
					} else {
						m.style.color = "black";
					}
				};
				let index = _signMeasureLevel.Measures.findIndex(x => x.Id == res.target.Id);
				if (index != -1) {
					_signMeasureLevel.HighLightMeasure = _signMeasureLevel.Measures[index];
				}
			});
			//鼠标点击下去
			dom.addEventListener("mousedown", function(res) {

				let index = _signMeasureLevel.Measures.findIndex(x => x.Id == res.target.Id);
				if (index != -1) {
					_signMeasureLevel.HighLightMeasure = _signMeasureLevel.Measures[index];
				}
				_signMeasureLevel.HighLightControl = res.target;
				_signMeasureLevel.HighLightControl.style.pointerevents = "none";
				_signMeasureLevel.MouseType = "DragMeasure";
				addEventLicense();
			})



		}

	}
	//相机更新
	function CameraUpdate() {
		if (bimEngine.scene == null) {
			return;
		}
		if(bimEngine.scene.camera.viewport == null){
			return;
		}
		let basex = bimEngine.scene.camera.viewport.x;
		let basey = bimEngine.scene.camera.viewport.y;
		let maxx = basex + bimEngine.scene.camera.viewport.z;
		let maxy = basey + bimEngine.scene.camera.viewport.w;
		//最后，删除 
		for (let measure of _signMeasureLevel.Measures) {
			let screenPoint = worldPointToScreenPoint(GetToVector3(measure.interCenter).clone(), bimEngine.scene
				.camera);
			let offy = screenPoint.y;
			let offx = screenPoint.x;

			// console.log(measure.interCenter)
			var domIndex = _signMeasureLevel.Controls.findIndex(x => x.Id == measure.Id);
			if (domIndex != -1) {
				if (offx > maxx || offy > maxy || offx < basex || offy < basey) {
					_signMeasureLevel.Controls[domIndex].style.visibility = "hidden";
				} else {
					_signMeasureLevel.Controls[domIndex].style.visibility = "visible";
				}
				_signMeasureLevel.Controls[domIndex].style.left = offx + "px";
				_signMeasureLevel.Controls[domIndex].style.top = offy + "px";
			}
		}

	}
	//清除所有标注
	function clearDrawLineModel() {


	}
	//获取当前工作平面
	function GetCurrentWorkPlane(point) {
		point = GetToVector3(point);
		let cameraDir = new THREE.Vector3();
		bimEngine.scene.camera.getWorldDirection(cameraDir);
		//然后是获取位置 
		let dis = GeometricOperation().PointProjectPointDirDis(cameraDir.clone().normalize(), new THREE.Vector3(),
			point);

		//计算方向
		let dot = (point.clone().sub(new THREE.Vector3)).dot(cameraDir.clone());
		let plane = new THREE.Plane(cameraDir.clone().multiplyScalar(-1).normalize().multiplyScalar(dot < 0 ? -1 :
				1)
			.clone().normalize(), dis);
		return plane;
	}

	function guid() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	//鼠标点击到模型的位置
	function GetRayInterModelPoint(mouse) {
		if (mouse == null) {
			return;
		}
		let rayCaster = new THREE.Raycaster();
		rayCaster.setFromCamera(mouse, bimEngine.scene.camera);
		let intersects = (rayCaster.intersectObjects(bimEngine.GetAllVisibilityModel(), true));
		if (intersects.length > 0) {
			return intersects[0].point;
		}
		return null;
	}
	//射线点击到平面的位置
	function GetRayWorldPointPlane(mouse) {
		//没有点的话，就返回空
		if (_signMeasureLevel.CurrentMeasure.Points.length == 0) {
			return null;
		}
		let plane = GetCurrentWorkPlane(_signMeasureLevel.CurrentMeasure.Points[0]);
		let rayCaster = new THREE.Raycaster();
		rayCaster.setFromCamera(mouse, bimEngine.scene.camera);
		var startPickPoint = rayCaster.ray.intersectPlane(plane);
		// console.log(plane)
		return startPickPoint;



		// let plane = GetCurrentWorkPlane(_signMeasureLevel.CurrentMeasure.Points[0]);
		let pX = mouse.x;
		let pY = mouse.y;
		let p = new THREE.Vector3(pX, pY, -1).unproject(bimEngine.scene.camera)
		let p_ = new THREE.Vector3(pX, pY, -1000000000).unproject(bimEngine.scene.camera);
		var point3D = p;
		var rayCast = new THREE.Raycaster();
		var rayDir = point3D.clone().sub(p_).setLength(1000000);
		rayCast.set(point3D.clone().sub(rayDir), rayDir);
		var startPickPoint = rayCast.ray.intersectPlane(plane);
		console.log(plane, rayDir.clone().normalize())
		return startPickPoint;
	}
	//捕捉平面
	function Animate_MeasurePointPink(mouseEvent) {
		let camera = bimEngine.scene.camera;
		_D3Measure.MeasurePink_Quadrangle.style.display = "none";
		_D3Measure.MeasurePink_Triangle.style.display = "none";
		_D3Measure.MeasurePink_Area.style.display = "none";
		clearDrawLineModel(bimEngine.scene)
		let PINK_DETAILS = {
			type: "area",
			val: null,
			isCenter: false
		}
		if (!(mouseEvent.target instanceof HTMLCanvasElement)) { //当鼠标不在场景上，直接返回
			return;
		}
		let rayCaster = new THREE.Raycaster();
		let mouse = new THREE.Vector2();
		mouse.x = ((mouseEvent.x - document.body.getBoundingClientRect().left) / document.body.offsetWidth) * 2 - 1;
		mouse.y = -((mouseEvent.y - document.body.getBoundingClientRect().top) / document.body.offsetHeight) * 2 +
			1;
		//这里为什么是-号，没有就无法点中
		rayCaster.setFromCamera(mouse, camera);
		let intersects = rayCaster.intersectObjects(_D3Measure.AllModels, true);
		if (intersects.length) {
			let intersect = intersects[0]
			if (intersect.object.TypeName == "Mesh" || intersect.object.TypeName == "Mesh-Structure" || intersect.object.TypeName == "PipeMesh") {
				var clickObj = IncludeElement(intersect.object.ElementInfos, intersect
					.point); //选中的构建位置信息
				if (clickObj != null && (intersect.object.hideElements == null || !intersect.object.hideElements
						.includes(clickObj.dbid))) {
					let EdgeList = intersect.object.ElementInfos[clickObj.dbid].EdgeList
					PINK_DETAILS = getPinkType(bimEngine.scene, intersect, EdgeList)
				}
			} else if (intersects[0].object.TypeName == "InstancedMesh" || intersects[0].object.TypeName == "InstancedMesh-Pipe") {
				let EdgeList = intersect.object.ElementInfos[intersect.instanceId].EdgeList
				PINK_DETAILS = getPinkType(bimEngine.scene, intersect, EdgeList)
			}
		}
		switch (PINK_DETAILS.type) {
			case "area":
				if (intersects.length) {
					//新增
					let areaPoints = PINK_DETAILS.val.map(item => {
						let p = worldPointToScreenPoint(new THREE.Vector3(item.x, item.y, item.z), camera)
						return p.x + ',' + p.y
					})
					_D3Measure.MeasurePink_Area.style.display = "block";
					_D3Measure.MeasurePink_Area.firstChild.setAttribute('points', areaPoints.join(' '))
				}
				break;
		}
	}
	//获取三维坐标
	function GetToVector3(point) {
		if (point == null) {
			return
		}
		return new THREE.Vector3(point.x, point.y, point.z);
	}
	//世界坐标转屏幕坐标 
	function get2DVec(vector3) {
		const stdVector = vector3.project(bimEngine.scene.camera);
		const a = bimEngine.scene.camera.viewport.z / 2;
		const b = bimEngine.scene.camera.viewport.w / 2;
		const x = Math.round(stdVector.x * a + a);
		const y = Math.round(-stdVector.y * b + b);
		return new THREE.Vector2(x, y);
	}

	function mousePosition(event) {
		var mouse = {};
		mouse.x = ((event.clientX - bimEngine.scene.camera.viewport.x) / bimEngine.scene.camera.viewport.z) * 2 - 1;
		mouse.y = -((event.clientY - bimEngine.scene.camera.viewport.y) / bimEngine.scene.camera.viewport.w) * 2 +
			1; //这里为什么是-号，没有就无法点中
		return mouse;
	}

	function mousePosition_(event) {
		var mouse = {};
		mouse.x = ((event.x - bimEngine.scene.camera.viewport.x) / bimEngine.scene.camera.viewport.z) * 2 - 1;
		mouse.y = -((event.y - bimEngine.scene.camera.viewport.y) / bimEngine.scene.camera.viewport.w) * 2 +
			1; //这里为什么是-号，没有就无法点中
		return mouse;
	}
	/*******************************************************************************************/
	return _signMeasureLevel;
}
