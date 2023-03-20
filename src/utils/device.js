//判断当前打开的是移动设备还是PC
export function getDeviceType() {
  let userAgentInfo = navigator.userAgent;
  let Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
  let getArr = Agents.filter(i => userAgentInfo.includes(i));
  let type = getArr.length ? 'Mobile' : 'PC';
  if(window.screen.width >= 1024){
    type = 'PC'
  }
  return type;
}