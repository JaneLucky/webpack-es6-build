import {
	GetTwoCharCenterStr
} from "@/utils/regex.js"

// 模型显隐/高亮等设置-模型加载返回的构建列表
export function HandleModelSelect(list, keyList) {
	// 高亮模型统一材质
	let color = new THREE.Color(0.375, 0.63, 1)
	const meshMaterial = new THREE.MeshBasicMaterial({
		color,
		transparent: true,
		opacity: 0.4,
		depthTest: false
	});
	const LineMaterial = new THREE.LineBasicMaterial({
		color,
		depthTest: false
	});

	let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
	let HighLightGroupList = window.bimEngine.scene.children.filter(o => o.name == "HighLightGroup");
	let HighLightGroup = HighLightGroupList[0];
	if (list && list.length) {
		let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
		for (let selectGroup of list) {
			if (selectGroup.TypeName === "InstancedMesh" || selectGroup.TypeName == "InstancedMesh-Pipe") {
				for (let select of selectGroup.children) {
					var siblingMeshs = rootmodels.filter(x => x.MeshId == select.name && selectGroup.path == x.url);
					keyList.map(item => {
						switch (item.key) {
							case 'visible':
								for (let sibling of siblingMeshs) {
									var matrixArray
									if (item.val) {
										matrixArray = sibling.cloneInstanceMatrix.slice(select.instanceId * 16,
											(select.instanceId + 1) * 16);
									} else {
										matrixArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
									}
									let matrix = new THREE.Matrix4();
									matrix.elements = matrixArray;
									sibling.setMatrixAt(select.instanceId, matrix);
									sibling.instanceMatrix.needsUpdate = true;
								}
								if (HighLightGroup) {
									for (const group of HighLightGroup.children) {
										if (select.instanceId === group.ElementInfos.dbid && select.name ===
											group.ElementInfos.name) {
											group.visible = item.val
											break;
										}
									}
								}
								break;
							case 'material':
								if (item.val) {
									const group = new THREE.Group();
									group.ElementInfos = {
										TypeName: selectGroup.TypeName,
										dbid: select.instanceId,
										name: select.name,
										basePath: select.basePath,
										relativePath: select.relativePath
									}
									for (let sibling of siblingMeshs) {
										let arr = sibling.instanceMatrix.array.slice(select.instanceId * 16, (
											select.instanceId + 1) * 16)
										let matrix = new THREE.Matrix4();
										matrix.elements = arr;

										let groupMeshLine = CreateHighLightMesh(sibling.geometry, matrix,
											meshMaterial, LineMaterial)
										let mesh = groupMeshLine.mesh
										let line = groupMeshLine.line
										group.add(mesh, line);

										HighLightGroup.add(group)
										// break
									}
									break;
								} else {
									for (const group of HighLightGroup.children) {
										if (select.instanceId === group.ElementInfos.dbid && select.name ===
											group.ElementInfos.name) {
											HighLightGroup.remove(group)
										}
									}
								}
								break;
						}
					})
				}
			} else if (selectGroup.TypeName === "Mesh" || selectGroup.TypeName === "PipeMesh") {
				if (selectGroup.children.length && selectGroup.path) {
					for (let select of selectGroup.children) {
						let hasSet = false
						for (let rootmodel of rootmodels) {
							if (selectGroup.path === rootmodel.url && rootmodel && rootmodel.material.length) {
								for (let model of rootmodel.ElementInfos) {
									if (model.name === select) {
										keyList.map(item => {
											switch (item.key) {
												case 'visible':
													rootmodel.material[model.dbid] = rootmodel
														.cloneMaterialArray[model.dbid].clone()
													rootmodel.material[model.dbid].visible = item.val
													rootmodel.cloneMaterialArray[model.dbid].visible = item.val
													if (HighLightGroup) {
														for (const group of HighLightGroup.children) {
															if (model.dbid === group.ElementInfos.dbid && model
																.name === group.ElementInfos.name) {
																group.visible = item.val
																break;
															}
														}
													}
													break;
												case 'material':
													if (item.val) {
														rootmodel.material[model.dbid] = rootmodel
															.cloneMaterialArray[model.dbid].clone()
														// 重新创建透明高亮模型
														let meshSelect = rootmodel.meshs[model.dbid]
														const group = new THREE.Group();
														group.ElementInfos = {
															TypeName: selectGroup.TypeName,
															dbid: model.dbid,
															name: model.name,
															basePath: model.basePath,
															relativePath: model.relativePath
														}
														let groupMeshLine = CreateHighLightMesh(meshSelect
															.geometry, meshSelect.matrix, meshMaterial,
															LineMaterial)
														let mesh = groupMeshLine.mesh
														let line = groupMeshLine.line

														let rotationX = isNaN(meshSelect.rotation.x) ? 0 :
															meshSelect.rotation.x
														let rotationY = isNaN(meshSelect.rotation.y) ? 0 :
															meshSelect.rotation.y
														let rotationZ = isNaN(meshSelect.rotation.z) ? 0 :
															meshSelect.rotation.z
														let positionX = isNaN(meshSelect.position.x) ? 0 :
															meshSelect.position.x
														let positionY = isNaN(meshSelect.position.y) ? 0 :
															meshSelect.position.y
														let positionZ = isNaN(meshSelect.position.z) ? 0 :
															meshSelect.position.z
														if (!(rotationX == 0 && rotationY == 0 && rotationZ ==
																0)) {
															line.rotation._order = "YXZ"
															mesh.rotation.set(rotationX, rotationY, rotationZ);
															line.rotation.set(rotationX, rotationY, rotationZ);
														}
														if (!(positionX == 0 && positionY == 0 && positionZ ==
																0)) {
															mesh.position.set(positionX, positionY, positionZ);
															line.position.set(positionX, positionY, positionZ);
														}

														group.add(mesh, line);
														HighLightGroup.add(group)
														break;
													} else {
														for (const group of HighLightGroup.children) {
															if (model.dbid === group.ElementInfos.dbid && model
																.name === group.ElementInfos.name) {
																HighLightGroup.remove(group)
															}
														}
													}
													break;
											}
										})
										// hasSet = true
										// break;
									}
								}
								hasSet = true
							}
							if (hasSet) {
								break;
							}
						}
					}
				}
			}
		}
	} else {
		for (let rootmodel of rootmodels) {
			if (rootmodel.TypeName === "InstancedMesh" || rootmodel.TypeName === "InstancedMesh-Pipe") {
				// console.log(rootmodel)
				keyList.map(item => {
					switch (item.key) {
						case 'visible':
							var matrixArray = [];
							let array32
							if (item.val) {
								array32 = new Float32Array(rootmodel.cloneInstanceMatrix)
							} else {
								matrixArray = Array.from(rootmodel.instanceMatrix.array);
								for (let i = 0; i < matrixArray.length; i++) {
									matrixArray[i] = 0
								}
								array32 = new Float32Array(matrixArray)
							}
							rootmodel.instanceMatrix.array = new Float32Array(array32);
							rootmodel.instanceMatrix.needsUpdate = true;
							break;
						case 'material':
							// let material
							// if(item.val){
							//   material = item.val.clone()
							//   material.clippingPlanes = rootmodel.material[model.dbid].clippingPlanes
							// }
							// rootmodel.material[model.dbid] = material?material:rootmodel.cloneMaterialArray[model.dbid];
							break;
					}
				})

			} else if (rootmodel.TypeName === "Mesh" || rootmodel.TypeName === "PipeMesh") {
				for (let model of rootmodel.ElementInfos) {
					keyList.map(item => {
						switch (item.key) {
							case 'visible':
								rootmodel.material[model.dbid].visible = item.val
								rootmodel.cloneMaterialArray[model.dbid].visible = item.val
								break;
							case 'material':
								let material
								if (item.val) {
									material = item.val.clone()
									material.clippingPlanes = rootmodel.material[model.dbid].clippingPlanes
								}
								rootmodel.material[model.dbid] = material ? material : rootmodel
									.cloneMaterialArray[model.dbid];
								break;
						}
					})
				}
			}
		}
		//显隐自创的高亮模型
		if (HighLightGroup) {
			keyList.map(item => {
				switch (item.key) {
					case 'visible':
						if (HighLightGroup) {
							for (const group of HighLightGroup.children) {
								group.visible = item.val
							}
						}
						break;
					case 'material':
						break;
				}
			})
		}
	}
}

