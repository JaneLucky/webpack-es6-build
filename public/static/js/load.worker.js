
importScripts('/static/js/three.js');
importScripts('/static/js/LoadJSON.js');
importScripts('/static/js/DRACOLoader.js');
importScripts('/static/js/GLTFLoader.js');
    
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
dracoLoader.preload()
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);


function LoadGLB(rootPath, relativePath, fullPath, type, option, callback) {
	loader.load(fullPath, (gltf) => {
		var models = gltf.scene.children;
    let meshList = []
		let meshParamList = []
		for (let model of models) {
			if (model.type === "Group") {
				if (model.children && model.children.length) {
					for (let i = 0; i < model.children.length; i++) {
						let child = model.children[i];
						child.userData = model.userData
						child.IsMerge = true;
						child.MergeCount = model.children.length;
						child.MergeIndex = i;
						child.MergeName = model.name;
						meshList.push(child)
					}
				}
			} else if (model.type === "Mesh") {
				model.IsMerge = false;
				model.MergeIndex = 0;
				model.MergeCount = 1;
				model.MergeName = model.name;
				meshList.push(model)
			}
		}
		if (!meshList.length) {
			callback([])
			return
		}
		// console.log(option)
		// console.log(meshList)
		if (option && option.name === 'modelList'){
			for (let meshItem of meshList) {
				//位移
				if (option.option != null && option.option.Point != null) {
					if (!(option.option.Point.X == 0 && option.option.Point.Y == 0 && option.option.Point.Z == 0)) {
						//平移 
						meshItem.matrix.elements[12] = option.option.Point.X * 0.3048;
						meshItem.matrix.elements[13] = option.option.Point.Z * 0.3048;
						meshItem.matrix.elements[14] = -option.option.Point.Y * 0.3048;
						//旋转
						meshItem.rotation.y = option.option.angle_a
					}
				}
				let mesh = {
					geometry:{
						attributes:{
							normal: {
								array: [...meshItem.geometry.attributes.normal.array],
								itemSize: meshItem.geometry.attributes.normal.itemSize
							},
							position: {
								array: [...meshItem.geometry.attributes.position.array],
								itemSize: meshItem.geometry.attributes.position.itemSize
							},
							uv: {
								array: [...meshItem.geometry.attributes.uv.array],
								itemSize: meshItem.geometry.attributes.uv.itemSize
							}
						},
						boundingBox:meshItem.geometry.boundingBox,
						boundingSphere:meshItem.geometry.boundingSphere,
						index: {
							array: [...meshItem.geometry.index.array],
							itemSize: meshItem.geometry.index.itemSize
						}
					},
					material:meshItem.material,
					matrix: meshItem.matrix,
					name: meshItem.name,
					type: meshItem.type,
					userData: meshItem.userData,
					IsMerge: meshItem.IsMerge,
					MergeIndex: meshItem.MergeIndex,
					MergeCount: meshItem.MergeCount,
					MergeName: meshItem.MergeName
				}
				meshParamList.push(mesh)
			}
		} else if (option && option.name === 'instanceList') {
			for (let item of option.option.children) {
				for (let i=0;i<meshList.length;i++) {
					if (item.meshId === meshList[i].userData.name) {
						for (var j = 0; j < item.children.length; j++) {
							let meshItem = meshList[i].clone()
							let child = item.children[j];
							//位移
							if (child != null && child.Point != null) {
								if (!(child.Point.X == 0 && child.Point.Y == 0 && child.Point.Z == 0)) {
									//平移 
									meshItem.matrix.elements[12] = child.Point.X * 0.3048;
									meshItem.matrix.elements[13] = child.Point.Z * 0.3048;
									meshItem.matrix.elements[14] = -child.Point.Y * 0.3048;
									//旋转
									meshItem.rotation.y = child.angle_a
								}
							}
							let mesh = {
								geometry:{
									attributes:{
										normal: {
											array: [...meshItem.geometry.attributes.normal.array],
											itemSize: meshItem.geometry.attributes.normal.itemSize
										},
										position: {
											array: [...meshItem.geometry.attributes.position.array],
											itemSize: meshItem.geometry.attributes.position.itemSize
										},
										uv: {
											array: [...meshItem.geometry.attributes.uv.array],
											itemSize: meshItem.geometry.attributes.uv.itemSize
										}
									},
									boundingBox:meshItem.geometry.boundingBox,
									boundingSphere:meshItem.geometry.boundingSphere,
									index: {
										array: [...meshItem.geometry.index.array],
										itemSize: meshItem.geometry.index.itemSize
									}
								},
								material:meshItem.material,
								matrix: meshItem.matrix,
								name: meshItem.name,
								type: meshItem.type,
								userData: meshItem.userData,
								IsMerge: meshItem.IsMerge,
								MergeIndex: meshItem.MergeIndex,
								MergeCount: meshItem.MergeCount,
								MergeName: meshItem.MergeName
							}
							meshParamList.push(mesh)
						}
					}
				}
			}
		}
		// console.log(meshParamList)
		callback(meshParamList)
	}, (xhr) => {
		// console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
	}, (error) => {
		callback(error)
	})
}



