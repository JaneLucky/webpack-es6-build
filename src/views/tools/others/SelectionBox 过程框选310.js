const THREE = require('@/three/three.js')
import '@/three/interactive/SelectionBox.js';
import '@/three/interactive/SelectionHelper.js';
import { SetDeviceStyle } from "@/views/tools/style/deviceStyleSet.js"
export function selectBox(bimengine) {
  require('@/views/tools/style/'+SetDeviceStyle()+'/selectBox.scss')
	var _selectBox = new Object();
	var scene = bimengine.scene;
	var camera = bimengine.scene.camera;
	var renderer = bimengine.scene.renderer;
	var controls = bimengine.scene.controls;
	let helper, selectionBox, rootmodels = [];
	let HighLightGroup
	let start = false
	//激活
	_selectBox.Active = function() {
		rootmodels = scene.children.filter(o => o.name == "rootModel");
		let HighLightGroupList = window.bimEngine.scene.children.filter(o => o.name == "HighLightGroup");
		HighLightGroup = HighLightGroupList[0];
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
		renderer.domElement.addEventListener('pointerdown', onPointerDown, false);
	
		renderer.domElement.addEventListener('pointermove', onPointerMove, false);
	
		renderer.domElement.addEventListener('pointerup', onPointerUp, false);
	}
	_selectBox.DisActive = function() {
		controls.enabled = true
		renderer.domElement.removeEventListener('pointerdown', onPointerDown);
		renderer.domElement.removeEventListener('pointermove', onPointerMove);
		renderer.domElement.removeEventListener('pointerup', onPointerUp);
		helper && (helper.element = null, helper = null)
	}



	function onPointerDown(event) {
		if(event.button === 0){
			start = true
			bimengine.UpdateRender();
			if(HighLightGroup){
				for (const group of HighLightGroup.children) {
					HighLightGroup.children = []
				}
			}
			selectionBox = resetSelectionBox()
			selectionBox.startPoint = {
				x:event.clientX,
				y:event.clientY
			}
		}
	}

	function onPointerMove(event) {
		if(start){
			bimengine.UpdateRender();
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
	}

	function onPointerUp(event) {
		if(event.button === 0){
			bimengine.UpdateRender();
			selectionBox.endPoint = {
				x:event.clientX,
				y:event.clientY
			}
			getSelect(true)
			start = false
		}
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
			let startPoint={
				x:0,
				y:0
			}
			let endPoint={
				x:0,
				y:0
			};
			if(selectionBox.startPoint.x >= selectionBox.endPoint.x){
				startPoint.x = selectionBox.endPoint.x
				endPoint.x = selectionBox.startPoint.x
			}else{
				startPoint.x = selectionBox.startPoint.x
				endPoint.x = selectionBox.endPoint.x
			}
			if(selectionBox.startPoint.y >= selectionBox.endPoint.y){
				startPoint.y = selectionBox.endPoint.y
				endPoint.y = selectionBox.startPoint.y
			}else{
				startPoint.y = selectionBox.startPoint.y
				endPoint.y = selectionBox.endPoint.y
			}
			if(!saveForSelect){
				for (let rootmodel of rootmodels) {
					if(rootmodel.TypeName === "InstancedMesh" || rootmodel.TypeName === "InstancedMesh-Pipe"){
						for (let model of rootmodel.ElementInfos) {
							if(model.screenPosition.x >= startPoint.x && model.screenPosition.y >= startPoint.y && 
								model.screenPosition.x <= endPoint.x && model.screenPosition.y <= endPoint.y){
									let matrix = new THREE.Color(0.375, 0.63, 1)
									rootmodel.setColorAt(model.dbid, matrix);
									rootmodel.instanceColor.needsUpdate = true;
							}else{
								// let matrix = new THREE.Color(1, 1, 1)
								let matrix = new THREE.Color(rootmodel.cloneInstanceColor[model.dbid*3], rootmodel.cloneInstanceColor[model.dbid*3+1], rootmodel.cloneInstanceColor[model.dbid*3+2])
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
						if(rootmodel.TypeName === "InstancedMesh" || rootmodel.TypeName === "InstancedMesh-Pipe"){
								for (let model of rootmodel.ElementInfos) {
									if(model.screenPosition.x >= startPoint.x && model.screenPosition.y >= startPoint.y && 
										model.screenPosition.x <= endPoint.x && model.screenPosition.y <= endPoint.y){
											let matrix = new THREE.Color(0.375, 0.63, 1)
											rootmodel.setColorAt(model.dbid, matrix);
											rootmodel.instanceColor.needsUpdate = true;

											let indexes = [rootmodel.index, model.dbid]
											let GroupIndex = BeforeSelection.findIndex(item => item.toString() == indexes.toString())
											if (GroupIndex < 0) { //不存在
												BeforeSelection.push(indexes)
											} else { //存在
												BeforeSelection.splice(GroupIndex, 1)
											}
									}else{
										// let matrix = new THREE.Color(1, 1, 1)
										let matrix = new THREE.Color(rootmodel.cloneInstanceColor[model.dbid*3], rootmodel.cloneInstanceColor[model.dbid*3+1], rootmodel.cloneInstanceColor[model.dbid*3+2])
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

											let indexes = [rootmodel.index, model.dbid]
											let GroupIndex = BeforeSelection.findIndex(item => item.toString() == indexes.toString())
											if (GroupIndex < 0) { //不存在
												BeforeSelection.push(indexes)
											} else { //存在
												BeforeSelection.splice(GroupIndex, 1)
											}
									}else{
										rootmodel.material[model.dbid] = rootmodel.cloneMaterialArray[model.dbid];
									}	
								}
							}
						}
					}
					bimEngine.Selection = BeforeSelection
					bimEngine.ResetSelectedModels_('highlight', BeforeSelection, true)
					selectionBox.endPoint = {
						x: 0,
						y: 0
					}
					selectionBox.startPoint = {
						x: 0,
						y: 0
					}
					getSelect()
				}
			}
		}
	}
	return _selectBox
}