//获得当前选中的单个构建的信息
export function getModelInfoClick(select) {
	let rootmodels = window.bimEngine.scene.children;
	let selectModelList = [];
	//清除上次模型树-选中样式
	if (select && select.name) {
		if (select.TypeName === "InstancedMesh" || select.TypeName === "InstancedMesh-Pipe") {
			let rootmodel = rootmodels[select.indexs[0]]
			let currentModel = {
				material: null,
				meshMaterial: null,
				cloneMaterial: null,
				modelType: null
			}
			currentModel.meshMaterial = rootmodel.material
			currentModel.cloneMaterial = rootmodel.cloneMaterialArray
			currentModel.modelType = "InstancedMesh"
			selectModelList.push(currentModel)
		} else if (select.TypeName === "Mesh" || select.TypeName === "PipeMesh") {
			let rootmodel = rootmodels[select.indexs[0]]
			let currentModel = {
				material: null,
				meshMaterial: null,
				cloneMaterial: null,
				modelType: null
			}
			currentModel.material = rootmodel.material[select.indexs[1]]
			currentModel.meshMaterial = rootmodel.meshs[select.indexs[1]].material
			currentModel.cloneMaterial = rootmodel.cloneMaterialArray[select.indexs[1]] //改变当前选中的构建
			currentModel.cloneMaterialArray = rootmodel.cloneMaterialArray //改变当前选中的构建,
			currentModel.modelType = "Mesh"
			selectModelList.push(currentModel)
		}
	}
	return selectModelList
}

