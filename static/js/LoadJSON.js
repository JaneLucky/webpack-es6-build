//加载json文件
function LoadJSON(_rootPath,_path, callback) {
  var test;
  if (XMLHttpRequest) {
    test = new XMLHttpRequest();
  } else if (ActiveXObject) {
    test = new ActiveXObject();
  } else {
    alert("请升级至最新版本的浏览器");
  }
  if (test != null) {
    // test.open("GET", "info.json", true);
    let url = _rootPath + _path + '?timestamp=' + new Date().getTime()
    test.open("GET", url, true);
    test.send(null)
    test.onreadystatechange = function() {
      if (test.readyState == 4 && test.status == 200) {
        if(test.responseText.includes('</html>', 0) && test.responseText.includes('</body>', 0) && test.responseText.includes('</head>', 0)){
          callback(null);
        }else{
          callback(test.responseText);
        }
      }
    },
    test.onloadend = function(){
      if (test.readyState == 4 && test.status == 404 && test.status == 502) {
        callback(null);
      }
    } 
  }
}