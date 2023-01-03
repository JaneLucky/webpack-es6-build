//加载json文件
export default function(_path, callback) {
  var test;
  if (window.XMLHttpRequest) {
    test = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    test = new window.ActiveXObject();
  } else {
    alert("请升级至最新版本的浏览器");
  }
  if (test != null) {
    // test.open("GET", "info.json", true);
    test.open("GET", _path, true);
    test.send(null);
    test.onreadystatechange = function() {
      if (test.readyState == 4 && test.status == 200) {
        callback(test.responseText);
      }
    }
  }
}