export function HandleRequestModelSelect_(list, visible) {
	let HighLightGroupList = window.bimEngine.scene.children.filter(o => o.name == "HighLightGroup");
	let HighLightGroup = HighLightGroupList[0];
	let models = window.bimEngine.scene.children;


	for (let i = 0; i < list.length; i++) {
		let model = models[list[i][0]];
		if (model == null) {
			continue
		}
		if (model.instanceMatrix == null && model.geometry != null && model.geometry.groups[list[i][1]] != null) {
			//普通模型
			model.geometry.groups[list[i][1]].visibility = visible;
			handleHighlightModels(list[i], visible);
			if(visible==true){
				model.visible = true;
			}
		} else if (model.instanceMatrix != null) {
			if (visible == true) {
				//显示
				var matrixArray = model.cloneInstanceMatrix.slice(list[i][1] * 16, (
					list[i][1] + 1) * 16);
				let matrix = new THREE.Matrix4();
				matrix.elements = matrixArray;
				model.setMatrixAt(list[i][1], matrix);
				model.instanceMatrix.needsUpdate = true;
				model.visible = true;
			} else {
				//隐藏 
				let matrix = new THREE.Matrix4();
				matrix = matrix.clone().makeScale(0, 0, 0);
				model.setMatrixAt(list[i][1], matrix);
				model.instanceMatrix.needsUpdate = true;
			}
			handleHighlightModels(list[i], visible)
		}
	}
	handleEdgeModels(list, visible)
	
	// 处理边线的得模型显隐
	function handleEdgeModels(list, visible) {
		// debugger
		let ModelEdgesList = window.bimEngine.scene.children.filter(o => o.name == "ModelEdges" && o.visible);
		if(ModelEdgesList && ModelEdgesList.length){
			let groupList = []
			for(let k=0;k<list.length;k++){
				let index = groupList.findIndex(item=>item.index === list[k][0])
				if(index < 0){
					let group = {
						index: list[k][0],
						children: [list[k][1]]
					}
					groupList.push(group)
				}else{
					groupList[index].children.push(list[k][1])
				}
			}
			for (let i = 0; i < groupList.length; i++) {
				let ModelEdge = ModelEdgesList.filter(item=>item.indexO == groupList[i].index)[0]
				if(ModelEdge){
					let ModelEdgesChild = ModelEdge.ElementInfos.children
					if(ModelEdgesChild && ModelEdgesChild.length){
						let positions = Array.from(ModelEdge.geometry.getAttribute('position').array)
						for (let j = 0; j < groupList[i].children.length; j++) {
							let Edge = ModelEdge.ElementInfos.children.filter(item=>item.index == groupList[i].children[j])[0]
							let addPos = visible?Edge.EdgeList:new Array(Edge.EdgeList.length).fill(0)
							Array.prototype.splice.apply(positions, [Edge.startIndex, Edge.EdgeList.length].concat(addPos));
						}
						ModelEdge.geometry.setAttribute(
							'position',
							new THREE.Float32BufferAttribute(positions, 3)
						)

					}
				}
				
			}
		}
	}

	// 处理用于亮显得模型显隐
	function handleHighlightModels(indexes, visible) {
		if (HighLightGroup) {
			for (const group of HighLightGroup.children) {
				if (group.indexs.toString() === indexes.toString()) {
					group.visible = visible
					break;
				}
			}
		}
		
	}
	window.bimEngine.RenderUpdata();
}


