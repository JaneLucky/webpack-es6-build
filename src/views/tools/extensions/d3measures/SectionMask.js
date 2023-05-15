const THREE = require('@/three/three.js')
import {
	worldPointToScreenPoint
} from "@/views/tools/common/index.js"
export function SectionMask(_Engine) {
	var _sectionMask = new Object();
	_sectionMask.Controls = [];
	_sectionMask.MouseType = "none";
	_sectionMask.CurrentView = null;
	//激活
	_sectionMask.Active = function() {
		CreatorUI();
	}
	//禁用
	_sectionMask.DisActive = function() {
		_sectionMask.CurrentView = null;
		let models = _Engine.scene.children.filter(x => x.name == "ViewMask");
		for (let model of models) {
			let index = _Engine.scene.children.findIndex(x => x.Id == model.Id);
			if (index != -1) {
				_Engine.scene.children.splice(index, 1);
			}
		}
		_sectionMask.Controls[4].style.visibility = "hidden";
	}
	//还原标记
	_sectionMask.ReductionView = function(view) {
		_sectionMask.CurrentView = view;
	}
	//更新UI位置
	_sectionMask.RenderUpdate = function() {
		RenderControl();
	}
	/*************************************事件***************************************/
	//添加事件监听
	function addEventLicense() {
		var _container = _Engine.scene.renderer.domElement.parentElement;
		_container.addEventListener('pointerdown', onMouseDown);
		_container.addEventListener('pointerup', onMouseUp);
		_container.addEventListener('pointermove', onMouseMove);
	}
	//移除事件监听
	function removeEventLicense() {
		var _container = _Engine.scene.renderer.domElement.parentElement;
		_container.removeEventListener('pointerdown', onMouseDown);
		_container.removeEventListener('pointermove', onMouseMove);
	}
	//鼠标按下
	function onMouseDown(event) {
		if (event.button != 0) {
			return;
		}


	}
	//鼠标弹起
	function onMouseUp(event) {
		removeEventLicense();
		if (event.button != 0) {
			return;
		}


	}
	//鼠标移动
	function onMouseMove(event) {
		if (event.button != 0) {
			return;
		}
		if (_sectionMask.MouseType == "DragTop") {

		} else if (_sectionMask.MouseType == "DragLeft") {

		} else if (_sectionMask.MouseType == "DragBotton") {

		} else if (_sectionMask.MouseType == "DragRight") {

		}
	}

	//创建UI
	function CreatorUI() {
		var dom = document.createElement("div");
		dom.id = "MaskRoot";
		dom.className = "MaskRoot";

		var control_top = document.createElement("div");
		control_top.innerHTML = "◄►";
		control_top.className = "MaskControlTop";
		_sectionMask.Controls.push(control_top);
		dom.appendChild(control_top);

		var control_left = document.createElement("div");
		control_left.innerHTML = "◄►";
		control_top.className = "MaskControlLeft";
		_sectionMask.Controls.push(control_left);
		dom.appendChild(control_left);

		var control_botton = document.createElement("div");
		control_botton.innerHTML = "◄►";
		control_top.className = "MaskControlBotton";
		_sectionMask.Controls.push(control_botton);
		dom.appendChild(control_botton);

		var control_right = document.createElement("div");
		control_right.innerHTML = "◄►";
		control_top.className = "MaskControlRight";
		_sectionMask.Controls.push(control_right);
		dom.appendChild(control_right);

		_sectionMask.Controls.push(dom);
		//获取数据
		control_top.addEventListener("mousedown", function(res) {
			_sectionMask.MouseType = "DragTop";
			addEventLicense();
		})
		control_left.addEventListener("mousedown", function(res) {
			_sectionMask.MouseType = "DragLeft";
			addEventLicense();
		})
		control_botton.addEventListener("mousedown", function(res) {
			_sectionMask.MouseType = "DragBotton";
			addEventLicense();
		})
		control_right.addEventListener("mousedown", function(res) {
			_sectionMask.MouseType = "DragRight";
			addEventLicense();
		})
	}
	//渲染控制器
	function RenderControl() {
		if (_sectionMask.CurrentView == null) {
			return;
		}
		let view = _sectionMask.CurrentView;
		// 首先获取到  maskPoint = []
		let p1 = GetToVector3(view.maskPoint[0]);
		let p2 = GetToVector3(view.maskPoint[1]);
		let p3 = GetToVector3(view.maskPoint[2]);
		let p4 = GetToVector3(view.maskPoint[3]);

		let center1 = p1.clone().add(p2.clone()).multiplyScalar(0.5);
		let center2 = p2.clone().add(p3.clone()).multiplyScalar(0.5);
		let center3 = p3.clone().add(p4.clone()).multiplyScalar(0.5);
		let center4 = p4.clone().add(p1.clone()).multiplyScalar(0.5);

		if (_sectionMask.Controls.length == 4) {
			let screen_p1 = worldPointToScreenPoint(center1);
			let screen_p2 = worldPointToScreenPoint(center2);
			let screen_p3 = worldPointToScreenPoint(center3);
			let screen_p4 = worldPointToScreenPoint(center4);
			_sectionMask.Controls[0].style.Left = screen_p1.x + "px";
			_sectionMask.Controls[0].style.Top = screen_p1.y + "px";

			_sectionMask.Controls[1].style.Left = screen_p2.x + "px";
			_sectionMask.Controls[1].style.Top = screen_p2.y + "px";

			_sectionMask.Controls[2].style.Left = screen_p3.x + "px";
			_sectionMask.Controls[2].style.Top = screen_p3.y + "px";

			_sectionMask.Controls[3].style.Left = screen_p4.x + "px";
			_sectionMask.Controls[3].style.Top = screen_p4.y + "px";
		}
	}

	function CreatorViewMask_Front(view) {
		let point = view.Origin;
		/*
		      ⑤---------------------------------------⑥
		      |                                       |
		      |              ①----------②             |
		      |              |          |             |
		      |              |     o    |             |
	          |              |          |             |
		      |              ④----------③             |
		      |                                       |
		      ⑧---------------------------------------⑦
		*/
		//获取数据
		let dirx = new THREE.Vector3(1, 0, 0);
		let diry = new THREE.Vector3(0, 1, 0);
		//8个顶点
		let p1 = point.clone().add(dirx.clone().multiply(-view.Width)).add(diry.clone().multiply(view.Height));
		let p2 = point.clone().add(dirx.clone().multiply(view.Width)).add(diry.clone().multiply(view.Height));
		let p3 = point.clone().add(dirx.clone().multiply(view.Width)).add(diry.clone().multiply(-view.Height));
		let p4 = point.clone().add(dirx.clone().multiply(-view.Width)).add(diry.clone().multiply(-view.Height));

		let p5 = point.clone().add(dirx.clone().multiply(-10000000)).add(diry.clone().multiply(10000000));
		let p6 = point.clone().add(dirx.clone().multiply(10000000)).add(diry.clone().multiply(10000000));
		let p7 = point.clone().add(dirx.clone().multiply(10000000)).add(diry.clone().multiply(-10000000));
		let p8 = point.clone().add(dirx.clone().multiply(-10000000)).add(diry.clone().multiply(-10000000));
		var geometry = new THREE.BufferGeometry(); //声明一个空几何体对象
		geometry.vertices.push(p1, p2, p3, p4, p5, p6, p7, p8); //顶点坐标添加到geometry对象 
		geometry.faces.push(new THREE.Face3(0, 5, 4, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(0, 1, 5, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(1, 6, 5, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(1, 2, 6, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(2, 3, 6, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(3, 7, 6, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(0, 7, 3, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(0, 4, 7, normal)); //三角面添加到几何体
		var mesh = new THREE.Mesh(geometry, material); //网格模型对象
		mesh.name = "ViewMask";
		mesh.view = view;
		mesh.Id = guid();
		_Engine.scene.add(mesh);
		//绘制视图范围边线
		renderMaskSide([p1, p2, p2, p3, p3, p4, p4, p1]);
	}
	//创建视图后遮罩
	function CreatorViewMask_Back(view) {
		let point = view.Origin;
		//获取数据
		let dirx = new THREE.Vector3(1, 0, 0);
		let diry = new THREE.Vector3(0, 1, 0);
		//获取数据
		let p5 = point.clone().add(dirx.clone().multiply(-10000000)).add(diry.clone().multiply(10000000));
		let p6 = point.clone().add(dirx.clone().multiply(10000000)).add(diry.clone().multiply(10000000));
		let p7 = point.clone().add(dirx.clone().multiply(10000000)).add(diry.clone().multiply(-10000000));
		let p8 = point.clone().add(dirx.clone().multiply(-10000000)).add(diry.clone().multiply(-10000000));

		var geometry = new THREE.BufferGeometry(); //声明一个空几何体对象
		geometry.vertices.push(p5, p6, p7, p8); //顶点坐标添加到geometry对象 
		geometry.faces.push(new THREE.Face3(0, 1, 2, normal)); //三角面添加到几何体
		geometry.faces.push(new THREE.Face3(0, 2, 3, normal)); //三角面添加到几何体
		var mesh = new THREE.Mesh(geometry, material); //网格模型对象
		mesh.name = "ViewMask";
		mesh.view = view;
		mesh.Id = guid();
		_Engine.scene.add(mesh);
	}

	function guid() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	function GetToVector3() {
		return new THREE.Vector3(point.x, point.y, point.z);
	}
	return _sectionMask;
}
