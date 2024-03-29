const THREE = require("@/three/three.js");
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";
import { getDeviceOS } from "@/utils/device";
import MiniMapElevation from "@/views/tools/components/MiniMapElevation.vue";
import { create } from "@/utils/create";
//小地图

//点击瞬移
//拖拽旋转视图

export function MinMap(_Engine) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/minMap.scss");
  var _minMap = new Object();
  _minMap.visible = false;
  const HEIGHT = window.innerHeight * window.devicePixelRatio;
  //更新位置
  _minMap.renderUpdata = function () {
    if (_minMap.camera == null) return;
    if (_minMap.visible == false) return;
    //更新相机的位置
    let camera = _minMap.camera;
    //相机的位置的X,Z坐标值与场景相机保持一致
    let position_x = _Engine.scene.camera.position.x;
    let position_y = _Engine.scene.camera.position.y;
    let position_z = _Engine.scene.camera.position.z;
    _minMap.camera.position.set(position_x, position_y, position_z);
    _minMap.renderer.render(_Engine.scene, camera);
    //通过相机来反应标记点的位置
    let vector = get2DVec(_minMap.camera.position);
    let x = (vector.x / window.innerWidth) * 200;
    let y = (vector.y / window.innerHeight) * 200;
    _minMap.OriginPoint.style.left = x + "px";
    _minMap.OriginPoint.style.top = y + "px";
    _minMap.OriginDirection.style.left = x + "px";
    _minMap.OriginDirection.style.top = y + "px";
    //旋转角度
    let dir = _Engine.scene.camera.getWorldDirection(new THREE.Vector3());
    dir = new THREE.Vector3(dir.x, 0, dir.z);
    let dir2 = new THREE.Vector3(0, 0, 1);
    let angle = dir.angleTo(dir2);
    let d = dir.clone().cross(dir2).y > 0 ? 1 : -1;

    _minMap.OriginDirection.style.transform = "rotate(" + (45 + d * angle * 57.2974) + "deg)";
    // console.log(_Engine.scene.camera.rotation.y)
  };
  //显示
  _minMap.show = function () {
    //判断开关是否开启
    if (_Engine.FirstPersonControls.controls.minMap) {
      _minMap.visible = true;
      initCamera();
    }
    _minMap.renderer &&
      _minMap.renderer.domElement &&
      _minMap.renderer.domElement.addEventListener("pointerdown", function (res) {
        let sceneCamera = _Engine.scene.camera;
        let point = getRayPoint({
          x: res.offsetX,
          y: res.offsetY
        });
        if (point) {
          sceneCamera.position.set(point.x, sceneCamera.position.y, point.z);
        }
      });
  };
  //隐藏
  _minMap.close = function () {
    let _container = _Engine.scene.renderer.domElement.parentElement;
    _minMap.visible = false;
    _minMap.camera = null;
    _minMap.Component = null;
    _container.getElementsByClassName("miniMapRoot")[0] && _container.getElementsByClassName("miniMapRoot")[0].remove();
  };

  //初始化相机
  function initCamera() {
    let DeviceOS = getDeviceOS();
    let _container = _Engine.scene.renderer.domElement.parentElement;
    if (_container.getElementsByClassName("miniMapRoot")[0] != null) {
      return;
    }
    let domDiv = document.createElement("div");
    if (DeviceOS === "PC") {
      domDiv.className = "miniMapRoot miniMapRoot_PC";
    } else {
      domDiv.className = "miniMapRoot miniMapRoot_Mobile";
    }
    domDiv.style.background = "linear-gradient(rgb(127, 191, 225), rgb(198, 226, 255))";
    _container.appendChild(domDiv);
    var htmls = ['<div class="OriginPoint"></div>', '<div class="OriginDirection"></div>'].join("");
    domDiv.innerHTML = htmls;
    _minMap.OriginPoint = domDiv.getElementsByClassName("OriginPoint")[0];
    _minMap.OriginDirection = domDiv.getElementsByClassName("OriginDirection")[0];

    let renderer = new THREE.WebGLRenderer({
      antialias: true, //开启锯齿
      alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(domDiv.clientWidth, domDiv.clientHeight);
    renderer.setClearAlpha(0); //设置背景颜色透明
    _minMap.renderer = renderer;
    domDiv.appendChild(renderer.domElement);

    if (DeviceOS === "PC") {
      domDiv.addEventListener("pointerdown", _onMouseDown);
    }

    function _onMouseDown(e) {
      var left = domDiv.offsetLeft;
      var top = domDiv.offsetTop;
      //计算出鼠标的位置与元素位置的差值。
      var cleft = e.clientX - left;
      var ctop = e.clientY - top;
      domDiv.style.cursor = "move";
      document.addEventListener("pointermove", handelPosition);
      document.addEventListener("pointerup", () => {
        domDiv.style.cursor = "auto";
        document.removeEventListener("pointermove", handelPosition);
      });

      function handelPosition(doc) {
        //计算出移动后的坐标。
        var moveLeft = doc.clientX - cleft;
        var moveTop = doc.clientY - ctop;
        let maxWidth = _container.offsetWidth - domDiv.offsetWidth;
        let maxHeight = _container.offsetHeight - domDiv.offsetHeight;
        if (moveLeft < 0) {
          moveLeft = 0;
        }
        if (moveTop < 0) {
          moveTop = 0;
        }
        if (moveLeft > maxWidth) {
          moveLeft = maxWidth;
        }
        if (moveTop > maxHeight) {
          moveTop = maxHeight;
        }
        //当移动位置在范围内时，元素跟随鼠标移动。
        domDiv.style.left = moveLeft + "px";
        domDiv.style.top = moveTop + "px";
        domDiv.style.cursor = "move";
      }
    }

    //获取到dom元素
    var dom = renderer.domElement;
    if (dom == null) {
      return;
    }
    //初始化相机，并跳转过去

    if (dom != null) {
      var width = dom.offsetWidth; //窗口宽度
      var height = dom.offsetHeight; //窗口高度
      var k = width / height; //窗口宽高比
      var s = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
      var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 0.01, 3000);
      _minMap.camera = camera;
      camera.name = "miniMap";
      camera.viewport = new THREE.Vector4(dom.getBoundingClientRect().x, dom.getBoundingClientRect().y, 200, 200);

      //跳转至当先相机位置
      let controls = new THREE.OrbitControls(_Engine, camera, dom);
      controls.enableRotate = false;
      //设置控制器
      let position = _Engine.scene.camera.position;
      let target = position.clone().add(new THREE.Vector3(0, -1, 0));
      _minMap.camera.position.set(position.x, position.y, position.z);
      _minMap.camera.lookAt(target);
      controls.update();
      // _Engine.ViewCube.animateCamera(_Engine.scene.camera.position, position, _Engine.scene.controls
      // .target);
    }
    //目标点位置
    // 创建标高选择列表
    CreatorSetDialog(renderer.domElement.parentElement);
  }

  function CreatorSetDialog(dom) {
    _minMap.Component = create(dom, MiniMapElevation, { _Engine: _Engine });
  }

  //屏幕坐标转世界坐标
  function get3DVec(pos) {
    const mouseX = pos.x;
    const mouseY = pos.y;
    const x = (mouseX / _minMap.camera.viewport.z) * 2 - 1;
    const y = -(mouseY / _minMap.camera.viewport.w) * 2 + 1;
    const stdVector = new THREE.Vector3(x, y, 0.5);

    const worldVector = stdVector.unproject(_minMap.camera);
    // const worldVector = stdVector.unproject(_Engine.scene.camera);
    return worldVector;
  }

  function getRayPoint(pos) {
    const mouseX = pos.x;
    const mouseY = pos.y;
    let rayCaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    mouse.x = (mouseX / _minMap.camera.viewport.z) * 2 - 1;
    mouse.y = -(mouseY / _minMap.camera.viewport.w) * 2 + 1; //这里为什么是-号，没有就无法点中

    //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
    rayCaster.setFromCamera(mouse, _minMap.camera);
    //获取与射线相交的对象数组， 其中的元素按照距离排序，越近的越靠前。
    //+true，是对其后代进行查找，这个在这里必须加，因为模型是由很多部分组成的，后代非常多。
    let intersects = rayCaster.intersectObjects(_Engine.GetAllVisibilityModel(), true);
    if (intersects.length > 0) {
      return intersects[0].point;
    } else {
      return null;
    }
  }

  //世界坐标转屏幕坐标
  function get2DVec(vector3) {
    const stdVector = vector3.project(_minMap.camera);
    const a = window.innerWidth / 2;
    const b = window.innerHeight / 2;
    const x = Math.round(stdVector.x * a + a);
    const y = Math.round(-stdVector.y * b + b);
    return new THREE.Vector2(x, y);
  }
  return _minMap;
}
