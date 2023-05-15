const THREE = require("@/three/three.js");
import "@/three/controls/OrbitControls";
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";
import { getRootDom } from "@/views/tools/extensions/measures/index.js";
import { getSceneViewDomPosition } from "@/views/tools/common/screenResize.js";
//多视口平铺
/*
【视图分类】
1. 平面视图：
2. 剖面视图：
3. 立面视图：
4. 三维视图：
【相机分类】
1. 平面视图：正交相机，只能平移，缩放
2. 三维视图：所有三维交互
*/
export function Multiview(_Engine, camera) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/multiview.scss");
  var multiview = new Object();
  var _container = _Engine.scene.renderer.domElement.parentElement;
  let ScreenPosition = getSceneViewDomPosition(_Engine.scene.renderer.domElement);

  if (_Engine.ArrayCamera == null) {
    let arraycamera = new THREE.ArrayCamera([camera]);
    camera.IsActive = true;
    camera.IsVisibility = true;
    camera.Id = "a";
    camera.ControlType = "D3";
    const WIDTH = _Engine.scene.renderer.domElement.width; // * window.devicePixelRatio;
    const HEIGHT = _Engine.scene.renderer.domElement.height; // * window.devicePixelRatio;
    const ASPECT_RATIO = _Engine.scene.renderer.domElement.width / _Engine.scene.renderer.domElement.height;
    camera.viewport = new THREE.Vector4(ScreenPosition.x, ScreenPosition.y, Math.ceil(WIDTH), Math.ceil(HEIGHT));
    _Engine.ArrayCamera = arraycamera;
    TileView(_Engine);
  }
  //注册事件
  document.addEventListener("click", function (res) {
    //判断一下，
    for (var camera of _Engine.ArrayCamera.cameras) {
      let minx = camera.viewport.x;
      let miny = camera.viewport.y;
      let maxx = camera.viewport.x + camera.viewport.z;
      let maxy = camera.viewport.y + camera.viewport.w;
      if (camera.IsVisibility == true && camera.IsActive == false) {
        if (res.clientX > minx && res.clientX < maxx) {
          if (res.clientY > miny && res.clientY < maxy) {
            camera.IsActive = true;
            _Engine.scene.controls.dispose();
            multiview.ReplaceView(_Engine, camera);
            let target = camera.target == null ? _Engine.scene.controls.target.clone() : camera.target.clone();
            _Engine.scene.controls = new THREE.OrbitControls(_Engine, camera, _Engine.scene.renderer.domElement);
            _Engine.scene.controls.target = target;
            _Engine.scene.controls.update();
            if (camera.ControlType == "D3") {
              _Engine.scene.controls.enableRotate = true;
              document.getElementsByClassName("ViewCube")[0].style.visibility = "visible";
            } else if (camera.ControlType == "Plane") {
              _Engine.scene.controls.enableRotate = false;
              document.getElementsByClassName("ViewCube")[0].style.visibility = "hidden";
            }
            //把原来的变成false
            var cs = _Engine.ArrayCamera.cameras.filter(x => x.IsActive == true && x.uuid != camera.uuid);
            for (var c of cs) {
              c.IsActive = false;
            }
            var myEvent = new CustomEvent("bimengine:camerachange", {
              detail: ""
            });
            _Engine.scene.controls.addEventListener("change", function () {
              _Engine.move = true;
              window.dispatchEvent(myEvent);
            });
            break;
          }
        }
      }
    }
  });
  //刷新视图
  multiview.updaterender = function () {
    // const HEIGHT = (window.innerHeight);// * window.devicePixelRatio;
    for (let i = 0; i < _Engine.ArrayCamera.cameras.length; i++) {
      var camera = _Engine.ArrayCamera.cameras[i];
      if (camera.IsVisibility) {
        _Engine.scene.renderer.setScissorTest(true);
        _Engine.scene.renderer.setViewport(
          camera.viewport.x - ScreenPosition.x,
          camera.viewport.y - ScreenPosition.y,
          camera.viewport.z,
          camera.viewport.w
        );
        _Engine.scene.renderer.setScissor(
          camera.viewport.x - ScreenPosition.x,
          camera.viewport.y - ScreenPosition.y,
          camera.viewport.z,
          camera.viewport.w
        );
        // _Engine.scene.renderer.setViewport(camera.viewport.x-ScreenPosition.x, HEIGHT - camera.viewport.y-ScreenPosition.y - camera
        // 	.viewport.w, camera.viewport.z, camera
        // 	.viewport.w);
        // _Engine.scene.renderer.setScissor(camera.viewport.x-ScreenPosition.x, HEIGHT - camera.viewport.y-ScreenPosition.y - camera
        // 	.viewport.w, camera.viewport.z, camera
        // 	.viewport.w);
        // _Engine.scene.renderer.setScissorTest(true);
        _Engine.scene.renderer.render(_Engine.scene, camera);
        //更新相机
        if (camera.IsActive) {
          camera.target = _Engine.scene.controls.target.clone();
        }
      }
    }
  };

  /*******************************************************视图交互的一些方法**********************************************************/
  //创建新视图
  multiview.creatorView = function (_Engine, option) {
    CreatorView(_Engine, option);
  };
  //平铺视图
  multiview.TileView = function (_Engine) {
    var cameras = _Engine.ArrayCamera.cameras;
    for (let ca of cameras) {
      ca.IsVisibility = true;
    }
    TileView(_Engine);
  };
  //清除视图
  multiview.ClearView = function (_Engine) {
    ClearViews(_Engine);
  };
  //切换
  multiview.SwitchView = function (_Engine, camera) {
    let cameras = _Engine.ArrayCamera.cameras;
    for (var item_ of cameras) {
      if (item_.Id == camera.Id) {
        item_.IsActive = true;
        item_.IsVisibility = true;
      } else {
        item_.IsActive = false;
        item_.IsVisibility = false;
      }
    }
    _Engine.scene.controls.dispose();
    multiview.ReplaceView(_Engine, camera);
    let target = camera.target == null ? _Engine.scene.controls.target : camera.target.clone();
    _Engine.scene.controls = new THREE.OrbitControls(_Engine, camera, _Engine.scene.renderer.domElement);
    _Engine.scene.controls.target = target;
    _Engine.scene.controls.update();
    if (camera.ControlType == "D3") {
      _Engine.scene.controls.enableRotate = true;
      document.getElementsByClassName("ViewCube")[0].style.visibility = "visible";
      _Engine.Render.DisplayEdge(false);
    } else if (camera.ControlType == "Plane") {
      _Engine.scene.controls.enableRotate = false;
      document.getElementsByClassName("ViewCube")[0].style.visibility = "hidden";
      _Engine.Render.DisplayEdge(true);
    }
    TileView(_Engine);
    multiview.updaterender();
    var myEvent = new CustomEvent("bimengine:camerachange", {
      detail: ""
    });
    _Engine.scene.controls.addEventListener("change", function () {
      _Engine.move = true;
      window.dispatchEvent(myEvent);
    });
    _Engine.RenderUpdate();
  };
  //创建三维正交视图
  multiview.New3DOrthogonal = function (_Engine) {
    let viewdata = multiview.Get3DOrthogonalData();
    //判断一下有没有吧
    let index = _Engine.ArrayCamera.cameras.findIndex(x => x.Id == viewdata.Id);
    if (index == -1) {
      var width = window.innerWidth; //窗口宽度
      var height = window.innerHeight; //窗口高度
      var k = width / height; //窗口宽高比
      var s = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
      var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
      camera.name = viewdata.label;
      camera.Id = viewdata.Id;
      camera.viewport = new THREE.Vector4(0, 0, width, height);
      camera.ControlType = "D3";
      _Engine.ArrayCamera.cameras.splice(0, 0, camera);
      multiview.SwitchView(_Engine, camera);
      //跳转至最佳位置
      _Engine.ViewCube.cameraGoHome();
    } else {
      multiview.SwitchView(_Engine, _Engine.ArrayCamera.cameras[index]);
    }
    _Engine.scene.controls.enableRotate = true;
  };
  //创建三维透视视图
  multiview.New3DPerspective = function (_Engine) {
    let viewdata = multiview.Get3DPerspectiveData();
    //判断一下有没有吧
    let index = _Engine.ArrayCamera.cameras.findIndex(x => x.Id == viewdata.Id);
    if (index == -1) {
      var width = _Engine.scene.renderer.domElement.width; //窗口宽度
      var height = _Engine.scene.renderer.domElement.height; //窗口高度
      var k = width / height; //窗口宽高比
      var camera = new THREE.PerspectiveCamera(
        50,
        _Engine.scene.renderer.domElement.width / _Engine.scene.renderer.domElement.height,
        0.01,
        30000
      ); //透视相机
      camera.name = viewdata.label;
      camera.Id = viewdata.Id;
      camera.viewport = new THREE.Vector4(0, 0, width, height);
      camera.ControlType = "D3";
      _Engine.ArrayCamera.cameras.splice(0, 0, camera);
      multiview.SwitchView(_Engine, camera);
      _Engine.ViewCube.cameraGoHome();
      //跳转至最佳位置
    } else {
      multiview.SwitchView(_Engine, _Engine.ArrayCamera.cameras[index]);
    }
    _Engine.scene.controls.enableRotate = true;
    document.getElementsByClassName("ViewCube")[0].style.visibility = "visible";
  };
  //创建平面视图
  multiview.NewPlaneView = function (_Engine, viewdata) {
    let index = _Engine.ArrayCamera.cameras.findIndex(x => x.Id == viewdata.Id);
    if (index == -1) {
      var width = _Engine.scene.renderer.domElement.width; //窗口宽度
      var height = _Engine.scene.renderer.domElement.height; //窗口高度
      var k = width / height; //窗口宽高比
      var s = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
      var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 0.001, 1000000);
      camera.name = viewdata.label;
      camera.Id = viewdata.Id;
      camera.viewport = new THREE.Vector4(0, 0, width, height);
      camera.ControlType = "Plane";
      _Engine.ArrayCamera.cameras.splice(0, 0, camera);
      //跳转至最佳位置
      var box = _Engine.ViewCube.getBoundingBox(_Engine);
      var min = box.min;
      var max = box.max;
      var target_ = min.clone().add(max.clone()).multiplyScalar(0.5);
      let position = new THREE.Vector3(target_.x, viewdata.ViewData.Evevation * 0.3048, target_.z);
      let ViewDirection = new THREE.Vector3(
        viewdata.ViewData.ViewDirection.X,
        viewdata.ViewData.ViewDirection.Z,
        viewdata.ViewData.ViewDirection.Y
      );
      let target = position.clone().add(ViewDirection);
      _Engine.ViewCube.animateCamera(_Engine.scene.camera.position, position, _Engine.scene.controls.target.clone(), target);
      multiview.SwitchView(_Engine, camera);
    } else {
      multiview.SwitchView(_Engine, _Engine.ArrayCamera.cameras[index]);
    }
    _Engine.scene.controls.enableRotate = false;
    document.getElementsByClassName("ViewCube")[0].style.visibility = "hidden";
  };
  //创建剖面视图
  multiview.NewElevationView = function (_Engine, viewdata) {
    let index = _Engine.ArrayCamera.cameras.findIndex(x => x.Id == viewdata.Id);
    if (index == -1) {
      var width = _Engine.scene.renderer.domElement.width; //窗口宽度
      var height = _Engine.scene.renderer.domElement.height; //窗口高度
      var k = width / height; //窗口宽高比
      var s = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
      var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
      camera.name = viewdata.label;
      camera.Id = viewdata.Id;
      camera.ControlType = "Plane";
      camera.viewport = new THREE.Vector4(0, 0, width, height);
      _Engine.ArrayCamera.cameras.splice(0, 0, camera);
      //跳转至最佳位置
      if (viewdata.ViewData.Origin.X == null) {
        let position = new THREE.Vector3(viewdata.ViewData.Origin.x, viewdata.ViewData.Origin.y, viewdata.ViewData.Origin.z);
        let ViewDirection = new THREE.Vector3(
          viewdata.ViewData.ViewDirection.x,
          viewdata.ViewData.ViewDirection.y,
          viewdata.ViewData.ViewDirection.z
        );
        let target = position.clone().add(ViewDirection);

        _Engine.ViewCube.animateCamera(_Engine.scene.camera.position, position, _Engine.scene.controls.target.clone(), target);
        multiview.SwitchView(_Engine, camera);
      } else {
        let position = new THREE.Vector3(
          viewdata.ViewData.Origin.X * 0.3048,
          viewdata.ViewData.Origin.Z * 0.3048,
          viewdata.ViewData.Origin.Y * 0.3048
        );
        let ViewDirection = new THREE.Vector3(
          viewdata.ViewData.ViewDirection.X,
          viewdata.ViewData.ViewDirection.Z,
          viewdata.ViewData.ViewDirection.Y
        );
        let target = position.clone().add(ViewDirection);

        _Engine.ViewCube.animateCamera(_Engine.scene.camera.position, position, _Engine.scene.controls.target.clone(), target);
        multiview.SwitchView(_Engine, camera);
      }
    } else {
      multiview.SwitchView(_Engine, _Engine.ArrayCamera.cameras[index]);
    }
    _Engine.scene.controls.enableRotate = false;
    document.getElementsByClassName("ViewCube")[0].style.visibility = "hidden";
  };

  //获得三维正交视图数据
  multiview.Get3DOrthogonalData = function () {
    let data = _Engine.D3Measure.ViewList.filter(item => item.ViewType == "3DOrthogonal");
    let item = data && data.length ? data[0] : {};
    return item;
  };
  //获得三维透视视图数据
  multiview.Get3DPerspectiveData = function () {
    let data = _Engine.D3Measure.ViewList.filter(item => item.ViewType == "3DPerspective");
    let item = data && data.length ? data[0] : {};
    return item;
  };

  multiview.ReplaceView = function (_Engine, camera) {
    let beforeCamera = _Engine.scene.camera;
    _Engine.scene.camera = camera;
    if (_Engine.scene.camera.Id !== beforeCamera.Id) {
      console.log("相机切换");
      //测量点
      let MeasurePointContainer = getRootDom(_container, "MeasurePoint", false);
      if (MeasurePointContainer) {
        let MeasureList = MeasurePointContainer.getElementsByClassName("PointItem");
        for (let i = 0; i < MeasureList.length; i++) {
          if (MeasureList[i].dataset.cameraId === camera.type + "_" + camera.Id) {
            MeasureList[i].style.display = "block";
          } else {
            MeasureList[i].style.display = "none";
          }
        }
      }
      //测量线
      let MeasureLineContainer = getRootDom(_container, "MeasureLine", false);
      if (MeasureLineContainer) {
        let MeasureList = MeasureLineContainer.getElementsByClassName("LineItem");
        for (let i = 0; i < MeasureList.length; i++) {
          if (MeasureList[i].dataset.cameraId === camera.type + "_" + camera.Id) {
            MeasureList[i].style.display = "block";
          } else {
            MeasureList[i].style.display = "none";
          }
        }
      }
    }
  };

  return multiview;
}
//添加一个视图
export function CreatorView(_Engine, option) {
  //视图类型
  /*
	{
	    ViewType:"",	
	}
	
	
	*/
  const ASPECT_RATIO = _Engine.scene.renderer.domElement.width / _Engine.scene.renderer.domElement.height;
  const subcamera = new THREE.PerspectiveCamera(40, ASPECT_RATIO, 0.1, 10);
  subcamera.viewport = new THREE.Vector4(1, 2, 2, 2);
  subcamera.IsActive = false;
  subcamera.IsVisibility = true;
  subcamera.name = "视图" + _Engine.ArrayCamera.cameras.length;
  _Engine.ArrayCamera.cameras.splice(0, 0, subcamera);
  TileView(_Engine);
  // if (option.ViewType = "View3D") {

  // } else if (option.ViewType = "View2D") {

  // }
}
//切换视图
export function SwitchView(camera) {}
//清除视图，只保留当前激活视图
export function ClearViews(_Engine) {
  _Engine.ArrayCamera.cameras = [];
  _Engine.ArrayCamera.cameras.push(_Engine.scene.camera);
  TileView(_Engine);
  ClearHandleBtns();
  _Engine.RenderUpdate();
}

