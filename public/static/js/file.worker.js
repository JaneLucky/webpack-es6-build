
importScripts('three.js');
self.onmessage = function(e){
  let rootmodels = JSON.parse(JSON.stringify(e.data))
  for(let i=0; i<rootmodels.length;i++){
    for(let j=0;j<rootmodels[i].ElementInfos.length;j++){
      //计算边线-并存储，用于测量捕捉
      let geometry = new THREE.BufferGeometry();
      let vertices = new Float32Array(rootmodels[i].ElementInfos[j].geometry);
      geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
      let indexArray = new Uint32Array(rootmodels[i].ElementInfos[j].indexA)
      geometry.setIndex(new THREE.BufferAttribute( indexArray, 1 ))

      var edges = new THREE.EdgesGeometry(geometry, 89); //大于89度才添加线条 
      var ps = edges.attributes.position.array;
      let matrix = new THREE.Matrix4();
      matrix.elements = rootmodels[i].ElementInfos[j].matrix;
      let positions = []
      for (var ii = 0; ii < ps.length; ii = ii + 3) {
        let point = new THREE.Vector3(ps[ii],ps[ii+1],ps[ii+2]);
        let newpoint = point.clone().applyMatrix4(matrix.clone());
        positions.push(newpoint.x);
        positions.push(newpoint.y);
        positions.push(newpoint.z);
      }
      rootmodels[i].ElementInfos[j].EdgeList = positions
    }
  }
  self.postMessage(rootmodels);//把计算结果传回给主线程
}
self.onerror = function (event) {	 
  self.close() 
}