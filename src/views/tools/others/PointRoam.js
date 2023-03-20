const THREE = require('@/three/three.js')
export function PointRoam() { // 点的坐标数据
	var _pointRoam = new Object();
  _pointRoam.curveCamera = null //相机位置曲线
  _pointRoam.curveTarget = null //目标点位置曲线
  _pointRoam.isPaused = false //是否暂停
  _pointRoam.isCancle = false //是否取消

  //生成漫游曲线
  _pointRoam.SetPointRoam = function (list) {
    // 目标的坐标数组转为点数组
    let pointsTarget = [];
    // 相机的坐标数组转为点数组
    let pointsCamera = [];
    for(let i=0;i<list.length;i++){
      pointsTarget.push(new THREE.Vector3(
        list[i].target.x,
        list[i].target.y,
        list[i].target.z,
      ));
      pointsCamera.push(new THREE.Vector3(
        list[i].position.x,
        list[i].position.y,
        list[i].position.z,
      ));
    }
    // 目标的位置3D样条曲线
    _pointRoam.curveTarget = new THREE.CatmullRomCurve3(pointsTarget); //通过类CatmullRomCurve3创建一个3D样条曲线
    // 相机的位置3D样条曲线
    _pointRoam.curveCamera = new THREE.CatmullRomCurve3(pointsCamera); //通过类CatmullRomCurve3创建一个3D样条曲线
  }

  //开始执行动画
  _pointRoam.RunAnimation = function (camera,time=5){
    _pointRoam.isCancle = false //是否取消
    let t = 0; // 计算当前时间进度百分比
    let AnimationFrame;
    function render() {
      AnimationFrame = window.requestAnimationFrame(render);
      function changeLookAt() {
        // 相机点在线条上的位置
        const positionCamera = _pointRoam.curveCamera.getPointAt(t);
        // 目标点在线条上的位置
        const positionTarget = _pointRoam.curveTarget.getPointAt(t);
        // 目标点的三维切线向量
        var nPos = new THREE.Vector3(positionTarget.x, positionTarget.y, positionTarget.z);
        // 目标点t在曲线上位置切线向量
        const tangent = _pointRoam.curveTarget.getTangentAt(t);
        // 位置向量和切线向量相加即为所需朝向的标点向量
        const lookAtVec = tangent.add(nPos);
        //更新相机位置
        camera.position.set(positionCamera.x, positionCamera.y, positionCamera.z)
        //更新相机的看向
        camera.lookAt(lookAtVec);
        t = t + 1/(60*time)
      }
      if(_pointRoam.isCancle){
        window.cancelAnimationFrame(AnimationFrame)
        AnimationFrame = null
      }else{
        if(!_pointRoam.isPaused){
          if(_pointRoam.curveCamera && _pointRoam.curveTarget && t<=1){
            changeLookAt()
          }else{
            window.cancelAnimationFrame(AnimationFrame)
            AnimationFrame = null
          }
        }
      }
    }
    render()
  }
  
  //更新动画
  _pointRoam.StartAnimation = function (list,camera,time){
    //取消现有动画
    _pointRoam.CancleAnimation() 
    //重新生成漫游取消
    _pointRoam.SetPointRoam(list)
    //重新执行动画
    _pointRoam.RunAnimation(camera,time)
  }

  // 暂停动画
  _pointRoam.PausedAnimation = function(){
    _pointRoam.isPaused = true
  }
  // 继续动画
  _pointRoam.ContinueAnimation = function(){
    _pointRoam.isPaused = false
  }
  // 取消动画
  _pointRoam.CancleAnimation = function(){
    _pointRoam.curveCamera = null //相机位置曲线
    _pointRoam.curveTarget = null //目标点位置曲线
    _pointRoam.isPaused = false //是否暂停
    _pointRoam.isCancle = true  //是否取消
  }

	return _pointRoam;
}