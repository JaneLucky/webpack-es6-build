const THREE = require("@/three/three.js");
require("./style/index.scss");
import { LoadZipJson, LoadJSON } from "@/utils/LoadJSON.js";
import {
  InitScene,
  InitAxesHelper,
  InitLight,
  InitCamera,
  InitPerCamera,
  InitRenender,
  InitOthers,
  InitBackgroundScene
} from "./initialize/InitThreejsSence.js"; //threejs场景加载
import { setEventsMouse, setControl, setTransformControls } from "./initialize/InitEvents.js"; //监听函数
import { SceneResize } from "@/views/tools/common/screenResize.js";
import { LoadGLB, LoadGlbJsonList, CreateHighLightGroup } from "./loaders/Loader.js"; //模型加载
import { CreatorPipe } from "./modelCreator/MEPModel.js"; //模型管道、桥梁等
import { CreatorStructureModel } from "./modelCreator/StructureModel.js";
import { selectBox } from "./others/SelectionBox.js"; //框选
import { ListenEvent } from "./event/index.js";
//渲染相关
import { Render } from "./render/render.js";
import { RenderSAO } from "./render/render_sao.js";
import { RenderPost } from "./render/render_post.js";
import { ViewCube } from "./core/viewcube.js";
import { disPlayModel } from "./core/disPlayModel.js";
import Stats from "./libs/stats.module.js";

import { simpleMeasure } from "./extensions/measures/simpleMeasure.js";
import { distanceMeasure } from "./extensions/measures/distanceMeasure.js";
import { pointMeasure } from "./extensions/measures/pointMeasure.js";
import { heightMeasure } from "./extensions/measures/heightMeasure.js";
import { elevationHeightMeasure } from "./extensions/measures/elevationHeightMeasure.js";
import { ModelSelection } from "./core/ModelSelection.js";

import { Multiview } from "./initialize/InitMultiview.js";

import { MinMap } from "./core/minMap.js";

import { D3Measure } from "@/views/tools/extensions/d3measures/index.js";

import { Clipping } from "./others/Clipping";

import { firstPersonControls } from "./controls/FirstPersonControls.js";

import { PointRoam } from "./others/PointRoam.js";

import { CreateTopMenu } from "./topMenu/index";
import { HandleModelSelect, HandleRequestModelSelect } from "@/views/tools/handleModels/index.js";
import { HandleHighlightModelSelect_, HandleRequestModelSelect_ } from "./handleModels/index";

import { CaptureMark } from "./extensions/measures/captureMark.js";
import { getDeviceOS } from "@/utils/device";
import { GetZipFile } from "@/utils/files.js"; //模型加载
import { SenceZoom } from "@/views/tools/handleModels/senceZoom.js";
import { ModelOctreeVisible, ModelOctree, ModelOctrees } from "@/views/tools/common/modelOctree.js";
import { ModelTree } from "@/views/tools/common/modelTree.js";
import { ResetModelMaterial } from "@/views/tools/common/modelMaterial.js";
import { CreatorInstancePipe } from "./modelCreator/PipeInstanceModel.js"; //模型管道、桥梁等
import { CreatorRebarModel } from "./modelCreator/RebarModel.js"; //钢筋模型

import { GetModelEdges } from "./common/modelEdge.js";

import { EngineRay } from "./common/ray.js";

import { ControlButtons } from "./core/ControlButtons.js";

import { CreateRightClickMenu } from "@/views/tools/rightClickMenu/index.js";

import { LoadingMask } from "@/views/tools/loading/index.js";

import { GetPathEdgeList } from "./common/index.js";

