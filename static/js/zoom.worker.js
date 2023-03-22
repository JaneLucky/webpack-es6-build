
// importScripts('./../three/three.js');
self.onmessage = function(e){
  let postMsg = JSON.parse(JSON.stringify(e.data))
  console.log(postMsg)
  let zoomList = []
  self.postMessage(zoomList);//把计算结果传回给主线程
}
self.onerror = function (event) {	 
  self.close() 
}