const THREE = require('@/three/three.js')
import TWEEN from "@tweenjs/tween.js";

import {
	InitScene,
	InitAxesHelper,
	InitLight,
	InitCamera,
	InitRenender,
	InitOthers
} from "../initialize/InitThreejsSence.js"
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js"
import "three/"
import {
	GetBoundingBox
} from "@/views/tools/common/index.js"
import { getScreenAspect } from "@/views/tools/common/screenReset.js"
// import {
// 	push
// } from "core-js/library/core/array";
export function ViewCube(scene, domid) {
  require('@/views/tools/style/'+SetDeviceStyle()+'/mainstyle.scss')
	var _ViewCube = new Object();
	_ViewCube.scene = scene;
	_ViewCube.init = function() {
		var dom = document.createElement("div");
		dom.id = "viewCube";
		dom.className = "ViewCube";
		document.getElementById(domid).appendChild(dom);
		var home = document.createElement("div");
		home.className = "homeViewWrapper";
		home.addEventListener("click", function() {
			console.log("回归");
			_ViewCube.cameraGoHome();
			window.bimEngine.loadedDoneFun()
		})
		dom.appendChild(home);

		var sceneOrtho = InitScene();
		var aspect = getScreenAspect();//窗口宽高比 
		var frustumSize = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
		_ViewCube.cameraOrtho = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2,
			2 * frustumSize / 2,
			1.4 * frustumSize / -2, 0, 10000);
		var width = document.getElementById(dom.id).clientWidth; //窗口宽度
		var height = document.getElementById(dom.id).clientHeight; //窗口高度
		var renderer = new THREE.WebGLRenderer({
			alpha: true
		}); //创建渲染器
		renderer.setSize(width, height); //设置渲染区域尺寸 
		renderer.setClearAlpha(0);
		_ViewCube.renderer = renderer;
		sceneOrtho.renderer = renderer;
		InitOthers(dom.id, renderer)
		//环境光的颜色以及强弱
		let ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
		sceneOrtho.add(ambientLight);
		_ViewCube.sceneOrtho = sceneOrtho;
		var materialArr = [];
		var loader = new THREE.TextureLoader();
		let cn_front = require("@/assets/cube/cn_front.png");
		let cn_back = require("@/assets/cube/cn_back.png");
		let cn_bottom = require("@/assets/cube/cn_bottom.png");
		let cn_left = require("@/assets/cube/cn_left.png");
		let cn_right = require("@/assets/cube/cn_right.png");
		let cn_top = require("@/assets/cube/cn_top.png");
		materialArr.push(new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: (new THREE.TextureLoader()).load(cn_right),

		}));
		materialArr.push(new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: (new THREE.TextureLoader()).load(cn_left),

		}));
		materialArr.push(new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: (new THREE.TextureLoader()).load(cn_top),

		}));
		materialArr.push(new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: (new THREE.TextureLoader()).load(cn_bottom),

		}));
		materialArr.push(new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: (new THREE.TextureLoader()).load(cn_front),

		}));
		materialArr.push(new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: (new THREE.TextureLoader()).load(cn_back),

		}));
		var viewBox = new THREE.Mesh(new THREE.BoxBufferGeometry(130, 130, 130, 1, 1, 1), materialArr);
		//添加各个方向的点击面
		_ViewCube.sceneOrtho.add(viewBox);
		AddClickPlane(146)
		//点击事件
		dom.addEventListener("click", evt => {

			var pointer = {};
			pointer.x = (evt.offsetX / dom.clientWidth) * 2 - 1;
			pointer.y = -(evt.offsetY / dom.clientHeight) * 2 + 1;
			var raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(pointer, _ViewCube.cameraOrtho);
			const intersects = raycaster.intersectObjects(_ViewCube.clickBoundary, false);
			if (intersects.length > 0) {
				_ViewCube.cameraGoToSpecialView(intersects[0].object.name)
			}
		})
		dom.addEventListener("mousemove", evt => {
			var pointer = {};
			pointer.x = (evt.offsetX / dom.clientWidth) * 2 - 1;
			pointer.y = -(evt.offsetY / dom.clientHeight) * 2 + 1;
			var raycaster = new THREE.Raycaster();
			raycaster.setFromCamera(pointer, _ViewCube.cameraOrtho);
			const intersects = raycaster.intersectObjects(_ViewCube.clickBoundary, false);
			//先将其他的材质归0；  
			for (var obj of _ViewCube.clickBoundary) {
				obj.material.opacity = 0.01;
			}
			if (intersects.length > 0) {
				intersects[0].object.material.opacity = 0.2;
			}
		})
	}
	//渲染场景
	_ViewCube.renderScene = function() {
		//先转动
		_ViewCube.cameraOrtho.quaternion.copy(_ViewCube.scene.camera.quaternion); //Quaternion（表示对象局部旋转的四元数)   
		let pLocal = new THREE.Vector3(0, 0, -1);
		let pWorld = pLocal.clone().applyMatrix4(_ViewCube.scene.camera.matrixWorld.clone());
		let direction = (_ViewCube.scene.camera.position.clone().sub(pWorld.clone())).setLength(1000);
		//坐标设置
		_ViewCube.cameraOrtho.position.copy(direction);
		//注视原点
		_ViewCube.cameraOrtho.lookAt(new THREE.Vector3());
		_ViewCube.renderer.render(_ViewCube.sceneOrtho, _ViewCube.cameraOrtho); //执行渲染操作

	}
	//获取模型包围盒
	_ViewCube.getBoundingBox = GetBoundingBox

	//顶视图
	_ViewCube.cameraGoToSpecialView = function(dir) {
		console.log(dir)
		//面
		var normal = new THREE.Vector3(0, 0, 0);
		if (dir == "top") {
			normal = new THREE.Vector3(0, 1, 0);
		} else if (dir == "down") {
			normal = new THREE.Vector3(0, -1, 0);
		} else if (dir == "front") {
			normal = new THREE.Vector3(0, 0, 1);
		} else if (dir == "left") {
			normal = new THREE.Vector3(-1, 0, 0);
		} else if (dir == "back") {
			normal = new THREE.Vector3(0, 0, -1);
		} else if (dir == "right") {
			normal = new THREE.Vector3(1, 0, 0);
		}
		//线
		else if (dir == "top_front") {
			normal = new THREE.Vector3(1, 1, 0);
		} else if (dir == "top_left") {
			normal = new THREE.Vector3(0, 1, -1);
		} else if (dir == "top_back") {
			normal = new THREE.Vector3(-1, 1, 0);
		} else if (dir == "top_right") {
			normal = new THREE.Vector3(0, 1, 1);
		} else if (dir == "down_front") {
			normal = new THREE.Vector3(1, -1, 0);
		} else if (dir == "down_left") {
			normal = new THREE.Vector3(0, -1, -1);
		} else if (dir == "down_back") {
			normal = new THREE.Vector3(-1, -1, 0);
		} else if (dir == "down_right") {
			normal = new THREE.Vector3(0, -1, 1);
		} else if (dir == "front_right") {
			normal = new THREE.Vector3(1, 0, 1);
		} else if (dir == "right_back") {
			normal = new THREE.Vector3(-1, 0, 1);
		} else if (dir == "back_left") {
			normal = new THREE.Vector3(-1, 0, -1);
		} else if (dir == "left_front") {
			normal = new THREE.Vector3(1, 0, -1);
		}
		//点
		else if (dir == "top_left_front") {
			normal = new THREE.Vector3(1, 1, -1);
		} else if (dir == "top_front_right") {
			normal = new THREE.Vector3(1, 1, 1);
		} else if (dir == "top_right_back") {
			normal = new THREE.Vector3(-1, 1, 1);
		} else if (dir == "top_back_left") {
			normal = new THREE.Vector3(-1, 1, -1);
		} else if (dir == "button_left_front") {
			normal = new THREE.Vector3(1, -1, -1);
		} else if (dir == "button_front_right") {
			normal = new THREE.Vector3(1, -1, 1);
		} else if (dir == "button_right_back") {
			normal = new THREE.Vector3(-1, 1, 1);
		} else if (dir == "button_back_left") {
			normal = new THREE.Vector3(-1, -1, -1);
		}
		var box = _ViewCube.getBoundingBox();
		var min = box.min;
		var max = box.max;
		var target = min.clone().add(max.clone()).multiplyScalar(0.5);
		var tergetCamera = target.clone().add(normal.multiplyScalar(1 * max.distanceTo(min)));

		_ViewCube.animateCamera(_ViewCube.scene.camera.position, tergetCamera, _ViewCube.scene.controls.target
			.clone(), target)
	}
	//获取相机姿态
	_ViewCube.GetCameraPose = function() {
		//获取当前相机参数
		var quaternion = _ViewCube.scene.camera.quaternion; //Quaternion（表示对象局部旋转的四元数)
		var position = _ViewCube.scene.camera.position; //获取相机位置
		var target = _ViewCube.scene.controls.target; //获取目标点 
		////相机基本满足 自身坐标 target 旋转值
		var cameraData = {
			quaternion: quaternion,
			position: position,
			target: target
		};
		return cameraData;
	}
	//还原相机姿态
	_ViewCube.ReductionCameraPose = function(cameraData) {
		//先转动
		var quaternion = new THREE.Quaternion(cameraData.quaternion._x, cameraData.quaternion._y, cameraData
			.quaternion._z, cameraData.quaternion._w);
		var position = new THREE.Vector3(cameraData.position.x, cameraData.position.y, cameraData.position.z);
		var target = new THREE.Vector3(cameraData.target.x, cameraData.target.y, cameraData.target.z);


		_ViewCube.animateCamera(_ViewCube.scene.camera.position, position, _ViewCube.scene.controls.target
			.clone(), target, _ViewCube.scene.camera.quaternion, quaternion)
	}
	//相机回归正位
	_ViewCube.cameraGoHome = function() {
		var box = _ViewCube.getBoundingBox();
		var min = box.min;
		var max = box.max;
		var target = min.clone().add(max.clone()).multiplyScalar(0.5);
		// target=target.clone().add(min.clone());
		let dir = new THREE.Vector3(1, 1, 1);
		var tergetCamera = target.clone().add(dir.multiplyScalar(1 * max.distanceTo(min)));
		_ViewCube.animateCamera(_ViewCube.scene.camera.position, tergetCamera, _ViewCube.scene.controls.target
			.clone(), target)
		//相机运动
	}
	//相机平滑跳转
	// current1 相机当前的位置
	// target1 相机的目标位置
	// current2 当前的controls的target
	// target2 新的controls的target
	// current3 相机当前quaternion
	// target3 相机的目标quaternion
	_ViewCube.animateCamera = function(current1, target1, current2, target2, current3, target3) {
		var tween
		if(current3 && target3){
			tween = new TWEEN.Tween({
				x1: current1.x, // 相机当前位置x
				y1: current1.y, // 相机当前位置y
				z1: current1.z, // 相机当前位置z
				x2: current2.x, // 控制当前的中心点x
				y2: current2.y, // 控制当前的中心点y
				z2: current2.z, // 控制当前的中心点z
				_x: current3._x, // 相机当前quaternion
				_y: current3._y, // 相机当前quaternion
				_z: current3._z, // 相机当前quaternion
				_w: current3._w // 相机当前quaternion
			});
			tween.to({
				x1: target1.x, // 新的相机位置x
				y1: target1.y, // 新的相机位置y
				z1: target1.z, // 新的相机位置z
				x2: target2.x, // 新的控制中心点位置x
				y2: target2.y, // 新的控制中心点位置x
				z2: target2.z, // 新的控制中心点位置x
				_x: target3._x, // 新的相机quaternion
				_y: target3._y, // 新的相机quaternion
				_z: target3._z, // 新的相机quaternion
				_w: target3._w // 新的相机quaternion
			}, 1000);

		}else{
			tween = new TWEEN.Tween({
				x1: current1.x, // 相机当前位置x
				y1: current1.y, // 相机当前位置y
				z1: current1.z, // 相机当前位置z
				x2: current2.x, // 控制当前的中心点x
				y2: current2.y, // 控制当前的中心点y
				z2: current2.z, // 控制当前的中心点z
			});
			tween.to({
				x1: target1.x, // 新的相机位置x
				y1: target1.y, // 新的相机位置y
				z1: target1.z, // 新的相机位置z
				x2: target2.x, // 新的控制中心点位置x
				y2: target2.y, // 新的控制中心点位置x
				z2: target2.z, // 新的控制中心点位置x
			}, 1000);
		}
		tween.onUpdate(function(res) {
			if(current3 && target3){
				_ViewCube.scene.camera.quaternion._x = res._x
				_ViewCube.scene.camera.quaternion._y = res._y
				_ViewCube.scene.camera.quaternion._z = res._z
				_ViewCube.scene.camera.quaternion._w = res._w
			}else{
				_ViewCube.scene.controls.auto = true;
			}
			_ViewCube.scene.camera.position.x = res.x1;
			_ViewCube.scene.camera.position.y = res.y1;
			_ViewCube.scene.camera.position.z = res.z1;
			_ViewCube.scene.controls.target.x = res.x2;
			_ViewCube.scene.controls.target.y = res.y2;
			_ViewCube.scene.controls.target.z = res.z2;
			_ViewCube.scene.controls.update();
			_ViewCube.renderScene();
		})
		tween.onComplete(function(res){
			_ViewCube.scene.controls.auto = false;
		})
		tween.easing(TWEEN.Easing.Cubic.InOut);

		function animate(time) {
			requestAnimationFrame(animate);
			tween.update();
		}
		tween.start();
		animate();
	}
	//添加各个方向的点击面
	function AddClickPlane(size) {
		var newsize = size * 0.5 - 20;
		//绘制6个面
		var faces = [{
				name: "right",
				a: 30,
				b: 80,
				c: 80,
				point: new THREE.Vector3(newsize, 0, 0)
			},
			{
				name: "back",
				a: 80,
				b: 80,
				c: 30,
				point: new THREE.Vector3(0, 0, -newsize)
			},
			{
				name: "left",
				a: 30,
				b: 80,
				c: 80,
				point: new THREE.Vector3(-newsize, 0, 0)
			},
			{
				name: "front",
				a: 80,
				b: 80,
				c: 30,
				point: new THREE.Vector3(0, 0, newsize)
			},
			{
				name: "top",
				a: 80,
				b: 30,
				c: 80,
				point: new THREE.Vector3(0, newsize, 0)
			},
			{
				name: "button",
				a: 80,
				b: 30,
				c: 80,
				point: new THREE.Vector3(0, -newsize, 0)
			}
		];
		//绘制8个点 
		var points = [{
				name: "top_right_back",
				a: 30,
				b: 30,
				c: 30,
				point: new THREE.Vector3(-newsize, newsize, newsize)
			},
			{
				name: "button_front_right",
				a: 30,
				b: 30,
				c: 30,
				point: new THREE.Vector3(-newsize, -newsize, newsize)
			},
			{
				name: "top_front_right",
				a: 30,
				b: 30,
				c: 30,
				point: new THREE.Vector3(newsize, newsize, newsize)
			},
			{
				name: "button_right_back",
				a: 30,
				b: 30,
				c: 30,
				point: new THREE.Vector3(newsize, -newsize, newsize)
			},
			{
				name: "top_back_left",
				a: 30,
				b: 30,
				c: 30,
				point: new THREE.Vector3(-newsize, newsize, -newsize)
			},
			{
				name: "button_back_left",
				a: 30,
				b: 30,
				c: 30,
				point: new THREE.Vector3(-newsize, -newsize, -newsize)
			},
			{
				name: "top_left_front",
				a: 30,
				b: 30,
				c: 30,
				point: new THREE.Vector3(newsize, newsize, -newsize)
			},
			{
				name: "button_left_front",
				a: 30,
				b: 30,
				c: 30,
				point: new THREE.Vector3(newsize, -newsize, -newsize)
			}
		]
		//绘制12条线
		var edges = [{
				name: "top_front",
				a: 30,
				b: 30,
				c: 80,
				point: new THREE.Vector3(newsize, newsize, 0)
			},
			{
				name: "top_right",
				a: 80,
				b: 30,
				c: 30,
				point: new THREE.Vector3(0, newsize, newsize)
			},
			{
				name: "top_back",
				a: 30,
				b: 30,
				c: 80,
				point: new THREE.Vector3(-newsize, newsize, 0)
			},
			{
				name: "top_left",
				a: 80,
				b: 30,
				c: 30,
				point: new THREE.Vector3(0, newsize, -newsize)
			},
			{
				name: "button_front",
				a: 30,
				b: 30,
				c: 80,
				point: new THREE.Vector3(newsize, -newsize, 0)
			},
			{
				name: "button_right",
				a: 80,
				b: 30,
				c: 30,
				point: new THREE.Vector3(0, -newsize, newsize)
			},
			{
				name: "button_back",
				a: 30,
				b: 30,
				c: 80,
				point: new THREE.Vector3(-newsize, -newsize, 0)
			},
			{
				name: "button_left",
				a: 80,
				b: 30,
				c: 30,
				point: new THREE.Vector3(0, -newsize, -newsize)
			},
			{
				name: "front_right",
				a: 30,
				b: 80,
				c: 30,
				point: new THREE.Vector3(newsize, 0, newsize)
			},
			{
				name: "right_back",
				a: 30,
				b: 80,
				c: 30,
				point: new THREE.Vector3(-newsize, 0, newsize)
			},
			{
				name: "back_left",
				a: 30,
				b: 80,
				c: 30,
				point: new THREE.Vector3(-newsize, 0, -newsize)
			},
			{
				name: "left_front",
				a: 30,
				b: 80,
				c: 30,
				point: new THREE.Vector3(newsize, 0, -newsize)
			}
		]
		_ViewCube.clickBoundary = [];
		for (var i = 0; i < faces.length; i++) {
			_ViewCube.clickBoundary.push(CreatorCube(faces[i]));
		}
		for (var i = 0; i < points.length; i++) {
			_ViewCube.clickBoundary.push(CreatorCube(points[i]));
		}
		for (var i = 0; i < edges.length; i++) {
			_ViewCube.clickBoundary.push(CreatorCube(edges[i]));
		}
	}

	function CreatorCube(item) {
		const geometry = new THREE.BoxGeometry(item.a, item.b, item.c);
		const material = new THREE.MeshBasicMaterial({
			color: "yellow",
			transparent: true,
			opacity: 0.01
		});
		let mesh = new THREE.Mesh(geometry, material);
		mesh.name = item.name;
		mesh.position.set(item.point.x, item.point.y, item.point.z);

		_ViewCube.sceneOrtho.add(mesh);
		return mesh;
	}
	return _ViewCube;
}
