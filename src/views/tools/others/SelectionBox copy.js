const THREE = require('three')
import '@/three/interactive/SelectionBox.js';
import '@/three/interactive/SelectionHelper.js';

export default function(camera, scene, renderer, controls) {
	let rootmodels = scene.children.filter(o => o.name == "rootModel" && o.type == "Mesh");
	let modelList = []
	for (let rootmodel of rootmodels) {
		if (rootmodel && rootmodel.meshs.length) {
			modelList = [...modelList, ...rootmodel.meshs]
		}
	}
	
	// console.log(modelList)
	controls.enabled = false
	let selectionBox = new THREE.SelectionBox(camera, {
		children:modelList
	});
	let helper = new THREE.SelectionHelper(renderer, 'selectBox');
	window.addEventListener('pointerdown', onPointerDown, false);

	window.addEventListener('pointermove', onPointerMove, false);

	window.addEventListener('pointerup', onPointerUp, false);

	function onPointerDown(event) {
		//先恢复模型材质颜色
		for (const item of selectionBox.collection) {
			item.material = item.data_material
		}
		
		//设置框选起始点
		selectionBox.startPoint.set(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1,
			0);
	}

	function onPointerMove(event) {
		if (helper.isDown) {
			for (let i = 0; i < selectionBox.collection.length; i++) {
				selectionBox.collection[i].material = selectionBox.collection[i].data_material
			}
			//设置框选终点
			selectionBox.endPoint.set(
				(event.clientX / window.innerWidth) * 2 - 1,
				-(event.clientY / window.innerHeight) * 2 + 1,
				0);
			//修改选中的模型材质颜色
			const allSelected = selectionBox.select();
			console.log(allSelected)
			for (let i = 0; i < allSelected.length; i++) {
				allSelected[i].material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(1, 1, 0)
				});
			}
		}
	}

	function onPointerUp(event) {
		console.log(helper)
		//设置框选终点
		selectionBox.endPoint.set(
			(event.clientX / window.innerWidth) * 2 - 1,
			-(event.clientY / window.innerHeight) * 2 + 1,
			0);
		if (Math.abs(selectionBox.endPoint.x - selectionBox.startPoint.x) > 0.1) { 
			const allSelected = selectionBox.select();
			console.log(allSelected)
			//修改选中的模型材质颜色
			for (let i = 0; i < allSelected.length; i++) {
				allSelected[i].material = new THREE.MeshStandardMaterial({
					color: new THREE.Color(1, 1, 0)
				});
			}
		}
	}

	let dispose = function() {
		controls.enabled = true
		window.removeEventListener('pointerdown', onPointerDown);
		window.removeEventListener('pointermove', onPointerMove);
		window.removeEventListener('pointerup', onPointerUp);
		selectionBox && (selectionBox = null)
		helper && (helper.element = null, helper = null)
	};
	return dispose
}
