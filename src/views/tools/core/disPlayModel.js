const THREE = require('three')
export function disPlayModel() {
	var _disPlayModel = new Object();
	//删除填充颜色
	_disPlayModel.ClearFillColor = function(model) {
		for (var i = 0; i < model.material.length; i++) {
			model.material[i] = model.cloneMaterialArray[i];
		}
	}
	//设置颜色
	_disPlayModel.SetFillColor = function(model, ids, color) {
		for (var i = 0; i < ids.length; i++) {
			model.material[ids[i]] = new THREE.MeshStandardMaterial({
				color: color
			});
		}
	}
	//隐藏模型
	_disPlayModel.HideElements = function(model, ids) {
		if (model.hideElements == null) {
			model.hideElements = []
		}
		for (var id of ids) {
			model.hideElements.push(id)
		}
		//显示和隐藏
		var mat = new THREE.MeshStandardMaterial({
			transparent: true,
			opacity: 0
		})
		for (var id of ids) {
			model.material[ids[i]] = mat;
		}

	}
	//显示模型
	_disPlayModel.ShowElements = function(model, ids) {
		if (model.hideElements == null) {
			model.hideElements = []
		}
		for (var id of ids) {
			var index = model.hideElements.findIndex(x => x == id);
			if (index != -1) {
				model.hideElements.slice(index, 1);
			}
		}
		//显示和隐藏
		for (var id of ids) {
			model.material[ids[i]] = model.cloneMaterialArray[ids[i]];
		}
	}
	//显示所有模型
	_disPlayModel.showAllElements = function(model) {
		model.hideElements = []
		for (var i = 0; i < model.material.length; i++) {
			model.material[i] = model.cloneMaterialArray[i];
		}
	}
	return _disPlayModel;
}