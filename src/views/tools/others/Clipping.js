const THREE = require('three')
import '@/three/controls/TransformControls.js';
//模型单面剖切
export function ClippingSingleSide(scene, status, type) {
	let plane, control;
	let planes = [{
			type: 'X轴',
			vector: new THREE.Vector3(-1, 0, 0),
			color: 0xff0000,
			show: 'showX'
		},
		{
			type: 'Y轴',
			vector: new THREE.Vector3(0, -1, 0),
			color: 0x00ff00,
			show: 'showY'
		},
		{
			type: 'Z轴',
			vector: new THREE.Vector3(0, 0, -1),
			color: 0x0000ff,
			show: 'showZ'
		},
	]
	control = window.bimEngine.scene.children.filter(item => item.name === "TransformControlsClipping")[0] //获得控制器

	clearClippingMesh() //删除之前创建的ClippingMesh剖切辅助对象，并还原所有构建

	status && init() // 根据状态初始化
	function init() {
		let BoundingBox = getClippingMeshSizeAndPosition() //获得辅助对象的宽高和位置
		plane = new THREE.Plane(BoundingBox.plane.vector, 0) //创建二维切割平面
		plane.constant = BoundingBox.constant //设置初始切割距离
		//创建切割示意面和控制器，并绑定
		const geometry = new THREE.PlaneGeometry(BoundingBox.width, BoundingBox.height);
		const material = new THREE.MeshBasicMaterial({
			color:"#252525",
			opacity: 0.2,
			wireframeLinewidth: 10,
			depthWrite: false,
			side: THREE.DoubleSide,
			transparent: true, // 设置为true，opacity才会生效
		}); // wireframe: true, 
		const mesh = new THREE.Mesh(geometry, material); //辅助对象,用于示意剖切面
		mesh.visible = false
		let GroupBox = new THREE.Group();
		GroupBox.add(mesh);
		GroupBox.name = "ClippingMesh"
		GroupBox.position.set(BoundingBox.position.x, BoundingBox.position.y, BoundingBox.position.z)
		BoundingBox.direction && (GroupBox.rotation[BoundingBox.direction] = Math.PI / 2)
		scene.add(GroupBox);
		let bufferGeometry = new THREE.BufferGeometry()
		let positions = []
		var edges = new THREE.EdgesGeometry(geometry, 1); //大于89度才添加线条 
		var ps = edges.attributes.position.array;
		for (var i = 0; i < ps.length; i = i + 3) {
			let point = new THREE.Vector3(ps[i],ps[i+1],ps[i+2]);
			let newpoint = point.clone()
			positions.push(newpoint.x);
			positions.push(newpoint.y);
			positions.push(newpoint.z);
		} 
		bufferGeometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(positions, 3)
		)
		const bufferline = new THREE.LineSegments(
			bufferGeometry,
			new THREE.LineBasicMaterial({
				color: '#E3B951'
			})
		)
		GroupBox.add(bufferline);
		control.attach(GroupBox);//控制器和切割示意面绑定

		control[BoundingBox.plane.show] = true //显示控制器对应需要显示的坐标轴
		control.addEventListener('change', render); //控制器监听更新视图
		control.addEventListener('dragging-changed', function(event) { //鼠标拖动开始和结束，开始禁止控制器放缩/旋转视图，结束放开控制器的控制
			scene.controls.enabled = !event.value;
			if(scene.controls.enabled){
				mesh.visible = false
			}else{
				mesh.visible = true
			}
		});
		setModelClippingPlanes(plane) //设置所有构建的clippingPlanes
	}
	//实时修改plane.constant，以实现模型剖切
	function render(res) {
		switch (type) {
			case 'X轴':
				plane.constant = res.target.worldPosition.x - 0
				break;
			case 'Y轴':
				plane.constant = res.target.worldPosition.y - 0
				break;
			case 'Z轴':
				plane.constant = res.target.worldPosition.z - 0
				break;
		}
	}

	//获得辅助对象的宽高和位置
	function getClippingMeshSizeAndPosition() {
		let BoundingBox = window.bimEngine.ViewCube.getBoundingBox()
		let width = 0,
			height = 0,
			direction = null,
			position, plane, constant;
		position = BoundingBox.center
		switch (type) {
			case 'X轴':
				direction = 'y'
				width = BoundingBox.max.z - BoundingBox.min.z;
				height = BoundingBox.max.y - BoundingBox.min.y;
				position.x = BoundingBox.max.x
				constant = BoundingBox.max.x
				plane = planes[0];
				break;
			case 'Y轴':
				direction = 'x'
				width = BoundingBox.max.x - BoundingBox.min.x;
				height = BoundingBox.max.z - BoundingBox.min.z;
				position.y = BoundingBox.max.y
				constant = BoundingBox.max.y
				plane = planes[1];
				break;
			case 'Z轴':
				width = BoundingBox.max.x - BoundingBox.min.x;
				height = BoundingBox.max.y - BoundingBox.min.y;
				position.z = BoundingBox.max.z
				constant = BoundingBox.max.z
				plane = planes[2];
				break;
		}
		return {
			position,
			width,
			height,
			direction,
			plane,
			constant
		}
	}

	//设置所有构建的clippingPlanes
	function setModelClippingPlanes(plane) {
		let models = window.bimEngine.scene.children;
		models.forEach(item => {
			if (item.name === "rootModel") {
				if(item.material instanceof Array){
					item.material.forEach(ii => {
						ii.clippingPlanes = plane ? [plane] : null
					})
					item.cloneMaterialArray.forEach(ii => {
						ii.clippingPlanes = plane ? [plane] : null
					})
				} else{
					item.material.clippingPlanes = plane ? [plane] : null
					item.cloneMaterialArray.clippingPlanes = plane ? [plane] : null
				}
			}
		})
	}

	//删除之前创建的ClippingMesh剖切辅助对象，并还原所有构建
	function clearClippingMesh() {
		planes.map(item => {
			control[item.show] = false
		})
		setModelClippingPlanes() //还原所有构建
		//删除之前创建的ClippingMesh剖切辅助对象
		let models = window.bimEngine.scene.children;
		for (let i = models.length - 1; i >= 0; i--) {
			if (models[i].name === "ClippingMesh") {
				if (status) {
					window.bimEngine.scene.remove(models[i])
				} else {
					models[i].visible = false
				}
			}
		}
	}
}

