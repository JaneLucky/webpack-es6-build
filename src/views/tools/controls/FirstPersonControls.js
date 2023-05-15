import {
	FirstPersonCameraControl
} from '@/three/controls/firstPersonCameraControl.js';
import {
	SetDeviceStyle
} from "@/views/tools/style/deviceStyleSet.js"
import {
	CreateSvg
} from "@/views/tools/common/index.js"
import {
	getDeviceType
} from "@/utils/device"
export function firstPersonControls(_Engine) {
	require('@/views/tools/style/' + SetDeviceStyle() + '/FirstPersonRoaming.scss')
	require('@/views/tools/style/' + SetDeviceStyle() + '/FormStyle.scss')
	var _firstPersonControls = new Object();
	let AnimationFrame;
	let roam_dialog, header_max, header_min, header_main;
	let _container = _Engine.scene.renderer.domElement.parentElement;
	let speed = 1;
	_firstPersonControls.isActive = false
	//激活
	_firstPersonControls.Active = function() {
		_Engine.scene.controls && (_Engine.scene.controls.enabled = false)
		if (!_firstPersonControls.controls) {
			_firstPersonControls.controls = new FirstPersonCameraControl(_Engine, _Engine.scene.camera, _Engine.scene
				.renderer.domElement, _Engine.GetAllVisibilityModel());
			_firstPersonControls.controls.name = "FirstPersonControls"
			/* 属性参数默认 */
			let settings = {
				firstPerson: true,
				gravity: false, // 重力
				collision: false, // 碰撞
				positionEasing: true,
				speed: 0.02, // 速度
				minMap: false //是否开启小地图
			};
			_firstPersonControls.controls.enabled = settings.firstPerson;
			_firstPersonControls.controls.applyGravity = settings.gravity;
			_firstPersonControls.controls.applyCollision = settings.collision;
			_firstPersonControls.controls.positionEasing = settings.positionEasing;
			_firstPersonControls.controls.moveSpeed = settings.speed;
			_firstPersonControls.controls.minMap = settings.minMap;
		}
		_firstPersonControls.controls.enabled = true;
		_firstPersonControls.isActive = true
		CreatorRoamDialog() //创建弹框UI
		_Engine.MinMap.show(); //打开小地图
		
		window.addEventListener('resize', onWindowResize, false);
		render();
	}
	//关闭
	_firstPersonControls.DisActive = function() {
		_Engine.scene.controls && (_Engine.scene.controls.enabled = true)
		window.removeEventListener('resize', onWindowResize)
		cancelAnimationFrame(AnimationFrame) //清除动画
		_firstPersonControls.isActive = false
		CloseRoamDialog()


		_Engine.MinMap.close(); //关闭小地图ss
		_firstPersonControls.controls.enabled = false;
		_firstPersonControls.controls._isEnabled = false;
	}

	function CreatorRoamDialog() {
		let deviceType = getDeviceType()
		if (deviceType === "Mobile") {
			CreatorRoamMobileController()
		}
		CreatorRoamPcDialog()
	}

	function CloseRoamDialog() {
		let deviceType = getDeviceType()
		if (deviceType === "Mobile") {
			GetRootDom().style.display = "none"; //关闭弹框UI
		}
		roam_dialog.style.display = "none"; //关闭弹框UI
		roam_dialog.removeEventListener("mousedown", _onMouseDown);
		//适配移动端
		InitDomStatus()
	}

	function CreatorRoamPcDialog() {
		if (roam_dialog) {
			roam_dialog.style.display = "block"; //关闭弹框UI
			roam_dialog.addEventListener("mousedown", _onMouseDown);
			return
		}
		roam_dialog = document.createElement("div");
		roam_dialog.addEventListener("mousedown", _onMouseDown);

		//适配移动端
		if (_Engine.DeviceType === "Mobile") {
			roam_dialog.className = "Roam_Dialog-Mobile";
		} else {
			roam_dialog.className = "Roam_Dialog";
		}

		let header_contain = document.createElement("div");
		header_contain.className = "Header_Contain"
		roam_dialog.appendChild(header_contain);

		let header_title = document.createElement("div")
		header_title.className = "Header_Title"
		header_title.innerText = "漫游设置"
		header_contain.appendChild(header_title);

		let header_btns = document.createElement("div")
		header_btns.className = "Header_Btns"
		header_contain.appendChild(header_btns);

		header_min = document.createElement("div")
		header_min.className = "Header_Min Btn"
		header_min.onclick = () => {
			header_max.style.display = "block"
			header_min.style.display = "none"
			header_main.style.display = "none"
		}
		let min_inside = document.createElement("div")
		min_inside.className = "Header_Min_Inside"
		header_min.appendChild(min_inside);
		header_btns.appendChild(header_min);

		header_max = document.createElement("div")
		header_max.className = "Header_Max Btn"
		header_max.onclick = () => {
			header_max.style.display = "none"
			header_min.style.display = "block"
			header_main.style.display = "block"
		}
		header_btns.appendChild(header_max);

		let header_close = document.createElement("div")
		header_close.className = "Header_Close Btn"
		header_close.innerText = "×"
		header_close.onclick = () => {
			// _Engine.FirstPersonControls.DisActive()
			let item = _Engine.TopMenu.MenuList.filter(item => item.label === "漫游")[0]
			item.domEl.click()
		}
		header_btns.appendChild(header_close);

		header_main = document.createElement("div");
		header_main.className = "Header_Main Btn"
		roam_dialog.appendChild(header_main);
		let form_contain = document.createElement("div");
		form_contain.className = "Form_Contain"
		header_main.appendChild(form_contain);

		let form_item_0 = document.createElement("div");
		form_item_0.className = "Form_Item"
		form_contain.appendChild(form_item_0);
		let form_item_label_0 = document.createElement("div");
		form_item_label_0.className = "Form_Item_Label"
		form_item_label_0.innerText = "小地图"
		form_item_0.appendChild(form_item_label_0);
		let input_item_0 = document.createElement("input")
		input_item_0.className = "switch"
		input_item_0.type = "checkbox"
		input_item_0.checked = _firstPersonControls.controls.minMap
		input_item_0.onchange = (e) => {
			_firstPersonControls.controls.minMap = e.target.checked
			if (e.target.checked) {
				_Engine.MinMap.show(); //打开小地图
			} else {
				_Engine.MinMap.close(); //关闭小地图
			}
		}
		form_item_0.appendChild(input_item_0);

		let form_item_1 = document.createElement("div");
		form_item_1.className = "Form_Item"
		form_contain.appendChild(form_item_1);
		let form_item_label_1 = document.createElement("div");
		form_item_label_1.className = "Form_Item_Label"
		form_item_label_1.innerText = "重力"
		form_item_1.appendChild(form_item_label_1);
		let input_item_1 = document.createElement("input")
		input_item_1.className = "switch"
		input_item_1.type = "checkbox"
		input_item_1.checked = _firstPersonControls.controls.applyGravity
		input_item_1.onchange = (e) => {
			_Engine.FirstPersonControls.controls.applyGravity = e.target.checked;
		}
		form_item_1.appendChild(input_item_1);

		let form_item_2 = document.createElement("div");
		form_item_2.className = "Form_Item"
		form_contain.appendChild(form_item_2);
		let form_item_label_2 = document.createElement("div");
		form_item_label_2.className = "Form_Item_Label"
		form_item_label_2.innerText = "碰撞"
		form_item_2.appendChild(form_item_label_2);
		let input_item_2 = document.createElement("input")
		input_item_2.className = "switch"
		input_item_2.type = "checkbox"
		input_item_2.checked = _firstPersonControls.controls.applyCollision
		input_item_2.onchange = (e) => {
			_Engine.FirstPersonControls.controls.applyCollision = e.target.checked;
		}
		form_item_2.appendChild(input_item_2);

		let form_item_3 = document.createElement("div");
		form_item_3.className = "Form_Item"
		form_contain.appendChild(form_item_3);
		let form_item_label_3 = document.createElement("div");
		form_item_label_3.className = "Form_Item_Label"
		form_item_label_3.innerText = "速度"
		form_item_3.appendChild(form_item_label_3);


		let btn_sub_contain = document.createElement("div");
		btn_sub_contain.className = "Btn_Contain"
		let btn_sub_icon = CreateSvg("icon-jianhao")
		btn_sub_contain.appendChild(btn_sub_icon)
		btn_sub_contain.onclick = (e) => {
			if (speed > 1) {
				speed = speed / 2
				input_item_3.innerText = speed + "X"
				_Engine.FirstPersonControls.controls.moveSpeed = 0.02 * speed
			}

		}
		form_item_3.appendChild(btn_sub_contain);

		let input_item_3 = document.createElement("div")
		input_item_3.className = "Speed_Text"
		input_item_3.innerText = speed + "X"
		form_item_3.appendChild(input_item_3);

		let btn_add_contain = document.createElement("div");
		btn_add_contain.className = "Btn_Contain"
		let btn_add_icon = CreateSvg("icon-jiahao")
		btn_add_contain.appendChild(btn_add_icon)
		btn_add_contain.onclick = (e) => {
			if (speed < 16) {
				speed = speed * 2
				input_item_3.innerText = speed + "X"
				_Engine.FirstPersonControls.controls.moveSpeed = 0.02 * speed
			}
		}
		form_item_3.appendChild(btn_add_contain);
		_container.appendChild(roam_dialog);

		//适配移动端
		InitDomStatus()
	}

	function _onMouseDown(e) {
		var left = roam_dialog.offsetLeft;
		var top = roam_dialog.offsetTop;
		//计算出鼠标的位置与元素位置的差值。
		var cleft = e.clientX - left;
		var ctop = e.clientY - top;
		roam_dialog.style.cursor = "move";
		document.onmousemove = function(doc) {
			//计算出移动后的坐标。
			var moveLeft = doc.clientX - cleft;
			var moveTop = doc.clientY - ctop;
			let maxWidth = (_container.offsetWidth - roam_dialog.offsetWidth)
			let maxHeight = (_container.offsetHeight - roam_dialog.offsetHeight)
			if (moveLeft < 0) {
				moveLeft = 0
			}
			if (moveTop < 0) {
				moveTop = 0
			}
			if (moveLeft > maxWidth) {
				moveLeft = maxWidth
			}
			if (moveTop > maxHeight) {
				moveTop = maxHeight
			}
			//当移动位置在范围内时，元素跟随鼠标移动。
			roam_dialog.style.left = moveLeft + "px";
			roam_dialog.style.top = moveTop + "px";
		}

		document.onmouseup = function() {
			roam_dialog.style.cursor = "auto";
			document.onmousemove = function() {}
		};
	}

	function CreatorRoamMobileController() {
		let mobileRoamContainer = GetRootDom();
		if (mobileRoamContainer) {
			mobileRoamContainer.style.display = "block"
			return
		}
		mobileRoamContainer = document.createElement("div");
		mobileRoamContainer.className = "MobileRoamContainer";
		_container.appendChild(mobileRoamContainer);
		let containCircle = document.createElement("div");
		containCircle.className = "containCircle";
		mobileRoamContainer.appendChild(containCircle);
		//创建控制器
		let controllerPanel = document.createElement("div")
		controllerPanel.className = "controllerPanel"
		let ball = document.createElement("div")
		ball.className = "ball"
		controllerPanel.appendChild(ball);

		const BLENDER_DIAMETER = 100; //圆形混合器直径
		const POINTER_DIAMETER = 40; //可拖动指示器直径
		const BLENDER_BORDER_WIDTH = 2; // 圆形混合器边宽
		const BLENDER_RADIUS = (BLENDER_DIAMETER - BLENDER_BORDER_WIDTH) * 0.5; // 圆形混合器半径
		const POINTER_RADIUS = POINTER_DIAMETER * 0.5; // 可拖动指示器半径
		// 可拖动指示器中心点-非圆心点,是css相对圆形混合器的位置 top/left
		const center = {
			x: BLENDER_RADIUS - POINTER_RADIUS,
			y: BLENDER_RADIUS - POINTER_RADIUS,
		};
		controllerPanel.style.width = BLENDER_DIAMETER + 'px'
		controllerPanel.style.height = BLENDER_DIAMETER + 'px'
		controllerPanel.style.borderWidth = BLENDER_BORDER_WIDTH + 'px'
		ball.style.width = POINTER_DIAMETER + 'px'
		ball.style.height = POINTER_DIAMETER + 'px'
		ball.style.left = center.x + 'px'
		ball.style.top = center.y + 'px'

		function getPositionByRadian(radian, radius) {
			const x = radius * Math.cos(radian) + center.x;
			const y = radius * Math.sin(radian) + center.y;
			return {
				x,
				y
			};
		};
		ball.addEventListener('touchstart', (e) => {
			// 鼠标按下，计算当前元素距离可视区的距离
			const originX = e.targetTouches[0].clientX - ball.offsetLeft - POINTER_RADIUS;
			const originY = e.targetTouches[0].clientY - ball.offsetTop - POINTER_RADIUS;
			ball.addEventListener('touchmove', (e) => {
				// 通过事件委托，计算移动的距离
				const left = e.targetTouches[0].clientX - POINTER_RADIUS - originX;
				const top = e.targetTouches[0].clientY - POINTER_RADIUS - originY;
				const dx = left - center.x;
				const dy = top - center.y;
				// 计算当前鼠标与中心点的弧度
				const radian = Math.atan2(dy, dx);
				// 计算当前鼠标与中心点距离
				const dist = Math.sqrt(dx * dx + dy * dy);
				const radius = dist >= BLENDER_RADIUS ? BLENDER_RADIUS : dist;
				// 根据半径与弧度计算 x, y
				const {
					x,
					y
				} = getPositionByRadian(radian, radius);
				ball.style.left = x + 'px'
				ball.style.top = y + 'px'

				_firstPersonControls.controls._camerLocalDirection.x = 1 * ((x - center.x) /
					BLENDER_RADIUS);
				_firstPersonControls.controls._camerLocalDirection.z = -1 * ((y - center.y) /
					BLENDER_RADIUS);

			})
			ball.addEventListener('touchend', (e) => {
				_firstPersonControls.controls._camerLocalDirection.x = 0;
				_firstPersonControls.controls._camerLocalDirection.z = 0;
				ball.style.left = center.x + 'px'
				ball.style.top = center.y + 'px'
			})

		})

		containCircle.appendChild(controllerPanel);
		let top_icon = CreateSvg("icon-roam-up")
		controllerPanel.appendChild(top_icon)
		top_icon.className.baseVal = top_icon.className.baseVal + " icon-roam-up"
		let down_icon = CreateSvg("icon-roam-down")
		controllerPanel.appendChild(down_icon)
		down_icon.className.baseVal = down_icon.className.baseVal + " icon-roam-down"
		let left_icon = CreateSvg("icon-roam-left")
		controllerPanel.appendChild(left_icon)
		left_icon.className.baseVal = left_icon.className.baseVal + " icon-roam-left"
		let right_icon = CreateSvg("icon-roam-right")
		controllerPanel.appendChild(right_icon)
		right_icon.className.baseVal = right_icon.className.baseVal + " icon-roam-right"

		//创建选择框
		let selectPanel = document.createElement("div")
		selectPanel.className = "SelectPanel"
		let insideContain = document.createElement("div")
		insideContain.className = "InsideContain"
		let controlContain = document.createElement("div")
		controlContain.className = "ControlContain"
		let to_top_icon = CreateSvg("icon-roam-up") //Q
		to_top_icon.addEventListener('touchstart', (e) => {
			_firstPersonControls.controls._camerLocalDirection.y = 1;
			to_top_icon.addEventListener('touchend', (e) => {
				_firstPersonControls.controls._camerLocalDirection.y = 0;
			})
		})
		controlContain.appendChild(to_top_icon)
		to_top_icon.className.baseVal = top_icon.className.baseVal + " to_top"
		let to_down_icon = CreateSvg("icon-roam-down") //E
		to_down_icon.addEventListener('touchstart', (e) => {
			_firstPersonControls.controls._camerLocalDirection.y = -1;
			to_down_icon.addEventListener('touchend', (e) => {
				_firstPersonControls.controls._camerLocalDirection.y = 0;
			})
		})
		controlContain.appendChild(to_down_icon)
		to_down_icon.className.baseVal = top_icon.className.baseVal + " to_down"

		insideContain.appendChild(controlContain);

		selectPanel.appendChild(insideContain);
		containCircle.appendChild(selectPanel);

	}

	function GetRootDom() {
		let root = _container.getElementsByClassName("MobileRoamContainer")[0]
		return root
	}

	function InitDomStatus() {
		//适配移动端
		if (_Engine.DeviceType === "Mobile") {
			header_max.style.display = "block"
			header_min.style.display = "none"
			header_main.style.display = "none"
		} else {
			header_max.style.display = "none"
			header_min.style.display = "block"
			header_main.style.display = "block"
		}
	}

	/* 窗口变动触发 */
	function onWindowResize() {
		_Engine.scene.camera.aspect = window.innerWidth / window.innerHeight;
		_Engine.scene.camera.updateProjectionMatrix();
		_Engine.scene.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	/* 数据更新 */
	function render() {
		AnimationFrame = requestAnimationFrame(render);
		renderCommand();
	}

	function renderCommand() {
		_Engine.scene.renderer.render(_Engine.scene, _Engine.scene.camera); //执行渲染操作 
		_firstPersonControls.controls && _firstPersonControls.controls.enabled && _firstPersonControls.controls.update();
		// 小地图
		_Engine.MinMap && _Engine.MinMap.visible && _Engine.MinMap.renderUpdata();
		_Engine.RenderSAO.render();
		_Engine.RenderPost.render();
	}
	return _firstPersonControls
}