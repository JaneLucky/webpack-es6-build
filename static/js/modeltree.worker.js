importScripts('./../three/three.js');
self.onmessage = function(e) {
	let workerDatas = (e.data);
	let modelDatas = workerDatas.modelDatas;
	let treeDatas = workerDatas.treeDatas;
	let levelDatas = workerDatas.levelDatas;
	for (let j = 0; j < treeDatas.length; j++) {
		for (let i = 0; i < modelDatas.length; i++) {
			if (modelDatas[i].relativePath == null) {
				continue;
			}
			if (treeDatas[j].ModelId.findIndex(x => x.length != 2) == -1) {
				//匹配完了,就退出;
				break;
			}
			if (modelDatas[i].relativePath == treeDatas[j].path) {
				mapperModel(modelDatas[i], treeDatas[j], i); 
			}
		}
		// self.postMessage(treeDatas[j]); //把计算结果传回给主线程 
	}
	for (let j = 0; j < levelDatas.length; j++) {
		for (let i = 0; i < modelDatas.length; i++) {
			if (modelDatas[i].relativePath == levelDatas[j].path) {
				mapperModelLevel(modelDatas[i], levelDatas[j], i); 
			}
		}
	}
	self.postMessage({
		type:treeDatas,
		level:levelDatas
	}); //把计算结果传回给主线程 
	workerDatas = null
	modelDatas = null
	treeDatas = null
	levelDatas = null
	self.close()
	//查询映射关系
	function mapperModelLevel(model, node, i) {
		for (let jj = 0; jj < node.children.length; jj++) {
			for (let k = 0; k < model.ElementInfos.length; k++) {
				const modelinfo = model.ElementInfos[k];
				const id = node.children[jj];
				if (modelinfo.name===id) {
					if (node.ModelIds == null) {
						node.ModelIds = [];
					}
					node.ModelIds.push([i, k]);
					break
				}
			}
		}
	}
	//查询映射关系
	function mapperModel(model, node, i) {
		for (let jj = 0; jj < node.ModelId.length; jj++) {
			for (let k = 0; k < model.ElementInfos.length; k++) {
				const modelinfo = model.ElementInfos[k];
				const id = node.ModelId[jj];
				// console.log(modelinfo.name+id) 
				if (modelinfo.name===id) {
				//if (modelinfo.name.length==id.length && modelinfo.name.includes(id)) {
					if (node.ModelIds == null) {
						node.ModelIds = [];
					}
					node.ModelIds.push([i, k]);
				}
			}
		}
	}
}
self.onerror = function(event) {
	self.close()
}