//模型多面剖切
export function ClippingMultiSide(scene, status) {
	let planes = []; //所有剖切plane集合
	let BoundingBox = window.bimEngine.ViewCube.getBoundingBox(); //场景中的模型包围矩形框
	let MultiSide = getMultiSideSizeAndPosition();//6个剖切面的参数
	let center = BoundingBox.center;//中心点-剖切过程中变化
	let size = {//剖切矩形大小-剖切过程中变化
		x:BoundingBox.max.x-BoundingBox.min.x,
		y:BoundingBox.max.y-BoundingBox.min.y,
		z:BoundingBox.max.z-BoundingBox.min.z,
	}

	clearClippingMesh(); //删除之前创建的ClippingMesh剖切辅助对象，并还原所有构建

	status && init() // 根据状态初始化
	function init() {
		drawClippingBox(size,center,true);
		const material = new THREE.MeshBasicMaterial({
			color:"#252525",
			opacity: 0.2,
			wireframeLinewidth: 10,
			depthWrite: false,
			side: THREE.DoubleSide,
			transparent: true, // 设置为true，opacity才会生效
		}); // 剖切面材质

		for (let i = 0; i < MultiSide.length; i++) { //绘制6个剖切面，6个控制器和监听函数
			//控制器
			let control = new THREE.TransformControls(scene.camera, scene.renderer.domElement); //创建Transform控制器
			control.size = 0.5;
			control.name = "TransformControlsClipping-MultiSide"
			control.data_name = MultiSide[i].name
			control.data_opposite_size = MultiSide[i].oppositeSize
			control.data_show = MultiSide[i].show
			control.visible = false
			MultiSide[i].show === "showX" ? control.showX = true : control.showX = false
			MultiSide[i].show === "showY" ? control.showY = true : control.showY = false
			MultiSide[i].show === "showZ" ? control.showZ = true : control.showZ = false
			scene.add(control); //控制器添加到场景中

			//剖切对象
			let plane = new THREE.Plane(MultiSide[i].vector, 0) //创建二维平面
			plane.visible = true
			planes = [...planes, plane]
			switch (MultiSide[i].type) {
				case 'X轴':
					plane.constant = BoundingBox.max.x - 0
					break;
				case '-X轴':
					plane.constant = -BoundingBox.min.x - 0
					break;
				case 'Y轴':
					plane.constant = BoundingBox.max.y - 0
					break;
				case '-Y轴':
					plane.constant = -BoundingBox.min.y - 0
					break;
				case 'Z轴':
					plane.constant = BoundingBox.max.z - 0
					break;
				case '-Z轴':
					plane.constant = -BoundingBox.min.z - 0
					break;
			} 
			//剖切面
			let geometry = new THREE.PlaneGeometry(MultiSide[i].width, MultiSide[i].height);
			geometry.name = MultiSide[i].name
			let mesh = new THREE.Mesh(geometry, material); //辅助对象,用于示意剖切面
			mesh.name = "ClippingMesh"
			mesh.data_name = MultiSide[i].name
			mesh.data_show = MultiSide[i].show
			mesh.visible = false
			mesh.position.set(MultiSide[i].position.x, MultiSide[i].position.y, MultiSide[i].position.z)
			MultiSide[i].direction && (mesh.rotation[MultiSide[i].direction] = Math.PI / 2)
			scene.add(mesh);

			//控制器和剖切面绑定
			control.attach(mesh);

			//控制器监听函数
			control.addEventListener('change', render); //控制器监听更新视图
			control.addEventListener('dragging-changed', function(event) { //鼠标拖动开始和结束，开始禁止控制器放缩/旋转视图，结束放开控制器的控制
				scene.controls.enabled = !event.value;
				if(scene.controls.enabled){
					mesh.visible = false
					let models = window.bimEngine.scene.children;
					let controlPositonList = models.filter(item=>item.name === "TransformControlsClipping-MultiSide")
					let sxmax=0,symax=0,szmax=0,sxmin=0,symin=0,szmin=0;
					controlPositonList.map(item=>{
						switch (item.data_name) {
							case "side-x-max":
								sxmax = item.worldPosition.x
								break;
							case "side-x-min":
								sxmin = item.worldPosition.x
								break;
							case "side-y-max":
								symax = item.worldPosition.y
								break;
							case "side-y-min":
								symin = item.worldPosition.y
								break;
							case "side-z-max":
								szmax = item.worldPosition.z
								break;
							case "side-z-min":
								szmin = item.worldPosition.z
								break;
						}
					})
					size = {
						x:sxmax-sxmin,
						y:symax-symin,
						z:szmax-szmin,
					}
					center = {
						x:sxmin + size.x/2,
						y:symin + size.y/2,
						z:szmin + size.z/2,
					}
					drawClippingBox(size,center,event.target.data_show);
				}else{
					mesh.visible = true
				}
			});
			
			//实时修改plane.constant，以实现模型剖切
			function render(res) {
				switch (MultiSide[i].type) {
					case 'X轴':
						plane.constant = res.target.worldPosition.x - 0
						break;
					case '-X轴':
						plane.constant = -res.target.worldPosition.x - 0
						break;
					case 'Y轴':
						plane.constant = res.target.worldPosition.y - 0
						break;
					case '-Y轴':
						plane.constant = -res.target.worldPosition.y - 0
						break;
					case 'Z轴':
						plane.constant = res.target.worldPosition.z - 0
						break;
					case '-Z轴':
						plane.constant = -res.target.worldPosition.z - 0
						break;
				} 
			}
		}
		setModelClippingPlanes(planes) //设置所有构建的clippingPlanes
	}

	//绘制剖切矩形
	function drawClippingBox(size,position,showType,first=false) {
		let models = window.bimEngine.scene.children;
		if(!first){
			//删除上次的示例剖切矩形
			for (let i = models.length - 1; i >= 0; i--) {
				if (models[i].name === "ClippingBox") {
					window.bimEngine.scene.remove(models[i]);
					break;
				}
			}
		}
		//绘制新的示例剖切矩形
		const boxGeometry = new THREE.BoxGeometry( size.x, size.y, size.z );
		const boxMaterial = new THREE.MeshBasicMaterial({
			color:"#252525",
			opacity: 0.0001,
			wireframeLinewidth: 10,
			depthWrite: false,
			side: THREE.DoubleSide,
			transparent: true, // 设置为true，opacity才会生效
		});
		const ClippingBox = new THREE.Mesh( boxGeometry, boxMaterial );

		let GroupBox = new THREE.Group();
		GroupBox.add(ClippingBox);
		GroupBox.name = "ClippingBox"
		GroupBox.position.set(position.x, position.y, position.z)
		BoundingBox.direction && (GroupBox.rotation[BoundingBox.direction] = Math.PI / 2)
		scene.add(GroupBox);
		let bufferGeometry = new THREE.BufferGeometry()
		let positions = []
		var edges = new THREE.EdgesGeometry(boxGeometry, 1); //大于89度才添加线条 
		var ps = edges.attributes.position.array;
		for (var i = 0; i < ps.length; i = i + 3) {
			let point = new THREE.Vector3(ps[i],ps[i+1],ps[i+2]);
			let newpoint = point.clone()
			positions.push(newpoint.x);
			positions.push(newpoint.y);
			positions.push(newpoint.z);
		} 
		bufferGeometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(positions, 3)
		)
		const bufferline = new THREE.LineSegments(
			bufferGeometry,
			new THREE.LineBasicMaterial({
				color: '#E3B951'
			})
		)
		GroupBox.add(bufferline);



		//处理剖切面大小位置
		if(!first){
			for (let i = models.length - 1; i >= 0; i--) {
				if (models[i].name === "ClippingMesh") {
					let beforeSize,width,height,pos
					switch (models[i].data_name) {
						case "side-x-max":
							beforeSize = MultiSide.filter(o=>o.name===models[i].data_name)[0]
							width = size.z
							height = size.y
							pos = {
								x: position.x+size.x/2,
								y: position.y,
								z: position.z,
							}
							models[i].scale.set(width/beforeSize.width,height/beforeSize.height,1);
							models[i].position.set(pos.x,pos.y,pos.z)
							break;
						case "side-x-min":
							beforeSize = MultiSide.filter(o=>o.name===models[i].data_name)[0]
							width = size.z
							height = size.y
							pos = {
								x: position.x-size.x/2,
								y: position.y,
								z: position.z,
							}
							models[i].scale.set(width/beforeSize.width,height/beforeSize.height,1);
							models[i].position.set(pos.x,pos.y,pos.z)
							break;
						case "side-y-max":
							beforeSize = MultiSide.filter(o=>o.name===models[i].data_name)[0]
							width = size.x
							height = size.z
							pos = {
								x: position.x,
								y: position.y+size.y/2,
								z: position.z,
							}
							models[i].scale.set(width/beforeSize.width,height/beforeSize.height,1);
							models[i].position.set(pos.x,pos.y,pos.z)
							break;
						case "side-y-min":
							beforeSize = MultiSide.filter(o=>o.name===models[i].data_name)[0]
							width = size.x
							height = size.z
							pos = {
								x: position.x,
								y: position.y-size.y/2,
								z: position.z,
							}
							models[i].scale.set(width/beforeSize.width,height/beforeSize.height,1);
							models[i].position.set(pos.x,pos.y,pos.z)
							break;
						case "side-z-max":
							beforeSize = MultiSide.filter(o=>o.name===models[i].data_name)[0]
							width = size.x
							height = size.y
							pos = {
								x: position.x,
								y: position.y,
								z: position.z+size.z/2,
							}
							models[i].scale.set(width/beforeSize.width,height/beforeSize.height,1);
							models[i].position.set(pos.x,pos.y,pos.z)
							break;
						case "side-z-min":
							beforeSize = MultiSide.filter(o=>o.name===models[i].data_name)[0]
							width = size.x
							height = size.y
							pos = {
								x: position.x,
								y: position.y,
								z: position.z-size.z/2,
							}
							models[i].scale.set(width/beforeSize.width,height/beforeSize.height,1);
							models[i].position.set(pos.x,pos.y,pos.z)
							break;
					}
				}
			}
		}
	}

	//设置所有构建的clippingPlanes
	function setModelClippingPlanes(planes) {
		let models = window.bimEngine.scene.children;
		models.forEach(item => {
			if (item.name === "rootModel") {
				if(item.material instanceof Array){
					item.material.forEach(ii => {
						ii.clippingPlanes = planes ? planes : null
					})
					item.cloneMaterialArray.forEach(ii => {
						ii.clippingPlanes = planes ? planes : null
					})
				}
				else{
					item.material.clippingPlanes = planes ? planes : null
					item.cloneMaterialArray.clippingPlanes = planes ? planes : null
				}
			}
		})
	}

	//删除之前创建的ClippingMesh剖切辅助对象，并还原所有构建
	function clearClippingMesh() {
		setModelClippingPlanes() //还原所有构建
		//删除之前创建的ClippingMesh剖切辅助对象
		let models = window.bimEngine.scene.children;
		for (let i = models.length - 1; i >= 0; i--) {
			if (models[i].name === "ClippingBox" || models[i].name === "ClippingMesh" || models[i].name ===
					"TransformControlsClipping-MultiSide") {
				window.bimEngine.scene.remove(models[i])
			}
		}
	}

	//获得6个剖切面和控制器所需参数
	function getMultiSideSizeAndPosition() {
		let center = BoundingBox.center;
		let list = [
			{
				name: 'side-z-max', //z轴上的平面1
				width: BoundingBox.max.x - BoundingBox.min.x,
				height: BoundingBox.max.y - BoundingBox.min.y,
				position: {
					x: center.x,
					y: center.y,
					z: BoundingBox.max.z,
				},
				show: 'showZ',
				direction: null,
				vector: new THREE.Vector3(0, 0, -1),
				type: "Z轴",
				oppositeSize:'side-z-min'//对立面
			},
			{
				name: 'side-z-min', //z轴上的平面2
				width: BoundingBox.max.x - BoundingBox.min.x,
				height: BoundingBox.max.y - BoundingBox.min.y,
				position: {
					x: center.x,
					y: center.y,
					z: BoundingBox.min.z,
				},
				show: 'showZ',
				direction: null,
				vector: new THREE.Vector3(0, 0, +1),
				type: "-Z轴",
				oppositeSize:'side-z-max'//对立面
			},
			{
				name: 'side-x-max', //x轴上的平面1
				width: BoundingBox.max.z - BoundingBox.min.z,
				height: BoundingBox.max.y - BoundingBox.min.y,
				position: {
					x: BoundingBox.max.x,
					y: center.y,
					z: center.z,
				},
				show: 'showX',
				direction: 'y',
				vector: new THREE.Vector3( -1, 0, 0),
				type: "X轴",
				oppositeSize:'side-x-min'//对立面
			},
			{
				name: 'side-x-min', //x轴上的平面2
				width: BoundingBox.max.z - BoundingBox.min.z,
				height: BoundingBox.max.y - BoundingBox.min.y,
				position: {
					x: BoundingBox.min.x,
					y: center.y,
					z: center.z,
				},
				show: 'showX',
				direction: 'y',
				vector: new THREE.Vector3( +1, 0, 0),
				type: "-X轴",
				oppositeSize:'side-x-max'//对立面
			},
			{
				name: 'side-y-max', //y轴上的平面1
				width: BoundingBox.max.x - BoundingBox.min.x,
				height: BoundingBox.max.z - BoundingBox.min.z,
				position: {
					x: center.x,
					y: BoundingBox.max.y,
					z: center.z,
				},
				show: 'showY',
				direction: 'x',
				vector: new THREE.Vector3(0, -1, 0),
				type: "Y轴",
				oppositeSize:'side-y-min'//对立面
			},
			{
				name: 'side-y-min', //y轴上的平面1
				width: BoundingBox.max.x - BoundingBox.min.x,
				height: BoundingBox.max.z - BoundingBox.min.z,
				position: {
					x: center.x,
					y: BoundingBox.min.y,
					z: center.z,
				},
				show: 'showY',
				direction: 'x',
				vector: new THREE.Vector3(0, +1, 0),
				type: "-Y轴",
				oppositeSize:'side-y-max'//对立面
			}
		]
		return list
	}
}
