import {
	GetTwoCharCenterStr
} from "@/utils/regex.js"
import {
	SetDeviceStyle
} from "@/views/tools/style/deviceStyleSet.js"
// import {
// 	HandleModelSelect_
// } from "@/views/tools/handleModels/index.js"
//模型交互***************************************************************************************
//显示全部模型
export function ShowAllModels() {
	let modelMappers = window.bimEngine.treeMapper;
	let models = [];
	for (let model of modelMappers) {
		if (model.ModelIds != null) {
			for (let id of model.ModelIds) {
				models.push(id);
			}
		}
	}
	// HandleModelSelect_(models, true);
}
//隐藏全部模型
export function HideAllModels() {
	let modelMappers = window.bimEngine.treeMapper;
	let models = [];
	for (let model of modelMappers) {
		if (model.ModelIds != null) {
			for (let id of model.ModelIds) {
				models.push(id);
			}
		}
	}
	// HandleModelSelect_(models, false);
}
//隐藏模型
export function HideModels() {
	let selectModel = window.bimEngine.SelectedModels;

	// HandleModelSelect_(models, false);
}
//隔离模型
export function IsolationModels() {

}


//通过索引获取包围盒
export function GetBoundingBox_Index(list) {
	let rootmodels = window.bimEngine.scene.children;
	var allPointsX = [];
	var allPointsY = [];
	var allPointsZ = [];
	for (let li of list) {
		if (rootmodels[li[0]] == null) {
			continue;
		}
		if (rootmodels[li[0]].ElementInfos[li[1]] == null) {
			continue;
		}
		let point = rootmodels[li[0]].ElementInfos[li[1]].center.clone();
		allPointsX.push(point.x);
		allPointsY.push(point.y);
		allPointsZ.push(point.z);
	}
	allPointsX.sort((a, b) => {
		if (a < b) {
			return -1
		}
		if (a > b) {
			return 1
		}
		return 0
	})
	allPointsY.sort((a, b) => {
		if (a < b) {
			return -1
		}
		if (a > b) {
			return 1
		}
		return 0
	})
	allPointsZ.sort((a, b) => {
		if (a < b) {
			return -1
		}
		if (a > b) {
			return 1
		}
		return 0
	})
	var min = new THREE.Vector3(allPointsX[0], allPointsY[0], allPointsZ[0]);
	var max = new THREE.Vector3(allPointsX[allPointsX.length - 1], allPointsY[allPointsY.length - 1],
		allPointsZ[allPointsZ.length - 1]);
	var center = min.clone().add(max.clone()).multiplyScalar(0.5);
	return {
		min: min,
		max: max,
		center: center
	}

}

// 获得模型构建的包围矩形
export function GetBoundingBox(list, isRequireModel = false) {
	var rootmodels = window.bimEngine.scene.children.filter(o => o.name == "rootModel");
	var allPointsX = [];
	var allPointsY = [];
	var allPointsZ = [];
	if (list) {
		for (let select of list) {
			for (let rootmodel of rootmodels) {
				if (rootmodel && rootmodel.material.length) {
					let hasSet = false
					for (let model of rootmodel.ElementInfos) {
						if (!isRequireModel && model.name === select) {
							let point = model.center.clone()
							allPointsX.push(point.x);
							allPointsY.push(point.y);
							allPointsZ.push(point.z);
							hasSet = true
							break
						} else if (isRequireModel && GetTwoCharCenterStr(model.name)[0] === select) {
							let point = model.center.clone()
							allPointsX.push(point.x);
							allPointsY.push(point.y);
							allPointsZ.push(point.z);
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
	} else {
		for (let rootmodel of rootmodels) {
			for (let model of rootmodel.ElementInfos) {
				let point = model.center.clone()
				allPointsX.push(point.x);
				allPointsY.push(point.y);
				allPointsZ.push(point.z);
			}
		}
	}

	allPointsX.sort((a, b) => {
		if (a < b) {
			return -1
		}
		if (a > b) {
			return 1
		}
		return 0
	})
	allPointsY.sort((a, b) => {
		if (a < b) {
			return -1
		}
		if (a > b) {
			return 1
		}
		return 0
	})
	allPointsZ.sort((a, b) => {
		if (a < b) {
			return -1
		}
		if (a > b) {
			return 1
		}
		return 0
	})
	var min = new THREE.Vector3(allPointsX[0], allPointsY[0], allPointsZ[0]);
	var max = new THREE.Vector3(allPointsX[allPointsX.length - 1], allPointsY[allPointsY.length - 1],
		allPointsZ[allPointsZ.length - 1]);
	var center = min.clone().add(max.clone()).multiplyScalar(0.5);
	return {
		min: min,
		max: max,
		center: center
	}
}

//世界坐标转屏幕坐标

export function worldPointToScreenPoint(vector3, camera) {
	//计算点在不在相机前面
	let c_dir = new THREE.Vector3()
	let cameraDir = camera.getWorldDirection(c_dir).clone()
	let pointDir = (vector3.clone().sub(camera.position.clone()));
	let Dir = 1
	if (cameraDir.clone().dot(pointDir.clone()) < 0) { //在相机后面
		Dir = -1
	}

	const stdVector = vector3.project(camera);
	let width = window.innerWidth,
		height = window.innerHeight;
	let basex = 0,
		basey = 0;
	if (camera.viewport) {
		width = camera.viewport.z
		height = camera.viewport.w
		const HEIGHT = (window.innerHeight) * window.devicePixelRatio;
		basex = camera.viewport.x;
		basey = camera.viewport.y;
	}
	const a = width / 2;
	const b = height / 2;
	const x = Math.round(stdVector.x * a + a);
	const y = Math.round(-stdVector.y * b + b);
	return {
		x: (basex) + (x) * Dir,
		y: (basey) + (y) * Dir
	}
}

//判断模型是否在屏幕可视区域内
export function IsInScreen(vector3, camera) {
	//先更新相机矩阵位置-否则，相机翻转位置不准
	// let position = vector3.clone();
	// const standardVec = position.project(camera);
	// const centerX = window.innerWidth / 2;
	// const centerY = window.innerHeight / 2;
	// const screenX = Math.round(centerX * standardVec.x + centerX);
	// const screenY = Math.round(-centerY * standardVec.y + centerY);
	// if (screenX > 0 && screenX < window.innerWidth && screenY > 0 && screenY < window.innerHeight) {
	// 	return true;
	// }
	// return true;

	// camera.updateMatrix();
	// camera.updateMatrixWorld();
	let flag = true;
	let position = vector3.clone(); 
	let tempV = position.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
	if ((Math.abs(tempV.x) > 1) || (Math.abs(tempV.y) > 1) || (Math.abs(tempV.z) > 1)) {
		flag = false; 
	}
	return flag;
}


import "./iconfont.js"
//创建svg图标
export function CreateSvg(name) {
	require('@/views/tools/style/' + SetDeviceStyle() + '/SvgIcon.scss')
	let svgns = "http://www.w3.org/2000/svg";
	let xlinkns = "http://www.w3.org/1999/xlink";
	let icon = document.createElementNS(svgns, "svg");
	icon.setAttribute("aria-hidden", true);
	icon.setAttribute("class", 'Svg-Icon');
	let use = document.createElementNS(svgns, "use");
	use.setAttributeNS(xlinkns, "href", "#" + name);
	icon.appendChild(use);
	return icon
}
