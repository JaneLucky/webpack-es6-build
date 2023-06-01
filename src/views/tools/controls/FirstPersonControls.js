import { FirstPersonCameraControl } from "@/three/controls/firstPersonCameraControl.js";
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";
import { CreateSvg } from "@/views/tools/common/index.js";
import { getDeviceOS } from "@/utils/device";
import RoamSet from "@/views/tools/components/RoamSet.vue";
import { create } from "@/utils/create";
import TWEEN from "@tweenjs/tween.js";
export function firstPersonControls(_Engine) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/FirstPersonRoaming.scss");
  var _firstPersonControls = new Object();
  let AnimationFrame;
  let _container = _Engine.scene.renderer.domElement.parentElement;
  _firstPersonControls.isActive = false;
  /* 属性参数默认 */
  _firstPersonControls.settings = {
    firstPerson: true,
    gravity: false, // 重力
    collision: false, // 碰撞
    positionEasing: true,
    speed: 0.02, // 速度
    minMap: false, //是否开启小地图
    cameraFov: 50,
    speedUnit: 1
  };
  _firstPersonControls.Component = null;
  //激活
  _firstPersonControls.Active = function () {
    _Engine.scene.controls && (_Engine.scene.controls.enabled = false);
    if (!_firstPersonControls.controls) {
      _firstPersonControls.controls = new FirstPersonCameraControl(
        _Engine,
        _Engine.scene.camera,
        _Engine.scene.renderer.domElement,
        _Engine.GetAllVisibilityModel()
      );
      _firstPersonControls.controls.name = "FirstPersonControls";
      _firstPersonControls.controls.enabled = _firstPersonControls.settings.firstPerson;
      _firstPersonControls.controls.applyGravity = _firstPersonControls.settings.gravity;
      _firstPersonControls.controls.applyCollision = _firstPersonControls.settings.collision;
      _firstPersonControls.controls.positionEasing = _firstPersonControls.settings.positionEasing;
      _firstPersonControls.controls.moveSpeed = _firstPersonControls.settings.speed;
      _firstPersonControls.controls.minMap = _firstPersonControls.settings.minMap;
      _firstPersonControls.controls.cameraFov = _firstPersonControls.settings.fov;
      _firstPersonControls.controls.speedUnit = _firstPersonControls.settings.speedUnit;
    }
    _firstPersonControls.controls.enabled = true;
    _firstPersonControls.isActive = true;
    CreatorRoamDialog(); //创建弹框UI
    _Engine.MinMap.show(); //打开小地图

    window.addEventListener("resize", onWindowResize, false);
    render();
  };
  //关闭
  _firstPersonControls.DisActive = function () {
    _Engine.scene.controls && (_Engine.scene.controls.enabled = true);
    window.removeEventListener("resize", onWindowResize);
    cancelAnimationFrame(AnimationFrame); //清除动画
    _firstPersonControls.isActive = false;
    CloseRoamDialog();

    _Engine.MinMap.close(); //关闭小地图
    _firstPersonControls.controls.enabled = false;
    _firstPersonControls.controls._isEnabled = false;
    BackCameraFov(_Engine.scene.camera.fov, 50, 300);
  };

  _firstPersonControls.UpdateSet = function (params) {
    _Engine.FirstPersonControls.controls.applyGravity = params.gravity;
    _Engine.FirstPersonControls.controls.applyCollision = params.collision;
    _Engine.FirstPersonControls.controls.minMap = params.minMap;
    _Engine.FirstPersonControls.controls.moveSpeed = 0.02 * params.speedUnit;
    _Engine.scene.camera.fov = params.cameraFov;
    if (params.minMap) {
      _Engine.MinMap.show(); //打开小地图
    } else {
      _Engine.MinMap.close(); //关闭小地图
    }
    _Engine.scene.camera.updateProjectionMatrix();
  };

  // 还原相机广角
  function BackCameraFov(newFov, backFov, time = 1000) {
    let AnimationFrame;
    let AnimateTween = new TWEEN.Tween({
      fov: newFov // 相机当前位置y
    });
    AnimateTween.to(
      {
        fov: backFov // 新的相机位置x
      },
      time
    );
    AnimateTween.onUpdate(function (res) {
      _Engine.scene.camera.fov = res.fov;
      _Engine.scene.camera.updateProjectionMatrix();
      _Engine.UpdateRender();
    });
    AnimateTween.onComplete(function (res) {
      cancelAnimationFrame(AnimationFrame); //清除动画
      AnimationFrame = null;
    });
    function animate() {
      AnimationFrame = requestAnimationFrame(animate);
      AnimateTween && AnimateTween.update();
    }
    AnimateTween.start();
    animate();
  }

  function CreatorRoamDialog() {
    let DeviceOS = getDeviceOS();
    if (DeviceOS !== "PC") {
      CreatorRoamMobileController();
    }
    CreatorSetDialog();
  }

  function CreatorSetDialog() {
    if (_firstPersonControls.Component) {
      _firstPersonControls.Component.dialogVisible = true;
      return;
    }
    _firstPersonControls.Component = create(_container, RoamSet, { _Engine: _Engine, Param: _firstPersonControls.settings });
  }

  function CloseRoamDialog() {
    let DeviceOS = getDeviceOS();
    if (DeviceOS !== "PC") {
      GetRootDom().style.display = "none"; //关闭弹框UI
    }
    _firstPersonControls.Component.dialogVisible = false;
  }

  function CreatorRoamMobileController() {
    let mobileRoamContainer = GetRootDom();
    if (mobileRoamContainer) {
      mobileRoamContainer.style.display = "block";
      return;
    }
    mobileRoamContainer = document.createElement("div");
    mobileRoamContainer.className = "MobileRoamContainer";
    _container.appendChild(mobileRoamContainer);
    let containCircle = document.createElement("div");
    containCircle.className = "containCircle";
    mobileRoamContainer.appendChild(containCircle);
    //创建控制器
    let controllerPanel = document.createElement("div");
    controllerPanel.className = "controllerPanel";
    let ball = document.createElement("div");
    ball.className = "ball";
    controllerPanel.appendChild(ball);

    const BLENDER_DIAMETER = 100; //圆形混合器直径
    const POINTER_DIAMETER = 40; //可拖动指示器直径
    const BLENDER_BORDER_WIDTH = 2; // 圆形混合器边宽
    const BLENDER_RADIUS = (BLENDER_DIAMETER - BLENDER_BORDER_WIDTH) * 0.5; // 圆形混合器半径
    const POINTER_RADIUS = POINTER_DIAMETER * 0.5; // 可拖动指示器半径
    // 可拖动指示器中心点-非圆心点,是css相对圆形混合器的位置 top/left
    const center = {
      x: BLENDER_RADIUS - POINTER_RADIUS,
      y: BLENDER_RADIUS - POINTER_RADIUS
    };
    controllerPanel.style.width = BLENDER_DIAMETER + "px";
    controllerPanel.style.height = BLENDER_DIAMETER + "px";
    controllerPanel.style.borderWidth = BLENDER_BORDER_WIDTH + "px";
    ball.style.width = POINTER_DIAMETER + "px";
    ball.style.height = POINTER_DIAMETER + "px";
    ball.style.left = center.x + "px";
    ball.style.top = center.y + "px";

    function getPositionByRadian(radian, radius) {
      const x = radius * Math.cos(radian) + center.x;
      const y = radius * Math.sin(radian) + center.y;
      return {
        x,
        y
      };
    }
    ball.addEventListener("touchstart", e => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const originX = e.targetTouches[0].clientX - ball.offsetLeft - POINTER_RADIUS;
      const originY = e.targetTouches[0].clientY - ball.offsetTop - POINTER_RADIUS;
      ball.addEventListener("touchmove", e => {
        // 通过事件委托，计算移动的距离
        const left = e.targetTouches[0].clientX - POINTER_RADIUS - originX;
        const top = e.targetTouches[0].clientY - POINTER_RADIUS - originY;
        const dx = left - center.x;
        const dy = top - center.y;
        // 计算当前鼠标与中心点的弧度
        const radian = Math.atan2(dy, dx);
        // 计算当前鼠标与中心点距离
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = dist >= BLENDER_RADIUS ? BLENDER_RADIUS : dist;
        // 根据半径与弧度计算 x, y
        const { x, y } = getPositionByRadian(radian, radius);
        ball.style.left = x + "px";
        ball.style.top = y + "px";

        _firstPersonControls.controls._camerLocalDirection.x = 1 * ((x - center.x) / BLENDER_RADIUS);
        _firstPersonControls.controls._camerLocalDirection.z = -1 * ((y - center.y) / BLENDER_RADIUS);
      });
      ball.addEventListener("touchend", e => {
        _firstPersonControls.controls._camerLocalDirection.x = 0;
        _firstPersonControls.controls._camerLocalDirection.z = 0;
        ball.style.left = center.x + "px";
        ball.style.top = center.y + "px";
      });
    });

    containCircle.appendChild(controllerPanel);
    let top_icon = CreateSvg("icon-roam-up");
    controllerPanel.appendChild(top_icon);
    top_icon.className.baseVal = top_icon.className.baseVal + " icon-roam-up";
    let down_icon = CreateSvg("icon-roam-down");
    controllerPanel.appendChild(down_icon);
    down_icon.className.baseVal = down_icon.className.baseVal + " icon-roam-down";
    let left_icon = CreateSvg("icon-roam-left");
    controllerPanel.appendChild(left_icon);
    left_icon.className.baseVal = left_icon.className.baseVal + " icon-roam-left";
    let right_icon = CreateSvg("icon-roam-right");
    controllerPanel.appendChild(right_icon);
    right_icon.className.baseVal = right_icon.className.baseVal + " icon-roam-right";

    //创建选择框
    let selectPanel = document.createElement("div");
    selectPanel.className = "SelectPanel";
    let insideContain = document.createElement("div");
    insideContain.className = "InsideContain";
    let controlContain = document.createElement("div");
    controlContain.className = "ControlContain";
    let to_top_icon = CreateSvg("icon-roam-up"); //Q
    to_top_icon.addEventListener("touchstart", e => {
      _firstPersonControls.controls._camerLocalDirection.y = 1;
      to_top_icon.addEventListener("touchend", e => {
        _firstPersonControls.controls._camerLocalDirection.y = 0;
      });
    });
    controlContain.appendChild(to_top_icon);
    to_top_icon.className.baseVal = top_icon.className.baseVal + " to_top";
    let to_down_icon = CreateSvg("icon-roam-down"); //E
    to_down_icon.addEventListener("touchstart", e => {
      _firstPersonControls.controls._camerLocalDirection.y = -1;
      to_down_icon.addEventListener("touchend", e => {
        _firstPersonControls.controls._camerLocalDirection.y = 0;
      });
    });
    controlContain.appendChild(to_down_icon);
    to_down_icon.className.baseVal = top_icon.className.baseVal + " to_down";

    insideContain.appendChild(controlContain);

    selectPanel.appendChild(insideContain);
    containCircle.appendChild(selectPanel);
  }

  function GetRootDom() {
    let root = _container.getElementsByClassName("MobileRoamContainer")[0];
    return root;
  }

  /* 窗口变动触发 */
  function onWindowResize() {
    _Engine.scene.camera.aspect = window.innerWidth / window.innerHeight;
    _Engine.scene.camera.updateProjectionMatrix();
    _Engine.scene.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* 数据更新 */
  function render() {
    AnimationFrame = requestAnimationFrame(render);
    renderCommand();
  }

  function renderCommand() {
    _Engine.scene.renderer.render(_Engine.scene, _Engine.scene.camera); //执行渲染操作
    _firstPersonControls.controls && _firstPersonControls.controls.enabled && _firstPersonControls.controls.update();
    // 小地图
    _Engine.MinMap && _Engine.MinMap.visible && _Engine.MinMap.renderUpdata();
    _Engine.RenderSAO.render();
    _Engine.RenderPost.render();
  }
  return _firstPersonControls;
}
