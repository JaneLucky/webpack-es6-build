const THREE = require('three')

import {
	InitScene,
	InitAxesHelper,
	InitLight,
	InitCamera,
	InitPerCamera,
	InitRenender,
	InitOthers
} from "./initialize/InitThreejsSence.js" //threejs场景加载
import {
	setEventsMouse,
	setControl,
	setTransformControls
} from "./initialize/InitEvents.js" //监听函数
import {
	LoadGLB,
	LoadGlbJsonList
} from "./loaders/Loader.js" //模型加载
import {
	CreatorPipe
} from "./modelCreator/MEPModel.js" //模型管道、桥梁等
import {
	selectBox
} from "./others/SelectionBox.js" //框选
import {
	ListenEvent
} from "./event/index.js"
//渲染相关
import {
	Render
} from "./render/render.js";
import {
	RenderSAO
} from "./render/render_sao.js"
import {
	ViewCube
} from "./core/viewcube.js"
import {
	disPlayModel
} from "./core/disPlayModel.js"
import Stats from './libs/stats.module.js'


import {
	simpleMeasure
} from "./extensions/measures/simpleMeasure.js"
import {
	distanceMeasure
} from "./extensions/measures/distanceMeasure.js"
import {
	pointMeasure
} from "./extensions/measures/pointMeasure.js"
import {
	heightMeasure
} from "./extensions/measures/heightMeasure.js"
import {
	ModelSelection
} from "./core/ModelSelection.js"

import {
	Multiview
} from "./initialize/InitMultiview.js"

import {
	MinMap
} from "./core/minMap.js"

import { 
	D3Measure
} from "@/views/tools/extensions/d3measures/index.js"

import {
	Clipping
} from "./others/Clipping"

import {
	firstPersonControls
} from "./controls/FirstPersonControls.js"

import { PointRoam } from "./others/PointRoam.js"

// BIM引擎封装
export function BIMEngine(domid, options, GLTFLoader) {
	var _bimEngine = new Object();
	_bimEngine.Render = new Render(_bimEngine);
	_bimEngine.RenderSAO = new RenderSAO(_bimEngine);
	_bimEngine.DisPlayModel = new disPlayModel(_bimEngine);
	_bimEngine.ModelSelection = new ModelSelection(_bimEngine);
	_bimEngine.MinMap = new MinMap(_bimEngine);
	_bimEngine.D3Measure = new D3Measure(_bimEngine);
	_bimEngine.PointRoam = new PointRoam();//定点漫游
	_bimEngine.scene = null;
	_bimEngine.GLTFLoader = GLTFLoader;
	_bimEngine.Measure = {
		PointMeasure: [],
		SimpleLineMeasure: []
	}
	_bimEngine.StopClick = false //是否禁用单击
	_bimEngine.RightClickActive = true //是否显示鼠标右键列表
	window.THREE = THREE;
	//初始化
	_bimEngine.init = function() {
		_bimEngine.scene = InitScene();
		// 创建辅助坐标轴
		InitAxesHelper(_bimEngine.scene)
		let scene = _bimEngine.scene;
		var camera = InitPerCamera(scene);
		camera.name = "默认三维视图";
		scene.camera = camera;
		let renderer = InitRenender(domid)
		_bimEngine.scene.renderer = renderer;
		// renderer.setClearColor(new THREE.Color(0.9, 0.9, 0.9))
		InitOthers(domid, renderer)
		let point = InitLight(scene)
		//鼠标操作3D模型
		var controls = setControl(domid, camera, renderer)
		scene.controls = controls;
		_bimEngine.controls = controls;
		//性能监控器
		let stats = new Stats();
		stats.domElement.style.position = 'absolute'; //绝对坐标  
		stats.domElement.style.left = '0px'; // (0,0)px,左上角  
		stats.domElement.style.top = '0px';
		document.getElementById(domid).appendChild(stats.domElement);

		_bimEngine.ViewCube = new ViewCube(scene, domid); //相机视图对象
		_bimEngine.ViewCube.init();
		_bimEngine.MultiView = new Multiview(_bimEngine, camera); //多视图对象

		//监听相机
		var myEvent = new CustomEvent('bimengine:camerachange', {
			detail: ""
		});
		controls.addEventListener('change', function() {
			setTimeout(function() {
				window.dispatchEvent(myEvent);
			}, 50);
			window.dispatchEvent(myEvent);
		});

		function render() {
			requestAnimationFrame(render);
			// renderer.setViewport(0, 0, window.innerWidth, window.innerHeight); //主场景视区 
			// renderer.render(scene, scene.camera); //执行渲染操作 
			_bimEngine.MultiView.updaterender();
			// controls.update(); //更新控制器
			stats.update();

			//光源跟随相机移动
			var vector = camera.position.clone()
			point.position.set(vector.x, vector.y, vector.z); //点光源位置

			//cube场景 
			_bimEngine.ViewCube.renderScene();
			//阴影
			_bimEngine.RenderSAO.render();
			//小地图
			_bimEngine.MinMap.renderUpdata();
		}
		render();
		//测量模块
		_bimEngine.Measures = {};
		_bimEngine.Measures.SimpleMeasure = new simpleMeasure(_bimEngine);
		_bimEngine.Measures.DistanceMeasure = new distanceMeasure(_bimEngine);
		_bimEngine.Measures.PointMeasure = new pointMeasure(_bimEngine);
		_bimEngine.Measures.HeightMeasure = new heightMeasure(_bimEngine);
		_bimEngine.Clipping = new Clipping(scene) //剖切对象
		_bimEngine.SelectionBox = new selectBox(_bimEngine); //框选对象
		_bimEngine.FirstPersonControls = new firstPersonControls(_bimEngine) //漫游
		//加载TransformControls控制器-用于模型剖切
		setTransformControls(scene, camera, renderer);
		//加载点击事件
		if(_bimEngine.RightClickActive){
			setEventsMouse(_bimEngine, (res) => {
				if (res != null) { //鼠标单击事件（左键和右键）
					var myEvent = new CustomEvent('bimengine:click', {
						detail: res
					});
					window.dispatchEvent(myEvent);
				}
			})
		}
	}
	//加载模型
	//url:模型加载路径
	//type:模型加载类型
	//option:模型加载的一些预设
	_bimEngine.start = function(url, type, option, callback) {
		let scene = _bimEngine.scene;
		window.bimEngine = _bimEngine;
		if (type == "glb") {
			let GroupBox = new THREE.Group();
			GroupBox.data_glb = url;
			scene.add(GroupBox)
			LoadGLB(GroupBox, url, option.position, gltf => {
				callback();
			})
		} else if (type == "glbjson") {
			_bimEngine.D3Measure.UpdateViewList(url)//更新视图数据
			LoadGlbJsonList(scene, url, option); //加载模型
		}

		CreatorPipe(scene, url)

	}

	//注册事件
	//事件枚举，回调
	_bimEngine.addEventListener = function(callback) {
		
	}
	_bimEngine.ListenerEvent = function(event, callback) {
		window.addEventListener(event, ({
			detail
		}) => {
			callback(detail)
		})
	}
	//锁定相机选择
	_bimEngine.LockingSelect = function() {
		_bimEngine.LockingSelect = true;
	}
	_bimEngine.UnLockingSelect = function() {
		_bimEngine.LockingSelect = false;
	}

	//载入外部插件
	_bimEngine.loadExtension = function() {

	}
	//运行外部插件
	_bimEngine.getExtension = function() {

	}

	//获取当前所有的模型
	_bimEngine.GetAllVisibilityModel = function() {
		var rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
		return rootmodels;
	}
	return _bimEngine;
}
