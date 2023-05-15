//定义窗口的设置
export function SceneResize(_Engine) {
  //加入事件监听器,窗口自适应
  window.addEventListener("resize", handleScreenResize_);
  function handleScreenResize_() {
    handleScreenResize(_Engine);
  }
}

//处理窗口大小变化
export function handleScreenResize(_Engine) {
  const WIDTH = _Engine.scene.renderer.domElement.parentElement.clientWidth; // * window.devicePixelRatio;
  const HEIGHT = _Engine.scene.renderer.domElement.parentElement.clientHeight; // * window.devicePixelRatio;
  _Engine.scene.renderer.domElement.width = WIDTH;
  _Engine.scene.renderer.domElement.height = HEIGHT;
  _Engine.scene.renderer.setSize(WIDTH, HEIGHT);
  const ASPECT_RATIO = WIDTH / HEIGHT;
  _Engine.scene.camera.aspect = ASPECT_RATIO;
  let ScreenPosition = getSceneViewDomPosition(_Engine.scene.renderer.domElement);
  _Engine.scene.camera.viewport = new THREE.Vector4(ScreenPosition.x, ScreenPosition.y, Math.ceil(WIDTH), Math.ceil(HEIGHT));
  _Engine.scene.camera.updateProjectionMatrix();
  var doms = document.getElementsByClassName("ViewControlPanel");
  if (doms) {
    doms[0].style.width = WIDTH + "px";
    doms[0].style.height = HEIGHT + "px";
  }
  _Engine.RenderUpdate();
}

export function getSceneViewDomPosition(elem) {
  var top = elem.offsetTop; //获得elem元素距相对定位的父元素的top
  let left = elem.offsetLeft;
  elem = elem.offsetParent; //将elem换成起相对定位的父元素
  while (elem != null) {
    //只要还有相对定位的父元素
    //获得父元素 距他父元素的top值,累加到结果中
    top += elem.offsetTop;
    left += elem.offsetLeft;
    elem = elem.offsetParent;
  }
  return {
    x: left,
    y: top
  };
}