import { OriginalHandle } from "@/views/tools/common/originalHandle.js";
import { GetModelElevation } from "@/views/tools/common/modelElevation.js";
// BIM引擎封装
export function BIMEngine(parentDomId, options, GLTFLoader) {
  var _bimEngine = new Object();
  _bimEngine.RenderSAO = new RenderSAO(_bimEngine);
  _bimEngine.RenderPost = new RenderPost(_bimEngine);
  _bimEngine.DisPlayModel = new disPlayModel(_bimEngine);
  _bimEngine.ModelSelection = new ModelSelection(_bimEngine);
  _bimEngine.MinMap = new MinMap(_bimEngine);
  _bimEngine.D3Measure = new D3Measure(_bimEngine);
  _bimEngine.ControlButtons = new ControlButtons(); //按钮管理
  _bimEngine.scene = null;
  _bimEngine.GLTFLoader = GLTFLoader;
  _bimEngine.StopClick = false; //是否禁用单击
  _bimEngine.RightClickActive = true; //是否显示鼠标右键列表
  _bimEngine.ModelPaths = []; //所有模型加载的路径
  _bimEngine.AllEdgeList = []; //所有边线数据
  _bimEngine.treeData = []; //模型树数据
  _bimEngine.treeMapper = [];
  _bimEngine.doneModels = [];
  _bimEngine.ModelClassify = []; //模型类型和层级列表
  _bimEngine.IsMainScene = true; //是不是主视图-用于版本对比
  _bimEngine.move = true;
  _bimEngine.EdgeIgnoreSize = 1000; // 忽略计算边线的geometry.attributes.position的大小

  _bimEngine.SelectedModels = {
    indexesModels: [], // 模型索引
    loadedModels: [], //通过加载方式获得模型构建
    requiredModels: [] //通过接口查询返回的模型构建
  };
  _bimEngine.LoadedWatcher = {
    DoneNum: 0, //成功加载完成的模型套数
    TreeKey: 0, //用于模型数key值的唯一性
    List: [], //加载的所有模型路径加载情况列表
    ShowProgress: false, //是否显示进度条
    AllLoadPathSize: 0, //加载的所有模型路径长度
    AllProgress: 0, //整体加载进度
    Key: 0, //用于模型loading的className的唯一性
    AllDone: false // 是否一切准备就绪
  };
  _bimEngine.handleLoadDoneFunOnce = false; //模型加载完成需要执行的函数-只能执行一次，是否已经执行
  _bimEngine.FPS = 60; // 设置渲染频率为1FBS，也就是每秒调用渲染器render方法大约1次
  _bimEngine.DeviceType = getDeviceOS(); //显示的设备类型
  _bimEngine.SetBuild = false; //是否用于打包
  _bimEngine.SaveJsonSize = 20000000; // 存储JSON文件的字符串长度限制
  _bimEngine.OriginalData = {
    cameraPosition: null,
    clip: null
  };
  _bimEngine.ElevationList = []; //模型标高列表
  window.THREE = THREE;
  sessionStorage.removeItem("SelectedSingleModelInfo"); //刷新清空当前选中构建
  sessionStorage.removeItem("RootMenuSelect");

  // 创建场景加载的承接DOM
  let rootDom, sceneDom;
  createSceneDom();

  function createSceneDom() {
    rootDom = document.getElementById(parentDomId);
    sceneDom = document.createElement("div");
    sceneDom.className = "threejs-sence-container";
    rootDom.appendChild(sceneDom);
    // 适配PC端和移动端样式
    if (_bimEngine.DeviceType === "PC" || _bimEngine.DeviceType === "Pad") {
      document.body.className = document.body.className + " PCView-page-container";
      rootDom.className = rootDom.className + " PCView-page-container";
    } else if (_bimEngine.DeviceType === "Phone") {
      document.body.className = document.body.className + " MobileView-page-container";
      rootDom.className = rootDom.className + " MobileView-page-container";
    }
  }

  //初始化
  _bimEngine.init = function () {
    _bimEngine.scene = InitScene();
    let scene = _bimEngine.scene;
    var camera = InitPerCamera(scene);
    camera.name = "默认三维视图";
    scene.camera = camera;
    let renderer = InitRenender(sceneDom);
    _bimEngine.scene.renderer = renderer;
    // renderer.setClearColor(new THREE.Color(0.9, 0.9, 0.9))
    InitOthers(sceneDom, renderer);
    let point = InitLight(scene);
    // 加载背景图-用于反射
    InitBackgroundScene(scene);
    //鼠标操作3D模型
    var controls = setControl(_bimEngine, sceneDom, camera, renderer);
    scene.controls = controls;
    _bimEngine.controls = controls;
    let stats;
    if (process.env.NODE_ENV == "development") {
      //开发环境
      // 创建辅助坐标轴
      InitAxesHelper(_bimEngine.scene);
      //性能监控器
      stats = new Stats();
      stats.domElement.style.position = "absolute"; //绝对坐标
      stats.domElement.style.left = "0px"; // (0,0)px,左上角
      stats.domElement.style.top = "0px";
      sceneDom.appendChild(stats.domElement);
      _bimEngine.stats = stats;
      _bimEngine.HideStats = function () {
        stats.domElement.style.display = "none";
      };
    }

    _bimEngine.ViewCube = new ViewCube(_bimEngine, scene, sceneDom); //相机视图对象
    _bimEngine.ViewCube.init();
    _bimEngine.EngineRay = new EngineRay(_bimEngine);
    _bimEngine.RightClickMenu = new CreateRightClickMenu(_bimEngine); //右键列表
    _bimEngine.Render = new Render(_bimEngine); //渲染对象
    _bimEngine.MultiView = new Multiview(_bimEngine, camera); //多视图对象
    _bimEngine.RenderPost.enableRenderPost(true);
    SceneResize(_bimEngine); // 场景尺寸变化
    //适配移动端
    if (_bimEngine.SetBuild) {
      _bimEngine.TopMenu = new CreateTopMenu(_bimEngine);
    } else {
      _bimEngine.TopMenu = _bimEngine.DeviceType !== "Phone" ? new CreateTopMenu(_bimEngine) : null; //顶部menu列表
    }
    // _bimEngine.TopMenu = new CreateTopMenu(_bimEngine)
    _bimEngine.EventName = _bimEngine.EventName ? _bimEngine.EventName : "bimengine";
    //监听相机
    var myEvent = new CustomEvent(_bimEngine.EventName + ":camerachange", {
      detail: ""
    });
    controls.addEventListener("change", function () {
      _bimEngine.move = true;
      window.dispatchEvent(myEvent);
    });
    _bimEngine.UpdateRender = function () {
      _bimEngine.move = true;
    };

    // 创建一个时钟对象Clock
    var clock = new THREE.Clock();
    var timeS = 0;

    function render() {
      requestAnimationFrame(render);
      stats && stats.update();

      var T = clock.getDelta();
      timeS = timeS + T;
      //加载完成之前降低render刷新，加载完成之后恢复正常
      if (timeS > 1 / _bimEngine.FPS && _bimEngine.move == true) {
        renderCommand();
        timeS = 0;
        setTimeout(function () {
          renderer.render(scene, scene.camera); //执行渲染操作
        }, 200);
      } else {
      }
      _bimEngine.RenderSAO.render();
      _bimEngine.RenderPost.render();
    }
    render();

    function renderCommand() {
      renderer.setViewport(
        0,
        0,
        _bimEngine.scene.renderer.domElement.parentElement.innerWidth,
        _bimEngine.scene.renderer.domElement.parentElement.innerHeight
      ); //主场景视区

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
            _bimEngine.controls.zoomSpeed = dis * 0.1;
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
    _bimEngine.Clipping = new Clipping(_bimEngine, scene); //剖切对象
    _bimEngine.SelectionBox = new selectBox(_bimEngine); //框选对象
    _bimEngine.FirstPersonControls = new firstPersonControls(_bimEngine); //漫游
    _bimEngine.Loading = new LoadingMask(_bimEngine);
    _bimEngine.PointRoam = new PointRoam(_bimEngine); //定点漫游
    // _bimEngine.SenceZoom = new SenceZoom(scene); //场景放缩移动-模型显隐
    // _bimEngine.SenceZoom.Active()
    //加载TransformControls控制器-用于模型剖切
    setTransformControls(scene, camera, renderer);
    ModelOctreeVisible(_bimEngine); //监听相机移动
    CreateHighLightGroup(scene);

    //加载点击事件
    if (_bimEngine.RightClickActive) {
      setEventsMouse(_bimEngine, res => {
        if (res != null) {
          //鼠标单击事件（左键和右键）
          var myEvent = new CustomEvent("bimengine:click", {
            detail: res
          });
          window.dispatchEvent(myEvent);
        }
      });
    }
  };
  _bimEngine.RenderUpdate = function () {
    // _bimEngine.scene.renderer.render(_bimEngine.scene, _bimEngine.scene.camera); //执行渲染操作
    _bimEngine.MultiView.updaterender();
  };

  //设置加载路径和偏移
  _bimEngine.SetLoadPaths = function (list, off) {
    _bimEngine.ModelPaths = [];
    _bimEngine.PathOff = [];
    off = off ? off : [];
    for (let i = 0; i < list.length; i++) {
      let index = _bimEngine.ModelPaths.findIndex(x => x === list[i]);
      if (index === -1) {
        _bimEngine.ModelPaths.push(list[i]);
        _bimEngine.PathOff.push(off[i] ? off[i] : null);
        _bimEngine.ElevationList.push({
          value: list[i],
          path: list[i],
          label: "",
          children: [],
          load: false
        });
      }
    }
    console.log(_bimEngine.ModelPaths);
    console.log(_bimEngine.PathOff);
    console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), "开始------------");
  };

  //加载模型
  //url:模型加载路径
  //type:模型加载类型
  //option:模型加载的一些预设
  _bimEngine.start = function (rootPath, relativePath, type, option, callback) {
    let url = rootPath + "/" + relativePath;
    let scene = _bimEngine.scene;
    if (type == "glb") {
      let GroupBox = new THREE.Group();
      GroupBox.data_glb = url;
      scene.add(GroupBox);
      LoadGLB(_bimEngine, GroupBox, url, option.position, gltf => {
        callback();
      });
    } else if (type == "glbjson") {
      if (_bimEngine.LoadedWatcher.ShowProgress && !_bimEngine.Loading.isActive) {
        _bimEngine.Loading.Active();
        // setTimeout(() => {
        //   _bimEngine.Loading.isActive && _bimEngine.Loading.DisActive();
        // }, 60000);
      }
      _bimEngine.LoadedWatcher.AllLoadPathSize = _bimEngine.ModelPaths ? _bimEngine.ModelPaths.length : 0;
      _bimEngine.LoadedWatcher.List.push({
        relativePath: relativePath, //模型路径
        glbModelsLoadedNum: 0, //glb模型是否加载完成
        pipeModelsLoadedNum: 0, //管道模型是否加载完成
        structureModelsLoadedNum: 0, //语义化模型是否加载完成
        treeLoaded: false, //模型树是否加载完
        edgeLoaded: false, //模型边线是否加载完
        progress: 0, //加载进度
        back: false //是否回调（用于加载下一套）
      });
      _bimEngine.D3Measure.UpdateViewList(url); //更新视图数据
      //加载材质映射列表及材质列表
      LoadGlbJsonList(_bimEngine, scene, relativePath, url, option, () => {
        _bimEngine.UpdateLoadStatus(true, "glbModelsLoadedNum", relativePath, url, () => {
          callback();
        });
      }); //加载glb模型
      CreatorStructureModel(_bimEngine, scene, relativePath, url, option, () => {
        _bimEngine.UpdateLoadStatus(true, "structureModelsLoadedNum", relativePath, url, () => {
          callback();
        });
      }); //语义化模型
      CreatorInstancePipe(_bimEngine, scene, relativePath, url, option, () => {
        _bimEngine.UpdateLoadStatus(true, "pipeModelsLoadedNum", relativePath, url, () => {
          callback();
        });
      }); // 加载管道模型InstanceMesh合并
      // CreatorRebarModel(_bimEngine, scene, relativePath, url) //钢筋模型

      _bimEngine.LoadQuantitiesList(); //获得工程量列表
      // 一套模型超过10秒没有加载完成，直接回调，加载下一套
      setTimeout(() => {
        _bimEngine.UpdateLoadStatus(
          true,
          "",
          relativePath,
          url,
          () => {
            callback();
          },
          true
        );
      }, 15000);
    }
  };

  //模型加载完成状态监测
  _bimEngine.UpdateLoadStatus = function (modelLoad = true, type, relativePath, url, callback, timeout = false) {
    let CurrentLoadList = _bimEngine.LoadedWatcher.List.filter(item => item.relativePath === relativePath);
    if (CurrentLoadList && CurrentLoadList.length) {
      let LoadItem = CurrentLoadList[0];
      if (timeout && !LoadItem.back) {
        // 请求超时，直接回调，加载下一套
        LoadItem.back = true;
        callback();
        return;
      }
      if (LoadItem[type] < 1) {
        if (modelLoad) {
          LoadItem[type] = LoadItem[type] + 1;
          let txt;
          switch (type) {
            case "glbModelsLoadedNum":
              txt = "glb";
              break;
            case "pipeModelsLoadedNum":
              txt = "管道";
              break;
            case "structureModelsLoadedNum":
              txt = "语义化";
              break;
          }
          // console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), relativePath + " " + txt + "模型加载完成");
          LoadItem.progress = LoadItem.progress + 0.18;
          _bimEngine.UpdateProgress();
          if (
            LoadItem.glbModelsLoadedNum === 1 &&
            LoadItem.glbModelsLoadedNum === LoadItem.pipeModelsLoadedNum &&
            LoadItem.glbModelsLoadedNum === LoadItem.structureModelsLoadedNum
          ) {
            _bimEngine.LoadedWatcher.DoneNum = _bimEngine.LoadedWatcher.DoneNum + 1;
            console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), relativePath + " 全部加载完成---");
            if (!timeout && !LoadItem.back) {
              //正常加载完，回调，加载下一套
              LoadItem.back = true;
              callback();
            }
            _bimEngine.GetAllVisibilityModel();
            ResetModelMaterial(_bimEngine, url, relativePath); // 更新模型材质
            ModelTree(_bimEngine, relativePath); //加载模型树
            GetModelEdges(_bimEngine, relativePath); //worker加载模型边线
            // GetPathEdgeList(_bimEngine, relativePath); //同步加载模型边线
            setTimeout(function () {
              _bimEngine.EngineRay && _bimEngine.EngineRay.AddModels();
            }, 2000);
            if (_bimEngine.LoadedWatcher.DoneNum === _bimEngine.ModelPaths.length) {
              console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), "所有模型加载完成------------");
              _bimEngine.loadedDoneFun();
            }
            if (_bimEngine.cameraGoHome == null) {
              _bimEngine.cameraGoHome = 1;
            }
          }
        } else {
          let keyTxt = "";
          switch (type) {
            case "treeLoaded":
              keyTxt = "模型树";
              break;
            case "edgeLoaded":
              keyTxt = "模型边线";
              break;
          }
          console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), relativePath + " " + keyTxt + "加载完成");
          LoadItem[type] = true;
          LoadItem.progress = LoadItem.progress + 0.23;
          _bimEngine.UpdateProgress();
        }
      }
    }
  };

  // 更新加载进度
  _bimEngine.UpdateProgress = function () {
    let progress = 0;
    _bimEngine.UpdateRender();
    for (let item of _bimEngine.LoadedWatcher.List) {
      progress += item.progress * (1 / _bimEngine.LoadedWatcher.List.length);
    }
    if (progress >= 0.98) {
      progress = 1;
    }
    _bimEngine.LoadedWatcher.ShowProgress &&
      _bimEngine.Loading.isActive &&
      _bimEngine.Loading.StartAnimate("_" + (_bimEngine.LoadedWatcher.Key + 1), _bimEngine.LoadedWatcher.AllProgress * 100, progress * 100);
    _bimEngine.LoadedWatcher.AllProgress = progress;
    if (progress === 1 && !_bimEngine.LoadedWatcher.AllDone) {
      console.log(new Date().getMinutes() + ":" + new Date().getSeconds(), "一切准备就绪");
      _bimEngine.LoadedWatcher.AllDone = true;
      _bimEngine.LoadedWatcher.ShowProgress && _bimEngine.Loading.EndAnimate();
      _bimEngine.LoadModelElevation();
      if (_bimEngine.OriginalData.cameraPosition) {
        OriginalHandle(_bimEngine);
      } else {
        _bimEngine.ViewCube.cameraGoHome();
      }
    }
  };

  _bimEngine.loadedDoneFun = function () {
    if (!_bimEngine.handleLoadDoneFunOnce) {
      _bimEngine.handleLoadDoneFunOnce = true;
      _bimEngine.FPS = 60;
      // _bimEngine.ModelOctree();
    }
  };

  _bimEngine.ModelOctree = function () {
    ModelOctrees(_bimEngine);
  };
  _bimEngine.LoadModelTree = function (list) {
    ModelTree(_bimEngine, list);
  };
  _bimEngine.LoadModelElevation = function () {
    GetModelElevation(_bimEngine); //获得标高列表
  };

  // 清除原始数据
  _bimEngine.ClearOriginalData = function () {
    _bimEngine.OriginalData = {
      cameraPosition: null,
      clip: null
    };
  };

  //注册事件
  //事件枚举，回调
  _bimEngine.addEventListener = function (callback) {};
  _bimEngine.ListenerEvent = function (event, callback) {
    window.addEventListener(event, ({ detail }) => {
      callback(detail);
    });
  };
  //锁定相机选择
  _bimEngine.LockingSelect = function () {
    _bimEngine.LockingSelect = true;
  };
  _bimEngine.UnLockingSelect = function () {
    _bimEngine.LockingSelect = false;
  };

  //载入外部插件
  _bimEngine.loadExtension = function () {};
  //运行外部插件
  _bimEngine.getExtension = function () {};
  _bimEngine.MergeScene = function () {
    disposeScene(_bimEngine.scene);

    function disposeScene(scene) {
      scene.traverse(function (object) {
        // if (object.dispose) {
        //   object.dispose();
        // }
        if (object.type === "Mesh") {
          object.geometry.dispose();
          // object.material.dispose();
        }
      });
    }
  };
  //获取当前所有的模型
  _bimEngine.GetAllVisibilityModel = function () {
    for (let i = 0; i < _bimEngine.scene.children.length; i++) {
      _bimEngine.scene.children[i].index = i;
    }
    var rootmodels = _bimEngine.scene.children.filter(o => o.name == "rootModel");
    return rootmodels;
  };

  _bimEngine.GetAllIndexesModel = function () {
    let indexesList = [];

    if (_bimEngine.treeMapper) {
      _bimEngine.treeMapper.map(item => {
        if (item.ModelIds && item.ModelIds.length) {
          Array.prototype.splice.apply(indexesList, [indexesList.length, item.ModelIds.length].concat(item.ModelIds));
        }
      });
    }
    return indexesList;
  };

  //重置选中模型构建
  /**
   *
   * @param {*} key 操作类型：visible表示操作显隐，highlight表示操作亮显
   * @param {*} list 需要操作的模型列表
   * @param {*} val 是否显隐或者高亮
   */
  _bimEngine.ResetSelectedModels_ = function (key, list, val, color) {
    switch (key) {
      case "visible":
        HandleRequestModelSelect_(_bimEngine, list, val);
        break;
      case "highlight":
        _bimEngine.SelectedModels.indexesModels = list;
        window.WatcherSelectModel && (window.WatcherSelectModel.Num = list.length);
        HandleHighlightModelSelect_(_bimEngine, list, val, color);
        break;
    }
    // console.log(_bimEngine.SelectedModels)
    console.log(_bimEngine.CurrentSelect);
  };

  //重置选中模型构建
  _bimEngine.ResetSelectedModels = function (key, list) {
    //恢复接口查询返回的模型构建-选中样式
    _bimEngine.SelectedModels.requiredModels.length &&
      HandleRequestModelSelect(_bimEngine.SelectedModels.requiredModels, [
        {
          key: "material"
        }
      ]);
    _bimEngine.SelectedModels.requiredModels = [];
    //恢复加载方式获得模型构建-选中样式
    _bimEngine.SelectedModels.loadedModels.length &&
      HandleModelSelect(_bimEngine, _bimEngine.SelectedModels.loadedModels, [
        {
          key: "material"
        }
      ]);
    _bimEngine.SelectedModels.loadedModels = [];
    switch (key) {
      case "loaded":
        //设置加载方式获得模型构建-选中样式
        if (list.length) {
          let material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.375, 0.63, 1),
            side: THREE.DoubleSide
          });
          HandleModelSelect(_bimEngine, list, [
            {
              key: "material",
              val: material
            }
          ]);
        }
        _bimEngine.SelectedModels.loadedModels = list;
        break;
      case "required":
        //设置接口查询返回的模型构建-选中样式
        if (list.length) {
          let material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.375, 0.63, 1),
            side: THREE.DoubleSide
          });
          HandleRequestModelSelect(_bimEngine, list, [
            {
              key: "material",
              val: material
            }
          ]);
        }
        _bimEngine.SelectedModels.requiredModels = list;
        break;
    }
    console.log(_bimEngine.SelectedModels);
  };

  //加载工程量信息
  _bimEngine.LoadQuantitiesList = function () {
    //获取所有模型工程量
    var paths = _bimEngine.ModelPaths;
    if (_bimEngine.QuantitiesList != null) {
      return;
    }
    _bimEngine.QuantitiesList = [];
    paths.map(o => {
      loadData(o);
    });

    function loadData(path) {
      LoadZipJson("file/" + path + "/quantitiesList.zip", res => {
        let quantitiesList = JSON.parse(res);
        if (quantitiesList && quantitiesList.length) {
          _bimEngine.QuantitiesList.push({
            path: path,
            datas: quantitiesList
          });
        }
      });
    }
  };
  //释放内存
  window.onbeforeunload = function (e) {
    _bimEngine.Clear();
    return null;
  };
  _bimEngine.Clear = function () {
    //释放边线与构件树
    _bimEngine.AllEdgeList = null;
    _bimEngine.treeData = null;
    _bimEngine.treeMapper = null;
    //释放主场景
    releaseRender(_bimEngine.scene.renderer, _bimEngine.scene);
    //释放备用场景
    // releaseRender(_bimEngine.scene.renderer, _bimEngine.EngineRay.scene);
    //清理场景
    function releaseRender(renderer, scene) {
      let clearScene = function (scene) {
        let arr = scene.children.filter(x => x);
        arr.forEach(item => {
          if (item.children != null && item.children.length) {
            clearScene(item);
          } else {
            if (item.type === "Mesh") {
              item.geometry.dispose();
              item.material.dispose();
              if (item.meshs != null) {
                if (Array.isArray(item.meshs)) {
                  item.meshs.forEach(m => {
                    m.geometry.dispose();
                  });
                } else {
                  item.geometry.dispose();
                }
              }
              item.meshs = null;
              item.ElementInfos = null;
              !!item.clear && item.clear();
            }
          }
        });
        !!scene.clear && scene.clear(renderer);
        arr = null;
      };
      try {
        clearScene(scene);
      } catch (e) {}
      try {
        renderer.renderLists.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement = null;
        renderer.content = null;
        renderer = null;
      } catch (e) {}

      if (!!window.requestAnimationId) {
        cancelAnimationFrame(window.requestAnimationId);
      }
      THREE.Cache.clear();
    }
  };
  //查询文件信息
  _bimEngine.AnalysisModelInfo = function () {
    let info = {
      triangles: 0,
      vertex: 0,
      pathCount: 0,
      modelCount: 0
    };
    info.triangles = _bimEngine.scene.renderer.info.render.triangles;
    info.vertex = info.triangles * 3;
    info.pathCount = _bimEngine.ModelPaths.length;
    _bimEngine.scene.children.forEach(o => {
      if (o.ElementInfos != null) {
        info.modelCount = info.modelCount + o.ElementInfos.length;
      }
    });
    return info;
  };
  return _bimEngine;
}
