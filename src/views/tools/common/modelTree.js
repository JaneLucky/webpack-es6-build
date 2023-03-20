import {
	LoadZipJson
} from "@/utils/LoadJSON.js"
// import {
// 	GetModelNameWithUrl
// } from "@/api/ModelShare.js"
export function ModelTree(bimEngine) {
	let paths = bimEngine.ModelPaths;
	let key = 0;

	let allmodels = bimEngine.scene.children.map(x => {
		return {
			relativePath: x.relativePath,
			ElementInfos: x.ElementInfos == null ? null : x.ElementInfos.map(o => {
				return {
					name:GetTwoCharCenterStr(o.name).toString().replace(" ","")
				}
			})
		}
	});  
	for (var path of paths) {
		TreeRename(path)
	}
	
	function GetTwoCharCenterStr(str, hasStart = false, hasEnd = false) {
		// let matchReg = /(?<=\]\[).*?(?=\])/g
		// if (hasStart && hasEnd) {
		// 	matchReg = /\]\[.*?\]/g
		// } else if (hasStart && !hasEnd) {
		// 	matchReg = /\]\[.*?(?=\])/g
		// } else if (!hasStart && hasEnd) {
		// 	matchReg = /(?<=\]\[).*?\]/g
		// }
		// return str.match(matchReg)
  	return (str.split("][")[1]).split("]")[0]
	} 
	
	function TreeRename(path) {
		LoadZipJson("file/" + path + "/modelTreeMapping.zip", res => {
			let trees = JSON.parse(res);
			let childnodes = ArrayFlagKey([{
				Isleaf: false,
				children: trees
			}], path)

			var data = {
				modelDatas: allmodels,
				treeDatas: childnodes
			}
			if (bimEngine.treeData == null) {
				bimEngine.treeData = [];
			}
			let treedata = {
				Name: path,
				Isleaf: false,
				children: trees,
				path: path,
				key: key++
			}
			bimEngine.treeData.push(treedata);
 

			// GetModelNameWithUrl(path).then(res => {
				 
			// 	let index = bimEngine.treeData.findIndex(o => o.Name == path);
			// 	if (index != -1) {
			// 		bimEngine.treeData[index].Name = res.data.list[0];
			// 	}
			// 	// if (treedata.Name == null || treedata.Name == "") {
			// 	// 	treedata.Name = path;
			// 	// }
			// })
			worker(data);
			//去匹配名字 
		})
	}

	function worker(data) {
		console.log(new Date().getMinutes() + ":"+ new Date().getSeconds(), "构件树映射开始:", data.treeDatas.length)
		bimEngine.treeMapper = bimEngine.treeMapper?bimEngine.treeMapper:[];
		let count = 0;
		var worker = new Worker('static/js/modeltree.worker.js');
		worker.postMessage(data); //将复杂计算交给子线程,可以理解为给参数让子线程去操作。
		worker.onmessage = function(e) {
			//返回数据进行处理
			let back = e.data;
			delete back.ModelId;
			bimEngine.treeMapper.push(back)
			count++;
			if (count == data.treeDatas.length) {
				console.log(new Date().getMinutes() + ":"+ new Date().getSeconds(), "构件树映射完成")
				worker.terminate()
			}

		}
		worker.onerror = function(event) {
			worker.terminate()
		}
	}

	function ArrayFlagKey(array, path) {
		let bckArr = []
		function TreeDiGui(array, name) {
			if (!array || !array.length) return;
			for (let i = 0; i < array.length; i++) {
				if(array[i].Isleaf){
					array[i].key = key++
					array[i].path = path
					array[i].T_Name = name;
					bckArr.push(array[i])
				}else{
					array[i].key = key++
					array[i].path = path
					TreeDiGui(array[i].children, array[i].Name)
				}
			}
		}
		TreeDiGui(array, '')
		return bckArr
	}

	//获取子节点
	function GetChildrenNodes(pnode, isleaf) {
		let childs = [];
		let nodes = pnode.children;
		if (isleaf) {
			if (pnode.Isleaf) {
				childs.push(pnode)
			}
		} else {
			childs.push(pnode)
		}
		if (nodes != null && nodes.length > 0) {
			for (let node of nodes) {
				if (isleaf) {
					if (node.Isleaf) {
						node.T_Name = pnode.Name;
						// node.L_Name = pnode.Name;
						childs.push(node);
					} else {
						let cs_ = GetChildrenNodes(node, isleaf);
						cs_.forEach(o => {
							childs.push(o);
						})

					}
				} else {
					let cs = GetChildrenNodes(node, isleaf);
					cs.forEach(o => {
						childs.push(o);
					})
				}
			}
		}
		return childs;
	}


	function work(e) {
		let workerDatas = e;
		let modelDatas = workerDatas.modelDatas;
		let treeDatas = workerDatas.treeDatas;
		for (let j = 0; j < treeDatas.length; j++) {
			for (let i = 0; i < modelDatas.length; i++) {
				if (modelDatas[i].basePath == null) {
					continue;
				}
				if (treeDatas[j].ModelId.findIndex(x => x.length != 2) == -1) {
					//匹配完了,就退出;
					break;
				}
				if (modelDatas[i].basePath.indexOf(treeDatas[j].path) != -1) {
					mapperModel(modelDatas[i], treeDatas[j], i);
				}
			}
		}
		//查询映射关系
		function mapperModel(model, node, i) {
			for (let jj = 0; jj < node.ModelId.length; jj++) {
				for (let k = 0; k < model.ElementInfos.length; k++) {
					const modelinfo = model.ElementInfos[k];
					const id = node.ModelId[jj];
					if (modelinfo.name.includes(id)) {
						node.ModelId[jj] = [i, k];
						break;
					}
				}
			}
		}

	}
}
