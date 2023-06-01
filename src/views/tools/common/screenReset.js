// 获得屏幕宽高比（大/小）
export function getScreenAspect() {
  var width = window.innerWidth; //窗口宽度
  var height = window.innerHeight; //窗口高度
  return width > height ? width / height : height / width; //窗口宽高比
}
