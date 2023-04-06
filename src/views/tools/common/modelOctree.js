const THREE = require('@/three/three.js')
import {
	debounce
} from "@/utils/index.js"
import {
	IsInScreen
} from "@/views/tools/common/index.js"
//判断模型的显隐
export function ModelOctreeVisible(bimEngine) {
	window.addEventListener('bimengine:camerachange', debounce(SendMessage, 200));
	let multipleLimit = 15;
	let startIndex = 6;
	let keepFreshDis = 40;



	let childrens = bimEngine.scene.children;
	var defaultMat = new THREE.MeshStandardMaterial({
		color: new THREE.Color(`rgb(220,0,0)`),
		side: THREE.DoubleSide,
		depthTest: true,
		visible: false
	})

	function SendMessage() {
		childrens = bimEngine.scene.children;
		let ModelOctreeBoxs = bimEngine.ModelOctreeBox;
		if (ModelOctreeBoxs != null) {
			//判断视锥体
			hideboxs = [];
			total = 0
			for (let i = 0; i < ModelOctreeBoxs.length; i++) {
				let OctreeBox = ModelOctreeBoxs[i];

				ContainCameraFov(OctreeBox);

				ContainCameraDis(OctreeBox);
			}
			//判断距离 
		}

		handleInstanceMeshDis()
	}

	function handleInstanceMeshDis() {
		// const models = bimEngine.scene.children.filter(x => x.name == "rootModel" && x.TypeName == "InstancedMesh");

		ContainCameraFov()

		function ContainCameraFov() {
			let ModelInstanceBoxs = bimEngine.ModelInstanceBox
			if (ModelInstanceBoxs && ModelInstanceBoxs.length) {
				for (let InstanceBox of ModelInstanceBoxs) {
					let inside = ViewContainbox_fov(InstanceBox.box);
					if (inside) {
						//在里面，再去判断距离
						let indis = ViewContainbox_Dis_DensePoint(InstanceBox.box);
						if (indis) {
							if(bimEngine.scene.children[startIndex + InstanceBox.i].Treevisible!=false){
								bimEngine.scene.children[startIndex + InstanceBox.i].visible = true;
							} 
						} else {
							bimEngine.scene.children[startIndex + InstanceBox.i].visible = false;
						}
					} else {
						//直接隐藏
						bimEngine.scene.children[startIndex + InstanceBox.i].visible = false;
					}
				}
			}
		}

	}



	//视锥体包含
	function ContainCameraFov(box) {
		total = total + 1;
		let inside = ViewContainbox_fov(box);
		if (inside == true) {
			//继续遍历
			if (box.isLeaf == false) {
				IterationModelVisible(box, true);
				for (let b of box.children) {
					ContainCameraFov(b);
				}
			} else {
				IterationModelVisible(box, true);
			}
		} else {
			//开始隐藏模型 
			IterationModelVisible(box, false);
		}
	}
	//距离包含
	function ContainCameraDis(box) {
		let inside = ViewContainbox_Dis(box);
		if (inside == true) {
			//继续遍历
			if (box.isLeaf == false) {
				IterationModelVisible(box, true);
				for (let b of box.children) {
					ContainCameraDis(b);
				}
			} else {
				IterationModelVisible(box, true);
			}
		} else {
			//开始隐藏模型 
			IterationModelVisible(box, false);
		}
	}

	//判断是否在可视范围
	function ViewContainbox_fov(box) { 
		let DensePoints = box.DensePoint;
		let flag = false;
		for (let point of DensePoints) {
			if (IsInScreen(point, bimEngine.scene.camera) == true) {
				return true
			}
		} 
	}
	//使用密集点计算距离
	function ViewContainbox_Dis_DensePoint(box) {
		let cameraPosition = bimEngine.scene.camera.position
		if (cameraPosition.x > box.min.x && cameraPosition.y > box.min.y && cameraPosition.z > box.min.z) {
			if (cameraPosition.x < box.max.x && cameraPosition.y < box.max.y && cameraPosition.z < box.max.z) {
				return true
			}
		}
		//计算包围盒到相机的距离
		let DensePoints = box.DensePoint;
		let flag = false;
		for (let point of DensePoints) {
			if (point.clone().distanceTo(bimEngine.scene.camera.position) < multipleLimit * box.length*2) {
				return true
			}
		}
		return false;
	}

	function ViewContainbox_Dis(box) {
		//判断在不在box里面
		let cameraPosition = bimEngine.scene.camera.position
		if (cameraPosition.x > box.min.x && cameraPosition.y > box.min.y && cameraPosition.z > box.min.z) {
			if (cameraPosition.x < box.max.x && cameraPosition.y < box.max.y && cameraPosition.z < box.max.z) {
				box.keepFresh = true;
				return true
			}
		}
		//计算包围盒到相机的距离
		let dis1 = box.min.distanceTo(cameraPosition);
		let dis2 = box.max.distanceTo(cameraPosition);
		let dis = Math.min(dis1, dis2);
		if (dis < keepFreshDis) {
			box.keepFresh = true;
		}else{
			box.keepFresh = false;
		}
		if (dis > multipleLimit * box.length) {
			return false
		} else {
			return true;
		}
	}

	let hideboxs = [];
	let total = 0;
	//迭代去显示或者隐藏模型
	function IterationModelVisible(box, visible) {
		if (visible == false && box.elements != null) {
			let isadd = true;
			for (let i = 0; i < hideboxs.length; i++) {

				if (hideboxs[i] == box.id) {
					isadd = false;
					break
				}
			}
			if (isadd) {
				hideboxs.push(box.id);;
			}

			// childrens[5 + ele.i].material[ele.j] = defaultMat;
			if (box == null || box.elements == null) {
				return;
			}
			for (let f = 0; f < box.elements.length; f++) {
				let ele = box.elements[f];
				if (ele == null) {
					continue;
				}
				if (childrens[startIndex + ele.i].geometry.groups.length != 0) {
					childrens[startIndex + ele.i].geometry.groups[ele.j].hide = true;
					childrens[startIndex + ele.i].geometry.groups[ele.j].keepFresh = box.keepFresh;
				}
			}

			if (box.isLeaf == false) {
				for (let child of box.children) {
					IterationModelVisible(child, visible);
				}
			}
		} else {
			let isvisi = true;
			for (let i = 0; i < hideboxs.length; i++) {
				if (hideboxs[i] == box.id) {
					isvisi = false;
					break
				}
			}
			if (isvisi == false) {

			} else {
				if (box == null || box.elements == null) {
					return;
				}
				for (let ff = 0; ff < box.elements.length; ff++) {
					let ele_ = box.elements[ff];
					if (ele_ == null) {
						continue;
					}
					if (childrens[startIndex + ele_.i].geometry.groups.length != 0) {
						childrens[startIndex + ele_.i].geometry.groups[ele_.j].hide = false;
						childrens[startIndex + ele_.i].geometry.groups[ele_.j].keepFresh = box.keepFresh; 
					}
				}
				if (box.isLeaf == false) {
					for (let child of box.children) {
						IterationModelVisible(child, visible);
					}
				}
			}

		}
	}
}

