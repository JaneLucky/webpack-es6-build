const THREE = require('@/three/three.js')

import {
	InitScene,
	InitAxesHelper,
	InitLight,
	InitCamera,
	InitPerCamera,
	InitRenender,
	InitOthers,
	InitBackgroundScene
} from "./initialize/InitThreejsSence.js" //threejs场景加载
import {
	setEventsMouse,
	setControl,
	setTransformControls,
	SceneResize
} from "./initialize/InitEvents.js" //监听函数
import {
	LoadGLB,
	LoadGlbJsonList,
	LoadModelBeforeStart,
	CreateHighLightGroup
} from "./loaders/Loader.js" //模型加载
import {
	CreatorPipe
} from "./modelCreator/MEPModel.js" //模型管道、桥梁等
import {
	CreatorStructureModel
} from "./modelCreator/StructureModel.js"
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
	elevationHeightMeasure
} from "./extensions/measures/elevationHeightMeasure.js"
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

import {
	PointRoam
} from "./others/PointRoam.js"

import {
	CreateTopMenu
} from "./topMenu/index"
import {
	HandleModelSelect,
	HandleRequestModelSelect
} from "@/views/tools/handleModels/index.js"
import {
	HandleHighlightModelSelect_,
	HandleRequestModelSelect_
} from "./handleModels/index"

import {
	CaptureMark
} from "./extensions/measures/captureMark.js"
import {
	getDeviceType
} from "@/utils/device"
import {
	MultithLoadGlbJsonList
} from "./loaders/MultithLoader.js" //模型加载
import {
	GetZipFile
} from "@/utils/files.js" //模型加载
import {
	SenceZoom
} from "@/views/tools/handleModels/senceZoom.js"
import {
	ModelOctreeVisible,
	ModelOctree,
	ModelOctrees
} from "@/views/tools/common/modelOctree.js"
import {
	ModelTree
} from "@/views/tools/common/modelTree.js"
import {
	CreatorInstancePipe
} from "./modelCreator/PipeInstanceModel.js" //模型管道、桥梁等

import {
	GetModelEdges
} from "./common/modelEdge.js"

import {
	EngineRay
} from "./common/ray.js"

