//判断当前打开的是移动设备还是PC
export function getDeviceType() {
  let os = getDeviceOS();
  let type;
  if (os === "PC") {
    type = "PC";
  }
  type = os === "PC" || os === "Pad" ? "PC" : "Mobile";
  // if (window.screen.width >= 1024) {
  //   type = "PC";
  // }
  return type;
}

export function getDeviceOS() {
  var os = (function () {
    var ua = navigator.userAgent,
      isWindowsPhone = /(?:Windows Phone)/.test(ua),
      isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
      isAndroid = /(?:Android)/.test(ua),
      isFireFox = /(?:Firefox)/.test(ua),
      isChrome = /(?:Chrome|CriOS)/.test(ua),
      isPhone = /(?:iPhone)/.test(ua) && !isTablet,
      isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
      isTouch = "ontouchstart" in document.documentElement;
    return {
      isAndroid: isAndroid,
      isPhone: isPhone,
      isTablet: isTablet,
      isTouch: isTouch
    };
  })();
  let type;
  if (os.isAndroid || os.isPhone) {
    // 手机
    type = "Phone";
  } else if (os.isTablet || os.isTouch) {
    // 平板
    type = "Pad";
  } else {
    // 电脑
    type = "PC";
  }
  return type;
}