export function ModelOctrees(bimEngine) {
	 
	var models_ = bimEngine.GetAllVisibilityModel();
	ModelInstanceTree(bimEngine);
	//最小的盒子尺寸
	const minSize = 50;
	const DenseSize = 30;
	const models = bimEngine.scene.children.filter(x => x.name == "rootModel" && (x.TypeName == "Mesh" || x.TypeName ==
	"Mesh-Structure" || x.TypeName == "PipeMesh"));
	if (window.idindex == null) {
		window.idindex = 0;
	}
	var boxs = [];
	//拿到所有的box
	for (let i = 0; i < models.length; i++) {
		if (models_.findIndex(x => x.uuid == models[i].uuid) != -1) {
			for (let j = 0; j < models[i].ElementInfos.length; j++) {
				boxs.push({
					min: models[i].ElementInfos[j].min,
					max: models[i].ElementInfos[j].max,
				});
			}
		}
	}
	if (boxs.length == 0) {
		return;
	}

	//计算最外层box,并拆分小盒子
	var maxBox = GetMaxBoundingBox(boxs);
	maxBox = OctreeBOX(maxBox);
	//判断构件属于哪个盒子
	if (bimEngine.ModelOctreeBox == null) {
		bimEngine.ModelOctreeBox = [];
	}
	bimEngine.ModelOctreeBox.push(maxBox);
	//计算模型的归属
	for (let i = 0; i < models.length; i++) {
		let index = models_.findIndex(x => x.uuid == models[i].uuid);
		if (index == -1) {
			continue;
		}
		for (let j = 0; j < models[i].ElementInfos.length; j++) {
			elementContain(models[i].ElementInfos[j], index, j, maxBox);
		}
	}

	//**************************************************************计算方法***********************************************************//
	//判断构件属于哪一级盒子
	function elementContain(info, ii, jj, box) {
		var infobox = {
			min: info.min,
			max: info.max,
		}
		let iscontain = boxContain(box, infobox);
		if (iscontain == true) {
			if (box.elements == null) {
				box.elements = [];
			}

			//如果不是根节点，还可以继续
			if (box.isLeaf == false) {
				//判断下一级
				let ischild = false;
				for (let i = 0; i < box.children.length; i++) {
					let result = elementContain(info, ii, jj, box.children[i]);
					if (result == true) {
						ischild = true;
						break;
					}
				}
				if (ischild == false) {
					box.elements.push({
						i: ii,
						j: jj
					});
					if(box.isLeaf){
						//最后的盒子，把构件位置加进去
						box.DensePoint.push(info.min);
					}
				}
			} else {
				box.elements.push({
					i: ii,
					j: jj
				});
				if(box.isLeaf){
					//最后的盒子，把构件位置加进去
					box.DensePoint.push(info.min);
				}
			}
		} else {
			return false;
		}
		return true;
	}

	//判断盒子是否包含
	function boxContain(_maxbox, _minbox) {
		if (_minbox.min.x >= _maxbox.min.x && _minbox.min.y >= _maxbox.min.y && _minbox.min.z >= _maxbox.min.z) {
			if (_minbox.max.x <= _maxbox.max.x && _minbox.max.y <= _maxbox.max.y && _minbox.max.z <= _maxbox.max.z) {
				return true;
			}
		}
		return false;
	}

	//细分盒子
	function OctreeBOX(box) {

		//先判断各个方向的尺寸
		let octreeboxs1 = [];
		let octreeboxs2 = [];
		let octreeboxs3 = [];
		let size_x = (box.max.x - box.min.x) * 0.5;
		let size_y = (box.max.y - box.min.y) * 0.5;
		let size_z = (box.max.z - box.min.z) * 0.5;
		//然后判断各个方向上的拆分尺寸 
		//X方向上拆分
		if (size_x > minSize) {
			let _box = box;
			let b1 = {
				min: _box.min,
				max: new THREE.Vector3(_box.min.x + size_x, _box.max.y, _box.max.z)
			}
			let b2 = {
				min: new THREE.Vector3(_box.min.x + size_x, _box.min.y, _box.min.z),
				max: _box.max
			}
			octreeboxs1.push(b1);
			octreeboxs1.push(b2);
		}
		//Y方向上拆分
		if (size_y > minSize) {
			for (let _box of octreeboxs1) {
				let b1 = {
					min: _box.min,
					max: new THREE.Vector3(_box.max.x, _box.min.y + size_y, _box.max.z)
				}
				let b2 = {
					min: new THREE.Vector3(_box.min.x, _box.min.y + size_y, _box.min.z),
					max: _box.max
				}
				octreeboxs2.push(b1);
				octreeboxs2.push(b2);
			}
		} else {
			octreeboxs2 = octreeboxs1;
		}
		//Z方向上拆分
		if (size_z > minSize) {
			for (let _box of octreeboxs2) {
				let b1 = {
					min: _box.min,
					max: new THREE.Vector3(_box.max.x, _box.max.y, _box.min.z + size_z)
				}
				let b2 = {
					min: new THREE.Vector3(_box.min.x, _box.min.y, _box.min.z + size_z),
					max: _box.max
				}
				octreeboxs3.push(b1);
				octreeboxs3.push(b2);
			}
		} else {
			octreeboxs3 = octreeboxs2;
		}
		//往下迭代

		box.children = octreeboxs3;

		if (box.children.length > 0) {
			box.isLeaf = false;
			for (let i = 0; i < box.children.length; i++) {
				box.children[i] = OctreeBOX(box.children[i]);
			}
		} else {
			box.isLeaf = true;
		}
		
		
		
		box.DensePoint = DensePoint(box);
		box.length = box.min.distanceTo(box.max);
		box.id = window.idindex++;
		if(box.isLeaf){
			box.DensePoint = []
		}
		return box;
	}

	//计算盒子密集点
	function DensePoint(box) {
		let points = []
		for (let i = 0;; i++) {
			let cx = box.min.x + DenseSize * i;
			if (cx >= box.max.x) {
				cx = box.max.x;
			}
			for (let j = 0;; j++) {
				let cy = box.min.y + DenseSize * j;
				if (cy >= box.max.y) {
					cy = box.max.y;
				}
				for (let k = 0;; k++) {
					let cz = box.min.z + DenseSize * k;
					if (cz >= box.max.z) {
						cz = box.max.z
					}
					points.push(new THREE.Vector3(cx, cy, cz));
					if (cz == box.max.z) {
						break;
					}
				}
				if (cy == box.max.y) {
					break;
				}
			}
			if (cx == box.max.x) {
				break;
			}
		}
		return points;
	}

	//计算一堆box上的最外层box
	function GetMaxBoundingBox(boxs) {
		var xs = [];
		var ys = [];
		var zs = [];
		for (let box of boxs) {
			xs.push(box.min.x);
			ys.push(box.min.y);
			zs.push(box.min.z);
			xs.push(box.max.x);
			ys.push(box.max.y);
			zs.push(box.max.z);
		}
		xs = xs.sort((a, b) => a - b);
		ys = ys.sort((a, b) => a - b);
		zs = zs.sort((a, b) => a - b);
		//然后生成
		return {
			min: new THREE.Vector3(xs[0], ys[0], zs[0]),
			max: new THREE.Vector3(xs[xs.length - 1], ys[ys.length - 1], zs[zs.length - 1]),
		};
	}

}