// BIM引擎封装
export function BIMEngine(domid, options, GLTFLoader) {
	var _bimEngine = new Object();
	_bimEngine.RenderSAO = new RenderSAO(_bimEngine);
	_bimEngine.DisPlayModel = new disPlayModel(_bimEngine);
	_bimEngine.ModelSelection = new ModelSelection(_bimEngine);
	_bimEngine.MinMap = new MinMap(_bimEngine);
	_bimEngine.D3Measure = new D3Measure(_bimEngine);
	_bimEngine.PointRoam = new PointRoam(); //定点漫游
	_bimEngine.scene = null;
	_bimEngine.GLTFLoader = GLTFLoader;
	_bimEngine.StopClick = false //是否禁用单击
	_bimEngine.RightClickActive = true //是否显示鼠标右键列表
	_bimEngine.ModelPaths = [] //所有模型加载的路径
	_bimEngine.doneModels = [];
	_bimEngine.move = true;
	_bimEngine.SelectedModels = {
		indexesModels: [], // 模型索引
		loadedModels: [], //通过加载方式获得模型构建
		requiredModels: [], //通过接口查询返回的模型构建
	}
	_bimEngine.LoadedStatus = { //所有模型加载情况
		glbModelsLoadedNum: 0, //glb模型是否加载完成
		pipeModelsLoadedNum: 0, //管道模型是否加载完成
		structureModelsLoadedNum: 0 //语义化模型是否加载完成
	}
	_bimEngine.handleLoadDoneFunOnce = false //模型加载完成需要执行的函数-只能执行一次，是否已经执行
	_bimEngine.FPS = 1; // 设置渲染频率为1FBS，也就是每秒调用渲染器render方法大约1次
	_bimEngine.DeviceType = getDeviceType() //显示的设备类型
	_bimEngine.SetBuild = false //是否用于打包
	window.THREE = THREE;
	sessionStorage.removeItem('SelectedSingleModelInfo') //刷新清空当前选中构建
	sessionStorage.setItem("ShowAllModel",'true')
	//初始化
	_bimEngine.init = function() {
		// 适配PC端和移动端样式
		let rootDom = document.getElementById(domid)
		if(_bimEngine.DeviceType === "PC"){
			rootDom.parentElement.className = rootDom.parentElement.className + " PCView-page-container"
		}else if((_bimEngine.DeviceType === "Mobile")){
			rootDom.parentElement.className = rootDom.parentElement.className + " MobileView-page-container"
		}

		_bimEngine.scene = InitScene();
		window.bimEngine = _bimEngine;
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
		// 加载背景图-用于反射
		InitBackgroundScene(scene)
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

		_bimEngine.Render = new Render(_bimEngine); //渲染对象
		_bimEngine.MultiView = new Multiview(_bimEngine, camera); //多视图对象
		SceneResize() // 场景尺寸变化
		//适配移动端
		if(_bimEngine.SetBuild){
			_bimEngine.TopMenu = new CreateTopMenu(_bimEngine)
		}else{
			_bimEngine.TopMenu = _bimEngine.DeviceType === "PC" ? new CreateTopMenu(_bimEngine) : null; //顶部menu列表
		}
		// _bimEngine.TopMenu = new CreateTopMenu(_bimEngine)

		//监听相机
		var myEvent = new CustomEvent('bimengine:camerachange', {
			detail: ""
		});
		controls.addEventListener('change', function() {
			_bimEngine.move = true;
			window.dispatchEvent(myEvent);
		});
		_bimEngine.UpdateRender = function() {
			_bimEngine.move = true
		}

		// 创建一个时钟对象Clock
		var clock = new THREE.Clock();
		var timeS = 0;

		function render() {
			requestAnimationFrame(render);
			stats.update();

			var T = clock.getDelta();
			timeS = timeS + T;
			//加载完成之前降低render刷新，加载完成之后恢复正常
			if (timeS > (1 / _bimEngine.FPS) && _bimEngine.move == true) {
				renderCommand();
				timeS = 0;
				setTimeout(function() {
					renderer.render(scene, scene.camera); //执行渲染操作  
				}, 200);
			} else {

			}
			_bimEngine.RenderSAO.render();
		}
		render();

		function renderCommand() {
			renderer.setViewport(0, 0, window.bimEngine.scene.renderer.domElement.parentElement.innerWidth, window.bimEngine.scene.renderer.domElement.parentElement.innerHeight); //主场景视区 

			// renderer.render(scene, scene.camera); //执行渲染操作 
			_bimEngine.MultiView.updaterender();
			// controls.update(); //更新控制器  
			//光源跟随相机移动
			// var vector = camera.position.clone()
			// point.position.set(vector.x, vector.y, vector.z); //点光源位置

			//cube场景 
			_bimEngine.ViewCube.renderScene();
			//阴影

			//小地图
			_bimEngine.MinMap.renderUpdata(); //优化放在漫游中的render中
			_bimEngine.move = false;
			ControlSpeed();
		}
		//计算鼠标的最佳交互速度
		function ControlSpeed() {
			//首先获取到点击的模型
			if (_bimEngine.CurrentSelect != null) {
				let model = _bimEngine.scene.children[_bimEngine.CurrentSelect.indexs[0]];
				if (model != null && model.ElementInfos != null) {
					let center = model.ElementInfos[_bimEngine.CurrentSelect.indexs[1]];
					if (center != null) {
						let dis = center.center.clone().distanceTo(_bimEngine.scene.camera.position);
						_bimEngine.controls.zoomSpeed = dis * 0.10;
						_bimEngine.controls.panSpeed = dis * 0.03;
						if (_bimEngine.controls.zoomSpeed < 0.1) {
							_bimEngine.controls.zoomSpeed = 0.1;
						}
						if (_bimEngine.controls.zoomSpeed > 5) {
							_bimEngine.controls.zoomSpeed = 5;
						}
						if (_bimEngine.controls.panSpeed > 1) {
							_bimEngine.controls.panSpeed = 1;
						}
					}
				}
			} else {
				_bimEngine.controls.zoomSpeed = 1;
				_bimEngine.controls.panSpeed = 1;
			}
		}


		//创建捕捉对象
		_bimEngine.CaptureMark = new CaptureMark(_bimEngine);

		//测量模块
		_bimEngine.Measures = {};
		_bimEngine.Measures.SimpleMeasure = new simpleMeasure(_bimEngine);
		_bimEngine.Measures.DistanceMeasure = new distanceMeasure(_bimEngine);
		_bimEngine.Measures.PointMeasure = new pointMeasure(_bimEngine);
		_bimEngine.Measures.HeightMeasure = new heightMeasure(_bimEngine);
		_bimEngine.Measures.ElevationHeightMeasure = new elevationHeightMeasure(_bimEngine);
		_bimEngine.Clipping = new Clipping(scene) //剖切对象
		_bimEngine.SelectionBox = new selectBox(_bimEngine); //框选对象
		_bimEngine.FirstPersonControls = new firstPersonControls(_bimEngine) //漫游
		// _bimEngine.SenceZoom = new SenceZoom(scene); //场景放缩移动-模型显隐
		// _bimEngine.SenceZoom.Active()
		//加载TransformControls控制器-用于模型剖切
		setTransformControls(scene, camera, renderer);
		ModelOctreeVisible(_bimEngine); //监听相机移动
		CreateHighLightGroup(scene);

		//加载点击事件
		if (_bimEngine.RightClickActive) {
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
	_bimEngine.RenderUpdata = function() {
		// _bimEngine.scene.renderer.render(_bimEngine.scene, _bimEngine.scene.camera); //执行渲染操作 
		_bimEngine.MultiView.updaterender();
	}
	//加载模型
	//url:模型加载路径
	//type:模型加载类型
	//option:模型加载的一些预设
	_bimEngine.start = function(rootPath, relativePath, type, option, callback) {
		let url = rootPath + "/" + relativePath
		let scene = _bimEngine.scene;
		if (type == "glb") {
			let GroupBox = new THREE.Group();
			GroupBox.data_glb = url;
			scene.add(GroupBox)
			LoadGLB(GroupBox, url, option.position, gltf => {
				callback();
			})
		} else if (type == "glbjson") {
			_bimEngine.ModelPaths.push(relativePath);
			_bimEngine.D3Measure.UpdateViewList(url) //更新视图数据
			LoadModelBeforeStart(url).then(res => { //加载材质映射列表及材质列表
				LoadGlbJsonList(scene, relativePath, url, option); //加载glb模型
				// MultithLoadGlbJsonList(scene, 'http://119.91.39.51:9000', relativePath, type)
			})
			//大 382395030305768710%2F396146577690854661%2F396146578055759109%2Fglbs
			//小 382395030305768710%2F393669613621085445%2F393669613650445573%2Fglbs
			// CreatorPipe(scene, url) // 加载管道模型mergeBufferGeometries合并
			CreatorStructureModel(scene, relativePath, url); //语义化模型
			CreatorInstancePipe(scene, relativePath, url) // 加载管道模型InstanceMesh合并
		}
	}
	//模型加载完成状态监测
	_bimEngine.loadedDone = function(type) {
		_bimEngine.LoadedStatus[type]++;
		let txt
		switch (type) {
			case 'glbModelsLoadedNum':
				txt = 'glb'
				break;
			case 'pipeModelsLoadedNum':
				txt = '管道'
				break;
			case 'structureModelsLoadedNum':
				txt = '语义化'
				break;
		}
		console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), txt + '模型加载完成套数：', _bimEngine
			.LoadedStatus[type])
		// if (_bimEngine.LoadedStatus.glbModelsLoadedNum === _bimEngine.ModelPaths.length) {
		// if (_bimEngine.LoadedStatus.pipeModelsLoadedNum === _bimEngine.ModelPaths.length) {
		// if (_bimEngine.LoadedStatus.structureModelsLoadedNum === _bimEngine.ModelPaths.length) {
		if (_bimEngine.LoadedStatus.glbModelsLoadedNum === _bimEngine.LoadedStatus.pipeModelsLoadedNum &&
			_bimEngine.LoadedStatus.glbModelsLoadedNum === _bimEngine.LoadedStatus.structureModelsLoadedNum &&
			_bimEngine.LoadedStatus.glbModelsLoadedNum === _bimEngine.ModelPaths.length) {
			console.log('所有模型加载完成------------')
			_bimEngine.loadedDoneFun()
		}
	}

	_bimEngine.loadedDoneFun = function() {
		if (!_bimEngine.handleLoadDoneFunOnce) {
			_bimEngine.handleLoadDoneFunOnce = true
			_bimEngine.FPS = 60
			_bimEngine.EngineRay = new EngineRay();
			_bimEngine.LoadModelTree();
			_bimEngine.ModelOctree()
			GetModelEdges()

		}
	}
	_bimEngine.ModelOctree = function() {
		ModelOctrees(_bimEngine)
	}
	_bimEngine.LoadModelTree = function() {
		ModelTree(_bimEngine)
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
		for (let i = 0; i < window.bimEngine.scene.children.length; i++) {
			window.bimEngine.scene.children[i].index = i
		}
		var rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
		return rootmodels;
	}

	_bimEngine.GetAllIndexesModel = function() {
		let indexesList = []

		if (_bimEngine.treeMapper) {
			_bimEngine.treeMapper.map(item => {
				if (item.ModelIds && item.ModelIds.length) {
					Array.prototype.splice.apply(indexesList, [indexesList.length, item.ModelIds.length]
						.concat(item.ModelIds))
				}
			})
		}
		return indexesList
	}


	//重置选中模型构建
	/**
	 * 
	 * @param {*} key 操作类型：visible表示操作显隐，highlight表示操作亮显
	 * @param {*} list 需要操作的模型列表
	 * @param {*} val 是否显隐或者高亮
	 */
	_bimEngine.ResetSelectedModels_ = function(key, list, val) {
		switch (key) {
			case 'visible':
				HandleRequestModelSelect_(list, val)
				break;
			case 'highlight':
				_bimEngine.SelectedModels.indexesModels = list
				HandleHighlightModelSelect_(list, val)
				break;
		}
		console.log(_bimEngine.SelectedModels)
	}

	//重置选中模型构建
	_bimEngine.ResetSelectedModels = function(key, list) {
		//恢复接口查询返回的模型构建-选中样式
		_bimEngine.SelectedModels.requiredModels.length && HandleRequestModelSelect(_bimEngine
			.SelectedModels
			.requiredModels, [{
				key: 'material'
			}])
		_bimEngine.SelectedModels.requiredModels = []
		//恢复加载方式获得模型构建-选中样式
		_bimEngine.SelectedModels.loadedModels.length && HandleModelSelect(_bimEngine.SelectedModels
			.loadedModels,
			[{
				key: 'material'
			}])
		_bimEngine.SelectedModels.loadedModels = []
		switch (key) {
			case "loaded":
				//设置加载方式获得模型构建-选中样式
				if (list.length) {
					let material = new THREE.MeshStandardMaterial({
						color: new THREE.Color(0.375, 0.63, 1),
						side: THREE.DoubleSide
					});
					HandleModelSelect(list, [{
						key: 'material',
						val: material
					}])
				}
				_bimEngine.SelectedModels.loadedModels = list
				break;
			case "required":
				//设置接口查询返回的模型构建-选中样式
				if (list.length) {
					let material = new THREE.MeshStandardMaterial({
						color: new THREE.Color(0.375, 0.63, 1),
						side: THREE.DoubleSide,
					})
					HandleRequestModelSelect(list, [{
						key: 'material',
						val: material
					}])
				}
				_bimEngine.SelectedModels.requiredModels = list
				break;
		}
		console.log(_bimEngine.SelectedModels)
	}
	return _bimEngine;
}
