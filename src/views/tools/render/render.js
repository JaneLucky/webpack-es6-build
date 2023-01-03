const THREE = require('three')


//渲染相关
/*
1. 设置光照
2. 设置阴影
3. 设置显示边线
4. 设置背景颜色等等 
*/

export function Render(bimengine) {
	var _render = new Object();
	//是否显示模型的边线
	_render.DisplayEdge = function(enable) {
		if (enable == true) {
			var rootmodels = bimengine.scene.children.filter(x => x.name == "rootModel");
			let GroupBox = new THREE.Group();
			GroupBox.Name = "ModelEdges";
			bimengine.scene.add(GroupBox);
			for (var rootmodel of rootmodels) {
				for (var model of rootmodel.ElementInfos) {
					let geometry = new THREE.BufferGeometry()
					geometry.setAttribute(
						'position',
						new THREE.Float32BufferAttribute(model.EdgeList, 3)
					)
					const bufferline = new THREE.LineSegments(
						geometry,
						new THREE.LineBasicMaterial({
							color: '#000000'
						})
					)
					GroupBox.add(bufferline);
				}
			}
		} else {
			var rootmodel = bimengine.scene.children.findLast(x => x.Name == "ModelEdges");
			bimengine.scene.remove(rootmodel)
		}
	}
	//设置背景颜色
	_render.SetBackGroundColor = function(color) {
		bimengine.renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
	}
	//设置阴影强度




	return _render;
}