// 获得所有InstanceMesh独立外层盒子
export function ModelInstanceTree(bimEngine) {
	var models_ = bimEngine.GetAllVisibilityModel();
	const models = bimEngine.scene.children.filter(x => x.name == "rootModel" && (x.TypeName == "InstancedMesh" || x.TypeName == "InstancedMesh-Pipe"));
	window.idindex = 0;
	bimEngine.ModelInstanceBox = [];
	//拿到所有的box
	for (let i = 0; i < models.length; i++) {
		var boxs = [];
		let index = models_.findIndex(x => x.uuid == models[i].uuid && x.url == models[i].url);
		if (index == -1) {
			continue;
		}
		if (index != -1) {
			for (let j = 0; j < models[i].ElementInfos.length; j++) {
				boxs.push({
					min: models[i].ElementInfos[j].min,
					max: models[i].ElementInfos[j].max,
				});
			}
		}
		if (boxs.length == 0) {
			continue;
		}
		var maxbox = GetMaxBoundingBox(boxs);
		maxbox.length = boxs[0].min.distanceTo(boxs[0].max) * 8;
		maxbox.DensePoint = DensePoint(maxbox);
		//子构件加进去
		for (let b of boxs) {
			maxbox.DensePoint.push(b.min.clone().add(b.max.clone()).multiplyScalar(0.5));
			// maxbox.DensePoint.push(b.min);
			// maxbox.DensePoint.push(b.max);
			// debugger
		}
		maxbox.id = window.idindex++;
		let instanceObj = {
			i: index,
			box: maxbox,
		}
		bimEngine.ModelInstanceBox.push(instanceObj);
	}




	//计算一堆box上的最外层box
	function GetMaxBoundingBox(boxs) {
		var xs = [];
		var ys = [];
		var zs = [];
		for (let box of boxs) {
			xs.push(box.min.x);
			ys.push(box.min.y);
			zs.push(box.min.z);
			xs.push(box.max.x);
			ys.push(box.max.y);
			zs.push(box.max.z);
		}
		xs = xs.sort((a, b) => a - b);
		ys = ys.sort((a, b) => a - b);
		zs = zs.sort((a, b) => a - b);
		//然后生成
		return {
			min: new THREE.Vector3(xs[0], ys[0], zs[0]),
			max: new THREE.Vector3(xs[xs.length - 1], ys[ys.length - 1], zs[zs.length - 1]),
		};
	}
	//计算盒子密集点
	function DensePoint(box) {
		const DenseSize = 5;
		let points = []
		for (let i = 0;; i++) {
			let cx = box.min.x + DenseSize * i;
			if (cx >= box.max.x) {
				cx = box.max.x;
			}
			for (let j = 0;; j++) {
				let cy = box.min.y + DenseSize * j;
				if (cy >= box.max.y) {
					cy = box.max.y;
				}
				for (let k = 0;; k++) {
					let cz = box.min.z + DenseSize * k;
					if (cz >= box.max.z) {
						cz = box.max.z
					}
					points.push(new THREE.Vector3(cx, cy, cz));
					if (cz == box.max.z) {
						break;
					}
				}
				if (cy == box.max.y) {
					break;
				}
			}
			if (cx == box.max.x) {
				break;
			}
		}
		return points;
	}

}
