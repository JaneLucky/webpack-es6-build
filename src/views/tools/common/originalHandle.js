import { getDeviceOS } from "@/utils/device";
/**
 * 初始化场景处理
 * @param {*} _Engine 引擎对象
 */
export function OriginalHandle(_Engine) {
  if (_Engine.OriginalData.cameraPosition) {
    _Engine.ViewCube.ReductionCameraPose(_Engine.OriginalData.cameraPosition, 1000, res => {});
  }
  OriginalClip(_Engine);
}

// 处理剖切
export function OriginalClip(_Engine) {
  if (_Engine.OriginalData.clip) {
    let DeviceOS = getDeviceOS(); //显示的设备类型
    if (DeviceOS == "Phone") {
      //Phone
      window.WatcherLoadDone && (window.WatcherLoadDone.IsDone = true);
    } else {
      //Pad 或 PC
      switch (_Engine.OriginalData.clip.type) {
        case "MultiSide":
          _Engine.TopMenu.ClickItem("剖切");
          break;
        case "X轴":
          _Engine.TopMenu.ClickItem("添加X平面");
          break;
        case "Y轴":
          _Engine.TopMenu.ClickItem("添加Y平面");
          break;
        case "Z轴":
          _Engine.TopMenu.ClickItem("添加Z平面");
          break;
      }
    }
  }
}
