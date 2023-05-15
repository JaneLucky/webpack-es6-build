import { getRootDom } from "@/views/tools/extensions/measures/index.js";
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js";

export function LoadingMask(_Engine) {
  require("@/views/tools/style/" + SetDeviceStyle() + "/loading.scss");
  var _loading = new Object();
  var _container = _Engine.scene.renderer.domElement.parentElement;
  let LoadingDomId = "LoadingMaskContain"; //loading的根节点
  let AnimateId = "LoadingMaskAnimate";
  let process_active_contain, process_text;
  let intervalTime = null;
  _loading.isActive = false; //loading是否激活
  //激活
  _loading.Active = function () {
    CreateLoadingDom();
    _loading.isActive = true;
  };
  //关闭
  _loading.DisActive = function () {
    var root = getRootDom(_container, LoadingDomId, false);
    root && root.remove(); //删除Loading
    _loading.isActive = false;
  };

  function CreateLoadingDom() {
    let root = getRootDom(_container, LoadingDomId);
    let process_container = document.createElement("div");
    process_container.className = "ProcessContainer";
    let process_contain = document.createElement("div");
    process_contain.className = "ProcessContain";

    let process_disActive_contain = document.createElement("div");
    process_disActive_contain.className = "ProcessDisActiveContain";
    process_contain.appendChild(process_disActive_contain);

    process_active_contain = document.createElement("div");
    process_active_contain.className = "ProcessActiveContain";
    process_disActive_contain.appendChild(process_active_contain);

    process_text = document.createElement("div");
    process_text.className = "ProcessText";
    process_text.innerText = "0";
    process_contain.appendChild(process_text);
    let process_unit = document.createElement("div");
    process_unit.className = "ProcessUnit";
    process_unit.innerText = "%";
    process_contain.appendChild(process_unit);
    process_container.appendChild(process_contain);

    root.appendChild(process_container);

    // _loading.StartAnimate(1, 0, 0)
  }

  _loading.StartAnimate = function (index, start, end, time = 1) {
    if (intervalTime) {
      process_active_contain.style.width = start;
      process_text.innerText = Math.floor(start);
      ClearInerval();
    }
    let rootAnimateStyle = getAnimateDom();
    let cName = CreateKeyframes(rootAnimateStyle, index, start, end);
    process_active_contain.style.animation = cName + " " + time + "s";
    process_active_contain.style.width = end + "%";
    let sum = end - start;
    let temp = sum / (time * 10);
    intervalTime = setInterval(() => {
      _Engine.UpdateRender();
      let num = Math.floor(Number(process_text.innerText) + temp);
      if (num > end) {
        num = end;
      }
      process_text.innerText = num;
      if (num === end) {
        clearInterval(intervalTime);
        intervalTime = null;
      }
      if (num === 100 && end === 100) {
        _loading.EndAnimate();
      }
    }, time * 10);
  };

  _loading.EndAnimate = function () {
    process_active_contain.style.width = 100;
    process_text.innerText = 100;
    ClearInerval();
    _loading.DisActive();
    _Engine.UpdateRender();
  };

  function ClearInerval() {
    clearInterval(intervalTime);
    intervalTime = null;
  }

  // 动态创建动画
  function CreateKeyframes(dom, index, start, end) {
    let sheet = dom.sheet ? dom.sheet : dom;
    sheet.insertRule(`
      @keyframes myMove${index} {
        0% {
          width: 0%;
        }
        0% {
          width: ${start}%;
        }
        100% {
          width: ${end}%;
        }
      }
      `);
    return `myMove${index}`;
  }

  //获得动画文件
  function getAnimateDom() {
    let rootAnimate;
    for (let item of document.styleSheets) {
      if (item.title === AnimateId) {
        rootAnimate = item;
        break;
      }
    }
    if (!rootAnimate) {
      rootAnimate = document.createElement("style");
      rootAnimate.setAttribute("type", "text/css");
      rootAnimate.title = AnimateId;
      document.head.appendChild(rootAnimate);
    }
    return rootAnimate;
  }

  return _loading;
}
