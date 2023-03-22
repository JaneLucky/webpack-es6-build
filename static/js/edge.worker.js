importScripts('./../three/three.js');
self.onmessage = function(e) {
	let rootmodels = e.data
	let backList = []
	for (let i = 0; i < rootmodels.length; i++) {
		let item = {
			TypeName: rootmodels[i].TypeName,
			indexes: rootmodels[i].indexes,
			EdgeList:[]
		}
		
		let matrix = new THREE.Matrix4();
		matrix.elements = rootmodels[i].matrix;
		
		let geometry = new THREE.BufferGeometry();
		let vertices = new Float32Array(rootmodels[i].geometry);
		geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
		if(rootmodels[i].indexA){
			let indexArray = new Uint32Array(rootmodels[i].indexA)
			geometry.setIndex(new THREE.BufferAttribute( indexArray, 1 ))
		}else if(rootmodels[i].position && rootmodels[i].rotation){
			let euler = new THREE.Euler(rootmodels[i].rotation.x, rootmodels[i].rotation.y, rootmodels[i].rotation.z, rootmodels[i].rotation.order);
			matrix.makeRotationFromEuler(euler);
			matrix.setPosition(new THREE.Vector3(  rootmodels[i].position.x,  rootmodels[i].position.y,  rootmodels[i].position.z ))
		}

		var edges = new THREE.EdgesGeometry(geometry, 89); //大于89度才添加线条 
		var ps = edges.attributes.position.array;
		let positions = []
		// console.log('11')
		for (var ii = 0; ii < ps.length; ii = ii + 3) {
			let point = new THREE.Vector3(ps[ii],ps[ii+1],ps[ii+2]);
			let newpoint = point.clone().applyMatrix4(matrix.clone());
			positions.push(newpoint.x);
			positions.push(newpoint.y);
			positions.push(newpoint.z);
		}
		item.EdgeList = positions
		backList.push(item)
	}	
	// console.log(backList)
	self.postMessage(backList); //把计算结果传回给主线程
	rootmodels = []
	self.close()
}
self.onerror = function(event) {
	self.close()
}