self.onmessage = function(e){
  let param = JSON.parse(JSON.stringify(e.data))
  let rootPath = param.rootPath
  let relativePath = param.relativePath
  let type = param.type
  
  // console.log(param)
  let loadCompleteSize = 0
  
	LoadJSON(rootPath,relativePath+'/modelList.json', res => {
		let glbList = JSON.parse(res)
		let currentIndex = 0;
		let loadsAll = async () => {
			let getGLB = item => {
				return new Promise((resolve, reject) => {
					LoadGLB(rootPath, relativePath, item.fullPath, type, {
						name: 'modelList',
						option: item
					}, meshList => {
						currentIndex = currentIndex + 1;
            let param = {
              flag:'modelLoad',
              ...item,
              meshList
            }
            self.postMessage(param); // 模型请求完成，去主线程呈现
						if (currentIndex == 1) { // 一个模型加载完成
							// window.bimEngine.ViewCube.cameraGoHome();
              self.postMessage({
                flag:'oneModelLoad',
              });
						}
						if (currentIndex == glbList.length) { // 全部加载完成
							loadCompleteSize = loadCompleteSize+1
							AllModelLoadComplated()
						}
						resolve();
					})
				});
			};
			//for循环调接口
			for (let i = 0; i < glbList.length; i++) {
				glbList[i].fullPath = rootPath + relativePath+ "/" + glbList[i].category + '.glb'
				const result = await getGLB(glbList[i]);
			}
		};
		loadsAll()
	})

  
  
	LoadJSON(rootPath,relativePath+'/instanceList.json', res => {
		let glbList = JSON.parse(res)
		let currentIndex = 0;
		let loadsAll = async () => {
			let getGLB = item => {
				return new Promise((resolve, reject) => {
					LoadGLB(rootPath, relativePath, item.fullPath, type, {
						name: 'instanceList',
						option: item
					}, meshList => {
						currentIndex = currentIndex + 1;
            let param = {
              flag:'modelLoad',
              ...item,
              meshList
            }
            self.postMessage(param); // 模型请求完成，去主线程呈现
						if (currentIndex == 1) { // 一个模型加载完成
							// window.bimEngine.ViewCube.cameraGoHome();
              self.postMessage({
                flag:'oneModelLoad',
              });
						}
						if (currentIndex == glbList.length) { // 全部加载完成
							loadCompleteSize = loadCompleteSize+1
							AllModelLoadComplated()
						}
						resolve();
					})
				});
			};
			//for循环调接口
			for (let i = 0; i < glbList.length; i++) {
				glbList[i].fullPath = rootPath + relativePath+ "/" + glbList[i].category + '.glb'
				const result = await getGLB(glbList[i]);
			}
		};
		loadsAll()
	})

	function AllModelLoadComplated(){
		if(loadCompleteSize === 2){
			console.log('allModelLoad')
			self.postMessage({
				flag:'allModelLoad',
			});
		}
	}

}
self.onerror = function (event) {	 
  console.log([
    'ERROR: Line ', event.lineno, ' in ', event.filename, ': ', event.message
  ].join(''));
  // self.close() 
}