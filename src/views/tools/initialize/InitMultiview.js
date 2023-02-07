const THREE = require('three')
import "../style/multiview.scss"
//多视口平铺
/*
【视图分类】
1. 平面视图：
2. 剖面视图：
3. 立面视图：
4. 三维视图：
【相机分类】
1. 平面视图：正交相机，只能平移，缩放
2. 三维视图：所有三维交互
*/
export function Multiview(bimEngine, camera) {
	var multiview = new Object();

	if (bimEngine.ArrayCamera == null) {
		let arraycamera = new THREE.ArrayCamera([camera]);
		camera.IsActive = true;
		camera.IsVisibility = true;
		camera.Id = "a";
		camera.ControlType = "D3";
		const WIDTH = (window.innerWidth) * window.devicePixelRatio;
		const HEIGHT = (window.innerHeight) * window.devicePixelRatio;
		const ASPECT_RATIO = window.innerWidth / window.innerHeight;
		camera.viewport = new THREE.Vector4(0, 0, Math.ceil(WIDTH), Math.ceil(HEIGHT));
		bimEngine.ArrayCamera = arraycamera;
		TileView(bimEngine);
	}
	//注册事件
	document.addEventListener("click", function(res) {
		//判断一下，
		for (var camera of bimEngine.ArrayCamera.cameras) {
			let minx = camera.viewport.x;
			let miny = camera.viewport.y;
			let maxx = camera.viewport.x + camera.viewport.z;
			let maxy = camera.viewport.y + camera.viewport.w;
			if (camera.IsVisibility == true && camera.IsActive == false) {
				if (res.clientX > minx && res.clientX < maxx) {
					if (res.clientY > miny && res.clientY < maxy) {
						camera.IsActive = true;
						bimEngine.scene.controls.dispose();
						multiview.ReplaceView(bimEngine, camera);
						let target = camera.target == null ? bimEngine.scene.controls.target.clone() : camera
							.target.clone();
						bimEngine.scene.controls = new THREE.OrbitControls(camera, bimEngine.scene.renderer
							.domElement);
						bimEngine.scene.controls.target = target;
						bimEngine.scene.controls.update();
						if (camera.ControlType == "D3") {
							window.bimEngine.scene.controls.enableRotate = true;
							document.getElementsByClassName("ViewCube")[0].style.visibility = "visible"
						} else if (camera.ControlType == "Plane") {
							window.bimEngine.scene.controls.enableRotate = false;
							document.getElementsByClassName("ViewCube")[0].style.visibility = "hidden"
						}
						//把原来的变成false
						var cs = bimEngine.ArrayCamera.cameras.filter(x => x.IsActive == true && x.uuid !=
							camera.uuid);
						for (var c of cs) {
							c.IsActive = false
						}

						break;
					}
				}
			}
		}
	})
	//刷新视图
	multiview.updaterender = function() {
		const HEIGHT = (window.innerHeight) * window.devicePixelRatio;
		for (let i = 0; i < bimEngine.ArrayCamera.cameras.length; i++) {
			var camera = bimEngine.ArrayCamera.cameras[i];
			if (camera.IsVisibility) {
				bimEngine.scene.renderer.setScissorTest(true);
				bimEngine.scene.renderer.setViewport(camera.viewport.x, HEIGHT - camera.viewport.y - camera
					.viewport.w, camera.viewport.z, camera
					.viewport.w);
				bimEngine.scene.renderer.setScissor(camera.viewport.x, HEIGHT - camera.viewport.y - camera
					.viewport.w, camera.viewport.z, camera
					.viewport.w);
				// bimEngine.scene.renderer.setScissorTest(true);
				bimEngine.scene.renderer.render(bimEngine.scene, camera);
				//更新相机
				if (camera.IsActive) {
					camera.target = bimEngine.scene.controls.target.clone();
				}
			}
		}
	}




	/*******************************************************视图交互的一些方法**********************************************************/
	//创建新视图
	multiview.creatorView = function(bimEngine, option) {
		CreatorView(bimEngine, option);
	}
	//平铺视图
	multiview.TileView = function(bimEngine) {
		var cameras = bimEngine.ArrayCamera.cameras;
		for (let ca of cameras) {
			ca.IsVisibility = true;
		}
		TileView(bimEngine);
	}
	//清除视图
	multiview.ClearView = function(bimEngine) {
		ClearViews(bimEngine)
	}
	//切换
	multiview.SwitchView = function(bimEngine, camera) {
		let cameras = bimEngine.ArrayCamera.cameras;
		for (var item_ of cameras) {
			if (item_.Id == camera.Id) {
				item_.IsActive = true;
				item_.IsVisibility = true;
			} else {
				item_.IsActive = false;
				item_.IsVisibility = false;
			}
		}
		bimEngine.scene.controls.dispose();
		multiview.ReplaceView(bimEngine, camera);
		let target = camera.target == null ? bimEngine.scene.controls.target : camera.target.clone();
		bimEngine.scene.controls = new THREE.OrbitControls(camera, bimEngine.scene.renderer
			.domElement);
		bimEngine.scene.controls.target = target;
		bimEngine.scene.controls.update();
		if (camera.ControlType == "D3") {
			window.bimEngine.scene.controls.enableRotate = true;
			document.getElementsByClassName("ViewCube")[0].style.visibility = "visible"
			window.bimEngine.Render.DisplayEdge(false);
		} else if (camera.ControlType == "Plane") {
			window.bimEngine.scene.controls.enableRotate = false;
			document.getElementsByClassName("ViewCube")[0].style.visibility = "hidden"
			window.bimEngine.Render.DisplayEdge(true);
		}
		TileView(bimEngine);

	}
	//创建三维正交视图
	multiview.New3DOrthogonal = function(bimEngine) {
		let viewdata = multiview.Get3DOrthogonalData();
		//判断一下有没有吧
		let index = bimEngine.ArrayCamera.cameras.findIndex(x => x.Id == viewdata.Id);
		if (index == -1) {
			var width = window.innerWidth; //窗口宽度
			var height = window.innerHeight; //窗口高度
			var k = width / height; //窗口宽高比 
			var s = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
			var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
			camera.name = viewdata.label;
			camera.Id = viewdata.Id;
			camera.ControlType = "D3";
			bimEngine.ArrayCamera.cameras.splice(0, 0, camera);
			multiview.SwitchView(bimEngine, camera);
			//跳转至最佳位置 
			bimEngine.ViewCube.cameraGoHome()
		} else {
			multiview.SwitchView(bimEngine, bimEngine.ArrayCamera.cameras[index]);
		}
		window.bimEngine.scene.controls.enableRotate = true
	}
	//创建三维透视视图
	multiview.New3DPerspective = function(bimEngine) {
		let viewdata = multiview.Get3DPerspectiveData();
		//判断一下有没有吧
		let index = bimEngine.ArrayCamera.cameras.findIndex(x => x.Id == viewdata.Id);
		if (index == -1) {
			var width = window.innerWidth; //窗口宽度
			var height = window.innerHeight; //窗口高度
			var k = width / height; //窗口宽高比  
			var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01,
				30000) //透视相机 
			camera.name = viewdata.label;
			camera.Id = viewdata.Id;
			camera.ControlType = "D3";
			bimEngine.ArrayCamera.cameras.splice(0, 0, camera);
			multiview.SwitchView(bimEngine, camera);
			bimEngine.ViewCube.cameraGoHome();
			//跳转至最佳位置
		} else {
			multiview.SwitchView(bimEngine, bimEngine.ArrayCamera.cameras[index]);
		}
		window.bimEngine.scene.controls.enableRotate = true;
		document.getElementsByClassName("ViewCube")[0].style.visibility = "visible";
	}
	//创建平面视图
	multiview.NewPlaneView = function(bimEngine, viewdata) {
		let index = bimEngine.ArrayCamera.cameras.findIndex(x => x.Id == viewdata.Id);
		if (index == -1) {
			var width = window.innerWidth; //窗口宽度
			var height = window.innerHeight; //窗口高度
			var k = width / height; //窗口宽高比 
			var s = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
			var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 0.001, 1000000);
			camera.name = viewdata.label;
			camera.Id = viewdata.Id;
			camera.ControlType = "Plane";
			bimEngine.ArrayCamera.cameras.splice(0, 0, camera);
			//跳转至最佳位置  
			var box = bimEngine.ViewCube.getBoundingBox();
			var min = box.min;
			var max = box.max;
			var target_ = min.clone().add(max.clone()).multiplyScalar(0.5);
			let position = new THREE.Vector3(target_.x, viewdata.ViewData.Evevation * 0.3048, target_.z);
			let ViewDirection = new THREE.Vector3(viewdata.ViewData.ViewDirection.X, viewdata.ViewData.ViewDirection
				.Z, viewdata.ViewData.ViewDirection.Y);
			let target = position.clone().add(ViewDirection);
			bimEngine.ViewCube.animateCamera(bimEngine.scene.camera.position, position, bimEngine.scene.controls
				.target
				.clone(), target);
			multiview.SwitchView(bimEngine, camera);
		} else {
			multiview.SwitchView(bimEngine, bimEngine.ArrayCamera.cameras[index]);
		}
		window.bimEngine.scene.controls.enableRotate = false;
		document.getElementsByClassName("ViewCube")[0].style.visibility = "hidden"
	}
	//创建剖面视图
	multiview.NewElevationView = function(bimEngine, viewdata) {
		let index = bimEngine.ArrayCamera.cameras.findIndex(x => x.Id == viewdata.Id);
		if (index == -1) {
			var width = window.innerWidth; //窗口宽度
			var height = window.innerHeight; //窗口高度
			var k = width / height; //窗口宽高比 
			var s = 100; //三维场景显示范围控制系数，系数越大，显示的范围越大
			var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
			camera.name = viewdata.label;
			camera.Id = viewdata.Id;
			camera.ControlType = "Plane";
			bimEngine.ArrayCamera.cameras.splice(0, 0, camera);
			//跳转至最佳位置  
			if (viewdata.ViewData.Origin.X == null) {
				let position = new THREE.Vector3(viewdata.ViewData.Origin.x, viewdata.ViewData.Origin.y, viewdata
					.ViewData.Origin.z);
				let ViewDirection = new THREE.Vector3(viewdata.ViewData.ViewDirection.x, viewdata.ViewData
					.ViewDirection
					.y, viewdata.ViewData
					.ViewDirection.z);
				let target = position.clone().add(ViewDirection);

				bimEngine.ViewCube.animateCamera(bimEngine.scene.camera.position, position, bimEngine.scene.controls
					.target
					.clone(), target)
				multiview.SwitchView(bimEngine, camera);
			} else {
				let position = new THREE.Vector3(viewdata.ViewData.Origin.X * 0.3048, viewdata.ViewData.Origin.Z *
					0.3048, viewdata
					.ViewData.Origin.Y * 0.3048);
				let ViewDirection = new THREE.Vector3(viewdata.ViewData.ViewDirection.X, viewdata.ViewData
					.ViewDirection
					.Z, viewdata.ViewData
					.ViewDirection.Y);
				let target = position.clone().add(ViewDirection);

				bimEngine.ViewCube.animateCamera(bimEngine.scene.camera.position, position, bimEngine.scene.controls
					.target
					.clone(), target)
				multiview.SwitchView(bimEngine, camera);
			}

		} else {
			multiview.SwitchView(bimEngine, bimEngine.ArrayCamera.cameras[index]);
		}
		window.bimEngine.scene.controls.enableRotate = false
		document.getElementsByClassName("ViewCube")[0].style.visibility = "hidden"
	}



	//获得三维正交视图数据
	multiview.Get3DOrthogonalData = function() {
		let data = window.bimEngine.D3Measure.ViewList.filter(item => item.ViewType == "3DOrthogonal")
		let item = data && data.length ? data[0] : {}
		return item
	}
	//获得三维透视视图数据
	multiview.Get3DPerspectiveData = function() {
		let data = window.bimEngine.D3Measure.ViewList.filter(item => item.ViewType == "3DPerspective")
		let item = data && data.length ? data[0] : {}
		return item
	}

	multiview.ReplaceView = function (bimEngine, camera) {
		let beforeCamera = bimEngine.scene.camera
		bimEngine.scene.camera = camera;
		if(bimEngine.scene.camera.Id !== beforeCamera.Id){
			console.log('相机切换')
			//测量点
			let MeasurePointContainer = document.getElementById("MeasurePoint")
			if(MeasurePointContainer){
				let MeasureList = MeasurePointContainer.getElementsByClassName("PointItem")
				for(let i=0;i<MeasureList.length;i++){
					if(MeasureList[i].dataset.cameraId === camera.type+"_"+camera.Id){
						MeasureList[i].style.display = "block"
					}else{
						MeasureList[i].style.display = "none"
					}
				}
			}
			//测量线
			let MeasureLineContainer = document.getElementById("MeasureLine")
			if(MeasureLineContainer){
				let MeasureList = MeasureLineContainer.getElementsByClassName("LineItem")
				for(let i=0;i<MeasureList.length;i++){
					if(MeasureList[i].dataset.cameraId === camera.type+"_"+camera.Id){
						MeasureList[i].style.display = "block"
					}else{
						MeasureList[i].style.display = "none"
					}
				}
			}
		}
	}


	return multiview;
}
//添加一个视图
export function CreatorView(bimEngine, option) {
	//视图类型
	/*
	{
	    ViewType:"",	
	}
	
	
	*/
	const ASPECT_RATIO = window.innerWidth / window.innerHeight;
	const subcamera = new THREE.PerspectiveCamera(40, ASPECT_RATIO, 0.1, 10);
	subcamera.viewport = new THREE.Vector4(1, 2, 2, 2);
	subcamera.IsActive = false;
	subcamera.IsVisibility = true;
	subcamera.name = "视图" + bimEngine.ArrayCamera.cameras.length
	bimEngine.ArrayCamera.cameras.splice(0, 0, subcamera);
	TileView(bimEngine);
	// if (option.ViewType = "View3D") {

	// } else if (option.ViewType = "View2D") {

	// }
}
//切换视图
export function SwitchView(camera) {



}
//清除视图，只保留当前激活视图
export function ClearViews(bimEngine) {
	window.bimEngine.ArrayCamera.cameras = [];
	window.bimEngine.ArrayCamera.cameras.push(bimEngine.scene.camera);
	TileView(bimEngine)
}

