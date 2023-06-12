import { IsInScreen } from "@/views/tools/common/index.js";
import { debounce } from "@/utils/index.js";
/**
 * 场景放缩对模型执行显影操作
 * @param {*}
 */
export function SenceZoom(scene) {
  var _senceZoom = new Object();
  _senceZoom.Active = function () {
    window.addEventListener("bimengine:camerachange", debounce(SendMessage, 400));
  };
  _senceZoom.DisActive = function () {
    window.removeEventListener("bimengine:camerachange", SendMessage);
  };
  _senceZoom.SendPostMessage = function (msg) {
    if (!_senceZoom.worker) {
      _senceZoom.worker = createWorker();
    }
    _senceZoom.worker.postMessage(msg); //将复杂计算交给子线程,可以理解为给参数让子线程去操作。
  };

  function SendMessage() {
    _senceZoom.SendPostMessage && _senceZoom.SendPostMessage([1, 2, 3]);
  }

  // 创建 worker
  function createWorker() {
    let worker = new Worker("bimCDN/js/zoom.worker.js");
    worker.onmessage = function (e) {
      console.log(e.data);
      // handlerShowHide(e.data)
    };
    worker.onerror = function (event) {
      worker.terminate();
      worker = null;
    };
    return worker;
  }

  // 计算视线外的构建dbid，用于执行构建显隐
  function handlerShowHide(list) {
    console.log(new Date().getMinutes() + ":" + new Date().getSeconds());
    //监听相机移动-模型显隐处理
    let rootmodels = scene.children.filter(o => o.name == "rootModel" && (o.type == "Mesh" || o.type == "Mesh-Structure"));
    for (let rootmodel of rootmodels) {
      for (let i = 0; i < rootmodel.ElementInfos.length; i++) {
        let model = rootmodel.ElementInfos[i];
        let targetPosition = model.center;
        let flag = IsInScreen(targetPosition, scene.camera);
        let cloneVisible = rootmodel.cloneMaterialArray[i].visible;
        let visible = flag && cloneVisible;
        rootmodel.material[i] = rootmodel.cloneMaterialArray[i].clone();
        rootmodel.material[i].visible = visible;
      }
    }
  }

  return _senceZoom;
}