// 模型亮显
export function HandleHighlightModelSelect_(list, highlight) {
	let color = new THREE.Color(0.375, 0.63, 1)
	const meshMaterial = new THREE.MeshBasicMaterial({
		color,
		transparent: true,
		opacity: 0.9,
		depthTest: false
	});
	const LineMaterial = new THREE.LineBasicMaterial({
		color,
		depthTest: false
	});
	let HighLightGroupList = window.bimEngine.scene.children.filter(o => o.name == "HighLightGroup");
	let HighLightGroup = HighLightGroupList[0];
	HighLightGroup.children = []
	let models = window.bimEngine.scene.children;
	// window.bimEngine.treeMapper.map(item=>{
	// 	list = item.ModelIds?[...list, ...item.ModelIds]:list
	// })

	for (let i = 0; i < list.length; i++) {
		let model = models[list[i][0]];
		if (model == null) {
			continue
		}
		if (model.instanceMatrix == null && model.geometry != null && model.geometry.groups[list[i][1]] !=
			null) { // 普通模型
			if (highlight) {
				let meshSelect = model.meshs[list[i][1]]
				const group = new THREE.Group();
				group.indexs = list[i]
				let groupMeshLine = CreateHighLightMesh(meshSelect.geometry, meshSelect.matrix, meshMaterial,
					LineMaterial)
				let mesh = groupMeshLine.mesh
				// let line = groupMeshLine.line

				let rotationX = isNaN(meshSelect.rotation.x) ? 0 :
					meshSelect.rotation.x
				let rotationY = isNaN(meshSelect.rotation.y) ? 0 :
					meshSelect.rotation.y
				let rotationZ = isNaN(meshSelect.rotation.z) ? 0 :
					meshSelect.rotation.z
				let positionX = isNaN(meshSelect.position.x) ? 0 :
					meshSelect.position.x
				let positionY = isNaN(meshSelect.position.y) ? 0 :
					meshSelect.position.y
				let positionZ = isNaN(meshSelect.position.z) ? 0 :
					meshSelect.position.z
				if (!(rotationX == 0 && rotationY == 0 && rotationZ ==
						0)) {
					// line.rotation._order = "YXZ"
					mesh.rotation.set(rotationX, rotationY, rotationZ);
					// line.rotation.set(rotationX, rotationY, rotationZ);
				}
				if (!(positionX == 0 && positionY == 0 && positionZ ==
						0)) {
					mesh.position.set(positionX, positionY, positionZ);
					// line.position.set(positionX, positionY, positionZ);
				}
				mesh.material.clippingPlanes =  model.material[list[i][1]].clippingPlanes
				group.add(mesh);
				HighLightGroup.add(group)
			} else {
				for (const group of HighLightGroup.children) {
					if (group.indexs == list[i]) {
						HighLightGroup.remove(group)
					}
				}
			}
		} else if (model.instanceMatrix != null) { // instanceMesh合并模型
			if (highlight == true) {
				const group = new THREE.Group();
				group.indexs = list[i]
				var matrixArray = model.cloneInstanceMatrix.slice(list[i][1] * 16, (list[i][1] + 1) * 16);
				let matrix = new THREE.Matrix4();
				matrix.elements = matrixArray;
				let groupMeshLine = CreateHighLightMesh(model.geometry, matrix,
					meshMaterial, LineMaterial)
				let mesh = groupMeshLine.mesh
				// let line = groupMeshLine.line
				mesh.material.clippingPlanes = model.material.clippingPlanes
				group.add(mesh);
				HighLightGroup.add(group)
			} else {
				for (const group of HighLightGroup.children) {
					if (group.indexs == list[i]) {
						HighLightGroup.remove(group)
					}
				}
			}
		}
	}
	window.bimEngine.RenderUpdata();
}