//平铺视图
export function TileView(bimEngine) {
	let cameraArray = bimEngine.ArrayCamera.cameras.filter(x => x.IsVisibility == true);
	let viewCount = cameraArray.length;

	const WIDTH = (window.innerWidth) * window.devicePixelRatio;
	const HEIGHT = (window.innerHeight) * window.devicePixelRatio;
	const ASPECT_RATIO = window.innerWidth / window.innerHeight;

	var doms = document.getElementsByClassName("ViewControlPanel");
	for (; doms.length > 0;) {
		doms[0].remove()
	}
	//最多4个视图的平铺
	if (viewCount == 1) {
		//一个视图  
		const subcamera = cameraArray[0];
		subcamera.viewport = new THREE.Vector4(0, 0, Math.ceil(WIDTH), Math.ceil(HEIGHT));
		Resize(subcamera);
		CreatorViewUI(bimEngine, subcamera);
	}
	if (viewCount == 2) {
		//两个视图
		{
			const subcamera = cameraArray[0];
			subcamera.viewport = new THREE.Vector4(0, 0, Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT));
			subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT);
			Resize(subcamera);
			CreatorViewUI(bimEngine, subcamera);
		} {
			const subcamera = cameraArray[1];
			subcamera.viewport = new THREE.Vector4(Math.floor(WIDTH * 0.5), 0, Math.ceil(WIDTH * 0.5), Math.ceil(
				HEIGHT));
			subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT);
			Resize(subcamera);
			CreatorViewUI(bimEngine, subcamera);
		}
	}
	if (viewCount == 3) {
		//三个视图
		{
			const subcamera = cameraArray[0];
			subcamera.viewport = new THREE.Vector4(0, 0, Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT * 0.5));
			subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT * 0.5);
			Resize(subcamera);
			CreatorViewUI(bimEngine, subcamera);
		} {
			const subcamera = cameraArray[1];
			subcamera.viewport = new THREE.Vector4(0, Math.floor(HEIGHT * 0.5), Math.ceil(WIDTH * 0.5), Math.ceil(
				HEIGHT * 0.5));
			subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT * 0.5);
			Resize(subcamera);
			CreatorViewUI(bimEngine, subcamera);
		} {
			const subcamera = cameraArray[2];
			subcamera.viewport = new THREE.Vector4(Math.floor(WIDTH * 0.5), 0, Math.ceil(WIDTH * 0.5), Math.ceil(
				HEIGHT));
			subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT);
			Resize(subcamera);
			CreatorViewUI(bimEngine, subcamera);
		}
	}
	if (viewCount >= 4) {
		//四个视图
		{
			const subcamera = cameraArray[0];
			subcamera.viewport = new THREE.Vector4(0, 0, Math.ceil(WIDTH * 0.5), Math.ceil(HEIGHT * 0.5));
			subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT * 0.5);
			Resize(subcamera);
			CreatorViewUI(bimEngine, subcamera);
		} {
			const subcamera = cameraArray[1];
			subcamera.viewport = new THREE.Vector4(0, Math.floor(HEIGHT * 0.5), Math.ceil(WIDTH * 0.5), Math.ceil(
				HEIGHT * 0.5));
			subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT * 0.5);
			Resize(subcamera);
			CreatorViewUI(bimEngine, subcamera);
		} {
			const subcamera = cameraArray[2];
			subcamera.viewport = new THREE.Vector4(Math.floor(WIDTH * 0.5), 0, Math.ceil(WIDTH * 0.5), Math.ceil(
				HEIGHT * 0.5));
			subcamera.aspect = Math.ceil(WIDTH * 0.5) / Math.ceil(HEIGHT * 0.5);
			Resize(subcamera);
			CreatorViewUI(bimEngine, subcamera);
		} {
			const subcamera = cameraArray[3];
			subcamera.viewport = new THREE.Vector4(Math.floor(WIDTH * 0.5), Math.floor(HEIGHT * 0.5), Math.ceil(WIDTH *
				0.5), Math.ceil(HEIGHT * 0.5));
			Resize(subcamera);
			CreatorViewUI(bimEngine, subcamera);
		}
	}
}
//更新相机画布
export function Resize(camera) {
	if (camera.type == "OrthographicCamera") {
		//正交相机
		let frustumSize = 100;
		let width = camera.viewport.z;
		let height = camera.viewport.w;
		let aspect = width / height;
		camera.aspect = aspect;
		camera.left = -frustumSize * aspect / 2;
		camera.right = frustumSize * aspect / 2;
		camera.top = frustumSize / 2;
		camera.bottom = -frustumSize / 2;
		camera.updateProjectionMatrix();
	} else if (camera.type == "PerspectiveCamera") {
		//透视相机
		let width = camera.viewport.z;
		let height = camera.viewport.w;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}
}
//创建视图UI
export function CreatorViewUI(bimengine, camera) {
	let left = camera.viewport.x;
	let top = camera.viewport.y;
	let width = camera.viewport.z;
	let height = camera.viewport.w;

	let dom = document.createElement("div");
	dom.className = "ViewControlPanel";
	dom.style.top = top + "px";
	dom.style.left = left + "px";
	dom.style.width = width + "px";
	dom.style.height = height + "px";
	dom.style.outline = "1px solid rgb(10,10,10,0.2)";


	var htmls = [
		'<div >',
		'<div id="' + camera.uuid + 'closeButton" class="ViewControlClose">×</div>',
		'<div id="' + camera.uuid + 'maxButton" class="ViewControlMax">▣</div>',
		'<div id="' + camera.uuid + 'minButton" class="ViewControlMin">─</div>',
		'</div>'
	].join('');
	dom.innerHTML = htmls;
	var _container = bimengine.scene.renderer.domElement.parentElement;
	_container.appendChild(dom);
	// debugger
	document.getElementById(camera.uuid + "closeButton").addEventListener("click", function(res) {
		//关闭窗口,直接清掉
		let index = bimengine.ArrayCamera.cameras.findIndex(x => x.uuid == res.target.id.replace("closeButton",
			""));
		if (index != -1) {
			bimengine.ArrayCamera.cameras.splice(index, 1);
		}
		if (bimengine.ArrayCamera.cameras.findIndex(x => x.uuid == bimengine.scene.camera.uuid) == -1) {
			multiview.ReplaceView(bimEngine, bimengine.ArrayCamera.cameras[0]);
		}
		TileView(bimengine);
	})
	document.getElementById(camera.uuid + "minButton").addEventListener("click", function(res) {
		//最小化窗口
		let uuid = res.target.id.replace("minButton", "");
		let index = bimengine.ArrayCamera.cameras.findIndex(x => x.uuid == uuid);
		if (index != -1) {
			let camera_ = bimengine.ArrayCamera.cameras[index]
			camera.IsVisibility = false;
			TileView(bimengine);
		}
	})
	document.getElementById(camera.uuid + "maxButton").addEventListener("click", function(res) {
		//最大化窗口,除了自己，其他人全部最小化
		let uuid = res.target.id.replace("maxButton", "");
		let index = bimengine.ArrayCamera.cameras.findIndex(x => x.uuid == uuid);
		if (index != -1) {
			let camera_ = bimengine.ArrayCamera.cameras[index]
			console.log(camera_.name)
			for (var ca of bimengine.ArrayCamera.cameras) {
				if (ca.uuid != camera_.uuid) {
					ca.IsVisibility = false;
					ca.IsActive = false;
				}
			}
			camera_.IsActive = true;
			camera_.IsVisibility = true;
			multiview.ReplaceView(bimEngine, camera_);
			TileView(bimengine);
		}
	})
}
