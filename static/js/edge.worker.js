importScripts("./../three/three.js");
self.onmessage = function (e) {
  let rootmodels = e.data.data;
  let backList = [];
  for (let i = 0; i < rootmodels.length; i++) {
    let item = {
      TypeName: rootmodels[i].TypeName,
      indexes: rootmodels[i].indexes,
      EdgeList: []
    };

    let positions = [];
    let matrix = new THREE.Matrix4();
    matrix.elements = rootmodels[i].matrix;

    let geometry = new THREE.BufferGeometry();
    let vertices = new Float32Array(rootmodels[i].geometry);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    if (rootmodels[i].indexA) {
      let indexArray = new Uint32Array(rootmodels[i].indexA);
      geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));
    }
    let edges = new THREE.EdgesGeometry(geometry, 89);
    if (!rootmodels[i].indexA && rootmodels[i].rotation && rootmodels[i].position) {
      let euler = new THREE.Euler(
        rootmodels[i].rotation.x,
        rootmodels[i].rotation.y,
        rootmodels[i].rotation.z,
        rootmodels[i].rotation.order
      );
      matrix.makeRotationFromEuler(euler);
      matrix.setPosition(new THREE.Vector3(rootmodels[i].position.x, rootmodels[i].position.y, rootmodels[i].position.z));
    }
    edges.applyMatrix4(matrix);
    let ps = edges.attributes.position.array;
    for (let ii = 0; ii < ps.length; ii = ii + 3) {
      positions.push(Math.round(ps[ii] * 10000) / 10000);
      positions.push(Math.round(ps[ii + 1] * 10000) / 10000);
      positions.push(Math.round(ps[ii + 2] * 10000) / 10000);
    }
    item.EdgeList = positions;
    backList.push(item);
  }
  self.postMessage(backList); //把计算结果传回给主线程
  rootmodels = [];
  backList = [];
  if (e.data.lastOne) {
    self.close();
  }
};
self.onerror = function (event) {
  self.close();
};
