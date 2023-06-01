const THREE = require("@/three/three.js");
import TWEEN from "@tweenjs/tween.js";
export function PointRoam(_Engine) {
  // 点的坐标数据
  var _pointRoam = new Object();
  let AnimationFrame;
  _pointRoam.AnimateTween = null;
  _pointRoam.isPaused = false; //是否暂停
  _pointRoam.isCancle = false; //是否取消

  //更新动画
  _pointRoam.StartAnimation = function (list, time) {
    //取消现有动画
    _pointRoam.CancleAnimation();
    //加载模型
    let AnimateInOrder = async () => {
      let AnimateItem = async i => {
        return new Promise((resolve, reject) => {
          _pointRoam.RunAnimation(list[i], list[i + 1], time * 1000, () => {
            _pointRoam.CancleAnimation();
            resolve();
          });
        });
      };
      //for循环调接口
      for (let i = 0; i < list.length - 1; i++) {
        await AnimateItem(i);
      }
    };
    AnimateInOrder();
  };

  _pointRoam.RunAnimation = function (currentParams, nextParams, time = 1000, callback) {
    _pointRoam.AnimateTween = new TWEEN.Tween({
      x1: currentParams.position.x, // 相机当前位置x
      y1: currentParams.position.y, // 相机当前位置y
      z1: currentParams.position.z, // 相机当前位置z
      x2: currentParams.target.x, // 控制当前的中心点x
      y2: currentParams.target.y, // 控制当前的中心点y
      z2: currentParams.target.z, // 控制当前的中心点z
      _x: currentParams.quaternion._x, // 相机当前quaternion
      _y: currentParams.quaternion._y, // 相机当前quaternion
      _z: currentParams.quaternion._z, // 相机当前quaternion
      _w: currentParams.quaternion._w // 相机当前quaternion
    });
    _pointRoam.AnimateTween.to(
      {
        x1: nextParams.position.x, // 新的相机位置x
        y1: nextParams.position.y, // 新的相机位置y
        z1: nextParams.position.z, // 新的相机位置z
        x2: nextParams.target.x, // 新的控制中心点位置x
        y2: nextParams.target.y, // 新的控制中心点位置x
        z2: nextParams.target.z, // 新的控制中心点位置x
        _x: nextParams.quaternion._x, // 新的相机quaternion
        _y: nextParams.quaternion._y, // 新的相机quaternion
        _z: nextParams.quaternion._z, // 新的相机quaternion
        _w: nextParams.quaternion._w // 新的相机quaternion
      },
      time
    );
    _pointRoam.AnimateTween.onUpdate(function (res) {
      _Engine.scene.camera.position.x = res.x1;
      _Engine.scene.camera.position.y = res.y1;
      _Engine.scene.camera.position.z = res.z1;
      _Engine.scene.controls.target.x = res.x2;
      _Engine.scene.controls.target.y = res.y2;
      _Engine.scene.controls.target.z = res.z2;
      _Engine.scene.camera.quaternion._x = res._x;
      _Engine.scene.camera.quaternion._y = res._y;
      _Engine.scene.camera.quaternion._z = res._z;
      _Engine.scene.camera.quaternion._w = res._w;
      _Engine.scene.controls.update();
      _Engine.ViewCube.renderScene();
    });
    _pointRoam.AnimateTween.onComplete(function (res) {
      _Engine.scene.controls.auto = false;
      _Engine.ViewCube.renderScene();
      callback && callback(true);
    });
    function animate(time) {
      AnimationFrame = requestAnimationFrame(animate);
      _pointRoam.AnimateTween && _pointRoam.AnimateTween.update();
    }
    _pointRoam.AnimateTween.start();
    animate();
  };

  // 暂停动画
  _pointRoam.PausedAnimation = function () {
    _pointRoam.AnimateTween && _pointRoam.AnimateTween.pause();
    _pointRoam.isPaused = true;
  };
  // 继续动画
  _pointRoam.ContinueAnimation = function () {
    _pointRoam.AnimateTween && _pointRoam.AnimateTween.resume();
    _pointRoam.isPaused = false;
  };
  // 取消动画
  _pointRoam.CancleAnimation = function () {
    if (_pointRoam.AnimateTween) {
      cancelAnimationFrame(AnimationFrame); //清除动画
      AnimationFrame = null;
      _pointRoam.AnimateTween.stop();
    }
    _pointRoam.AnimateTween = null;
    _pointRoam.isPaused = false; //是否暂停
    _pointRoam.isCancle = true; //是否取消
  };

  return _pointRoam;
}