export function ClearHandleBtns() {
  var doms = document.getElementsByClassName("ViewControlPanel");
  if (doms.length === 1) {
    doms[0].childNodes[0].style.display = "none";
  }
}

//平铺视图
export function TileView(_Engine) {
  let cameraArray = _Engine.ArrayCamera.cameras.filter(x => x.IsVisibility == true);
  let viewCount = cameraArray.length;

  const WIDTH = _Engine.scene.renderer.domElement.width; // * window.devicePixelRatio;
  const HEIGHT = _Engine.scene.renderer.domElement.height; // * window.devicePixelRatio;
  const ASPECT_RATIO = _Engine.scene.renderer.domElement.width / _Engine.scene.renderer.domElement.height;
  let ScreenPosition = getSceneViewDomPosition(_Engine.scene.renderer.domElement);

  var doms = document.getElementsByClassName("ViewControlPanel");
  for (; doms.length > 0; ) {
    doms[0].remove();
  }
  //最多4个视图的平铺
  if (viewCount == 1) {
    //一个视图
    const subcamera = cameraArray[0];
    subcamera.viewport = new THREE.Vector4(ScreenPosition.x, ScreenPosition.y, Math.ceil(WIDTH), Math.ceil(HEIGHT));
    Resize(subcamera);
    CreatorViewUI(_Engine, subcamera, viewCount);
  }
  if (viewCount == 2) {
    //两个视图
    {
      const subcamera = cameraArray[0];
      subcamera.viewport = new THREE.Vector4(0, 0, Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT));
      subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT);
      Resize(subcamera);
      CreatorViewUI(_Engine, subcamera);
    }
    {
      const subcamera = cameraArray[1];
      subcamera.viewport = new THREE.Vector4(Math.floor(WIDTH * 0.5), 0, Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT));
      subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT);
      Resize(subcamera);
      CreatorViewUI(_Engine, subcamera);
    }
  }
  if (viewCount == 3) {
    //三个视图
    {
      const subcamera = cameraArray[0];
      subcamera.viewport = new THREE.Vector4(0, 0, Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT * 0.5));
      subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT * 0.5);
      Resize(subcamera);
      CreatorViewUI(_Engine, subcamera);
    }
    {
      const subcamera = cameraArray[1];
      subcamera.viewport = new THREE.Vector4(0, Math.floor(HEIGHT * 0.5), Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT * 0.5));
      subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT * 0.5);
      Resize(subcamera);
      CreatorViewUI(_Engine, subcamera);
    }
    {
      const subcamera = cameraArray[2];
      subcamera.viewport = new THREE.Vector4(Math.floor(WIDTH * 0.5), 0, Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT));
      subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT);
      Resize(subcamera);
      CreatorViewUI(_Engine, subcamera);
    }
  }
  if (viewCount >= 4) {
    //四个视图
    {
      const subcamera = cameraArray[0];
      subcamera.viewport = new THREE.Vector4(0, 0, Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT * 0.5));
      subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT * 0.5);
      Resize(subcamera);
      CreatorViewUI(_Engine, subcamera);
    }
    {
      const subcamera = cameraArray[1];
      subcamera.viewport = new THREE.Vector4(0, Math.floor(HEIGHT * 0.5), Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT * 0.5));
      subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT * 0.5);
      Resize(subcamera);
      CreatorViewUI(_Engine, subcamera);
    }
    {
      const subcamera = cameraArray[2];
      subcamera.viewport = new THREE.Vector4(Math.floor(WIDTH * 0.5), 0, Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT * 0.5));
      subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT * 0.5);
      Resize(subcamera);
      CreatorViewUI(_Engine, subcamera);
    }
    {
      const subcamera = cameraArray[3];
      subcamera.viewport = new THREE.Vector4(
        Math.floor(WIDTH * 0.5),
        Math.floor(HEIGHT * 0.5),
        Math.ceil(WIDTH * 0.5),
        Math.ceil(HEIGHT * 0.5)
      );
      Resize(subcamera);
      CreatorViewUI(_Engine, subcamera);
    }
  }
  viewCount > 1 && _Engine.RenderUpdate();
  // _Engine.multiview.updaterender();
}
//更新相机画布
export function Resize(camera) {
  if (camera.type == "OrthographicCamera") {
    //正交相机
    let frustumSize = 100;
    let width = camera.viewport.z;
    let height = camera.viewport.w;
    let aspect = width / height;
    camera.aspect = aspect;
    camera.left = (-frustumSize * aspect) / 2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
  } else if (camera.type == "PerspectiveCamera") {
    //透视相机
    let width = camera.viewport.z;
    let height = camera.viewport.w;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}
//创建视图UI
export function CreatorViewUI(_Engine, camera, size) {
  let left = camera.viewport.x;
  let top = camera.viewport.y;
  let width = camera.viewport.z;
  let height = camera.viewport.w;

  let dom = document.createElement("div");
  dom.className = "ViewControlPanel";
  dom.style.top = top + "px";
  dom.style.left = left + "px";
  dom.style.width = width + "px";
  dom.style.height = height + "px";
  dom.style.outline = "1px solid rgb(10,10,10,0.2)";

  let show = "block";
  if (size === 1) {
    show = "none";
  }
  var htmls = [
    "<div style='display:" + show + "'>",
    "<div id='" + camera.uuid + "closeButton' class='ViewControlClose'>×</div>",
    "<div id='" + camera.uuid + "maxButton' class='ViewControlMax'>▣</div>",
    "<div id='" + camera.uuid + "minButton' class='ViewControlMin'>─</div>",
    "</div>"
  ].join("");
  dom.innerHTML = htmls;
  var _container = _Engine.scene.renderer.domElement.parentElement;
  _container.appendChild(dom);
  // debugger
  document.getElementById(camera.uuid + "closeButton").addEventListener("click", function (res) {
    //关闭窗口,直接清掉
    if (_Engine.ArrayCamera.cameras.length == 1) {
      return;
    }
    let index = _Engine.ArrayCamera.cameras.findIndex(x => x.uuid == res.target.id.replace("closeButton", ""));
    if (index != -1) {
      _Engine.ArrayCamera.cameras.splice(index, 1);
    }
    if (_Engine.ArrayCamera.cameras.findIndex(x => x.uuid == _Engine.scene.camera.uuid) == -1) {
      _Engine.MultiView.ReplaceView(_Engine, _Engine.ArrayCamera.cameras[0]);
    }
    TileView(_Engine);
    _Engine.RenderUpdate();
  });
  document.getElementById(camera.uuid + "minButton").addEventListener("click", function (res) {
    //最小化窗口
    if (_Engine.ArrayCamera.cameras.length == 1) {
      return;
    }
    let uuid = res.target.id.replace("minButton", "");
    let index = _Engine.ArrayCamera.cameras.findIndex(x => x.uuid == uuid);
    if (index != -1) {
      let camera_ = _Engine.ArrayCamera.cameras[index];
      camera.IsVisibility = false;
      TileView(_Engine);
    }
    _Engine.RenderUpdate();
  });
  document.getElementById(camera.uuid + "maxButton").addEventListener("click", function (res) {
    //最大化窗口,除了自己，其他人全部最小化
    if (_Engine.ArrayCamera.cameras.length == 1) {
      return;
    }
    let uuid = res.target.id.replace("maxButton", "");
    let index = _Engine.ArrayCamera.cameras.findIndex(x => x.uuid == uuid);
    if (index != -1) {
      let camera_ = _Engine.ArrayCamera.cameras[index];
      console.log(camera_.name);
      for (var ca of _Engine.ArrayCamera.cameras) {
        if (ca.uuid != camera_.uuid) {
          ca.IsVisibility = false;
          ca.IsActive = false;
        }
      }
      camera_.IsActive = true;
      camera_.IsVisibility = true;
      _Engine.MultiView.ReplaceView(_Engine, camera_);
      TileView(_Engine);
    }
    _Engine.RenderUpdate();
  });
}