//模型显隐/高亮设置-调用接口返回的构建列表
export function HandleRequestModelSelect(list, keyList) {
	if (list && list.length) {
		let rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
		for (let group of list) {
			var siblingMeshs = rootmodels.filter(x => x.basePath.indexOf(group.path) != -1);
			for (let itemName of group.children) {
				let hasSet = false
				for (let sibling of siblingMeshs) {
					for (let model of sibling.ElementInfos) {
						const namestr = GetTwoCharCenterStr(model.name)[0];
						if (namestr === itemName) {
							if (sibling.TypeName === "InstancedMesh" || sibling.TypeName === "InstancedMesh-Pipe") {
								keyList.map(item => {
									switch (item.key) {
										case 'visible':
											var matrixArray = [];
											matrixArray = sibling.instanceMatrix.array.slice(model.dbid * 16, (
												model.dbid + 1) * 16);

											let matrix = new THREE.Matrix4();
											matrix.elements = matrixArray;
											matrix.elements[0] = item.val ? 1 : 0
											matrix.elements[5] = item.val ? 1 : 0
											matrix.elements[10] = item.val ? 1 : 0
											sibling.setMatrixAt(model.dbid, matrix);
											sibling.instanceMatrix.needsUpdate = true;
											break;
										case 'material':
											let color
											if (item.val) {
												color = new THREE.Color(0.375, 0.63, 1)
											} else {
												color = new THREE.Color(1, 1, 1)
											}
											if (model.dbid) {
												sibling.getColorAt(model.dbid, window.color);
												sibling.setColorAt(model.dbid, color);
												sibling.instanceColor.needsUpdate = true;
											} else {
												for (let i = 0; i < sibling.material.length; i++) {
													sibling.material[i].color = new THREE.Color(1, 1, 1);
												}
											}
											break;
									}
								})
							} else if (sibling.TypeName === "Mesh" || sibling.TypeName === "PipeMesh") {
								if (model.dbid && sibling.material[model.dbid]) {
									keyList.map(item => {
										switch (item.key) {
											case 'visible':
												sibling.material[model.dbid].visible = item.val
												sibling.cloneMaterialArray[model.dbid].visible = item.val
												break;
											case 'material':
												let material
												if (item.val) {
													material = item.val.clone()
													material.clippingPlanes = sibling.material[model.dbid]
														.clippingPlanes
												}
												sibling.material[model.dbid] = material ? material : sibling
													.cloneMaterialArray[model.dbid];
												break;
										}
									})
								}
							}
							hasSet = true
							break
						}
					}
					if (hasSet) {
						break
					}
				}
			}
		}
	}
}

export function CreateHighLightMesh(geometry, matrix, meshMaterial, LineMaterial) {
	const mesh = new THREE.Mesh(geometry, meshMaterial);
	mesh.applyMatrix4(matrix);
	// const edges = new THREE.EdgesGeometry(geometry, 89); //大于89度才添加线条 ,减少线条绘制
	// const line = new THREE.LineSegments(edges, LineMaterial);
	// line.applyMatrix4(matrix);
	mesh.TypeName = "HighLightGroup-MeshLine"
	// line.TypeName = "HighLightGroup-MeshLine"
	return {
		mesh,
		// line
	}
}
