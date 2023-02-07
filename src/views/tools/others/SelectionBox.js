const THREE = require('three')
import '@/three/interactive/SelectionBox.js';
import '@/three/interactive/SelectionHelper.js';
import "../style/selectBox.scss"
export function selectBox(bimengine) {
	var _selectBox = new Object();
	var scene = bimengine.scene;
	var camera = bimengine.scene.camera;
	var renderer = bimengine.scene.renderer;
	var controls = bimengine.scene.controls;
	let helper, selectionBox, rootmodels = [];
	//激活
	_selectBox.Active = function() {
		rootmodels = scene.children.filter(o => o.name == "rootModel" && o.type == "Mesh");
		for (let rootmodel of rootmodels) {
			for (let model of rootmodel.ElementInfos) {
				//屏幕坐标
				let screenCenter = model.center.clone()
				let vector = screenCenter.project(camera);
				let halfWidth = scene.renderer.domElement.clientWidth / 2,
					halfHeight = scene.renderer.domElement.clientHeight / 2;
				let screenPosition = {
					x: Math.round(vector.x * halfWidth + halfWidth),
					y: Math.round(-vector.y * halfHeight + halfHeight)
				}
				model.screenPosition = screenPosition
			}
		}
		helper = new THREE.SelectionHelper(renderer, 'selectBox');
		selectionBox = resetSelectionBox()
		controls.enabled = false
		window.addEventListener('pointerdown', onPointerDown, false);
	
		window.addEventListener('pointermove', onPointerMove, false);
	
		window.addEventListener('pointerup', onPointerUp, false);
	}
	_selectBox.DisActive = function() {
		controls.enabled = true
		window.removeEventListener('pointerdown', onPointerDown);
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
		helper && (helper.element = null, helper = null)
	}



	function onPointerDown(event) {
		selectionBox = resetSelectionBox()
		selectionBox.startPoint = {
			x:event.clientX,
			y:event.clientY
		}
	}

	function onPointerMove(event) {
		if (helper.isDown) {
			selectionBox.endPoint = {
				x:event.clientX,
				y:event.clientY
			}
			if (Math.abs(selectionBox.endPoint.x - selectionBox.startPoint.x) > 10 && Math.abs(selectionBox.endPoint.y - selectionBox.startPoint.y) > 10) { 
				getSelect()
			}
		}
	}

	function onPointerUp(event) {
		selectionBox.endPoint = {
			x:event.clientX,
			y:event.clientY
		}
		getSelect(true)
	}

	//重置SelectionBox
	function resetSelectionBox() {
		return {
			startPoint: null,
			endPoint: null
		}
	}

	//获得选中的构建
	function getSelect(saveForSelect = false){
		if(selectionBox.startPoint && selectionBox.endPoint){
			let startPoint,endPoint;
			if(selectionBox.startPoint.y<= selectionBox.endPoint.y){
				startPoint = selectionBox.startPoint
				endPoint = selectionBox.endPoint
			}else{
				startPoint = selectionBox.endPoint
				endPoint = selectionBox.startPoint
			}
			if(!saveForSelect){
				for (let rootmodel of rootmodels) {
					if(rootmodel.TypeName === "InstancedMesh"){
						for (let model of rootmodel.ElementInfos) {
							if(model.screenPosition.x >= startPoint.x && model.screenPosition.y >= startPoint.y && 
								model.screenPosition.x <= endPoint.x && model.screenPosition.y <= endPoint.y){
									let matrix = new THREE.Color(0.375, 0.63, 1)
									rootmodel.setColorAt(model.dbid, matrix);
									rootmodel.instanceColor.needsUpdate = true;
							}else{
								let matrix = new THREE.Color(1, 1, 1)
								rootmodel.setColorAt(model.dbid, matrix);
								rootmodel.instanceColor.needsUpdate = true;
							}	
						}

					}else if(rootmodel.TypeName === "Mesh" || rootmodel.TypeName === "PipeMesh"){
						if (rootmodel && rootmodel.material.length) {
							for (let model of rootmodel.ElementInfos) {
								if(model.screenPosition.x >= startPoint.x && model.screenPosition.y >= startPoint.y && 
									model.screenPosition.x <= endPoint.x && model.screenPosition.y <= endPoint.y){
										rootmodel.material[model.dbid] = new THREE.MeshStandardMaterial({
											color: new THREE.Color(0.375, 0.63, 1),
											side: THREE.DoubleSide,
											clippingPlanes: rootmodel.material[model.dbid].clippingPlanes
										});
								}else{
									rootmodel.material[model.dbid] = rootmodel.cloneMaterialArray[model.dbid];
								}	
							}
						}
					}
				}
			}else{
				if(saveForSelect && Math.abs(startPoint.x - endPoint.x)>2 && Math.abs(startPoint.y - endPoint.y)>2){
					let BeforeSelection = []
					for (let rootmodel of rootmodels) {
						if(rootmodel.TypeName === "InstancedMesh"){
								for (let model of rootmodel.ElementInfos) {
									if(model.screenPosition.x >= startPoint.x && model.screenPosition.y >= startPoint.y && 
										model.screenPosition.x <= endPoint.x && model.screenPosition.y <= endPoint.y){
											let matrix = new THREE.Color(0.375, 0.63, 1)
											rootmodel.setColorAt(model.dbid, matrix);
											rootmodel.instanceColor.needsUpdate = true;
											let GroupIndex = BeforeSelection.findIndex(item => item.path === model.url.match(/\/(\S*)\//)[1])
											if (GroupIndex < 0) { //不存在
												let GroupModel = {
													path: rootmodel.url.match(/\/(\S*)\//)[1],
													TypeName: rootmodel.TypeName,
													children: [{
														instanceId: model.dbid,
														name: rootmodel.MeshId
													}]
												}
												BeforeSelection.push(GroupModel)
		
											} else { //存在
												let index = BeforeSelection[GroupIndex].children.findIndex(item =>
													item.instanceId === model.dbid && item.name === rootmodel.MeshId)
												if (index < 0) { //不存在
													BeforeSelection[GroupIndex].children.push({
														instanceId: model.dbid,
														name: rootmodel.MeshId
													})
												}
											}
									}else{
										let matrix = new THREE.Color(1, 1, 1)
										rootmodel.setColorAt(model.dbid, matrix);
										rootmodel.instanceColor.needsUpdate = true;
									}	
								}
						}else if(rootmodel.TypeName === "Mesh" || rootmodel.TypeName === "PipeMesh"){
							if (rootmodel && rootmodel.material.length) {
								for (let model of rootmodel.ElementInfos) {
									if(model.screenPosition.x >= startPoint.x && model.screenPosition.y >= startPoint.y && 
										model.screenPosition.x <= endPoint.x && model.screenPosition.y <= endPoint.y){
											rootmodel.material[model.dbid] = new THREE.MeshStandardMaterial({
												color: new THREE.Color(0.375, 0.63, 1),
												side: THREE.DoubleSide,
												clippingPlanes: rootmodel.material[model.dbid].clippingPlanes
											});
											let GroupIndex = BeforeSelection.findIndex(item=>item.path === rootmodel.url.match(/\/(\S*)\//)[1])
											if(GroupIndex < 0){//不存在
												let GroupModel = {
													path: rootmodel.url.match(/\/(\S*)\//)[1],
													children: [model.name],
													TypeName: rootmodel.TypeName
												}
												BeforeSelection.push(GroupModel)
											}else{//存在
												let index = BeforeSelection[GroupIndex].children.findIndex(item=>item === model.name)
												if(index < 0){//不存在
													BeforeSelection[GroupIndex].children.push(model.name)
												}else{//存在
													BeforeSelection[GroupIndex].children.splice(index, 1)
													if(BeforeSelection[GroupIndex].children.length === 0){
														BeforeSelection.splice(GroupIndex, 1)
													}
												}
											}
									}else{
										rootmodel.material[model.dbid] = rootmodel.cloneMaterialArray[model.dbid];
									}	
								}
							}
						}
					}
					bimEngine.Selection = BeforeSelection
					bimEngine.ResetSelectedModels("loaded", BeforeSelection)
				}
			}
		}
	}
	return _selectBox
}