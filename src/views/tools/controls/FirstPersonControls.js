import {
	FirstPersonCameraControl
} from '@/three/controls/firstPersonCameraControl.js';
import "../style/FirstPersonRoaming.scss"
import "../style/FormStyle.scss"
export function firstPersonControls(bimengine) {
	var _firstPersonControls = new Object();
	let AnimationFrame;
	let roam_dialog, header_max, header_min, header_main;
	let _container = bimengine.scene.renderer.domElement.parentElement;
	_firstPersonControls.isActive = false
	//激活
	_firstPersonControls.Active = function() {
		bimengine.scene.controls && (bimengine.scene.controls.enabled = false)
		_firstPersonControls.controls = new FirstPersonCameraControl(bimengine.scene.camera, bimengine.scene.renderer.domElement,bimengine.GetAllVisibilityModel());
		_firstPersonControls.controls.name = "FirstPersonControls"
		_firstPersonControls.isActive = true
		
		bimengine.MinMap.show();//打开小地图
		CreatorRoamDialog() //创建弹框UI
		/* 属性参数默认 */
		let settings = {
			firstPerson: true,
			gravity: false,
			collision: false,
			positionEasing: true,
			speed:0.02
		}; 
		_firstPersonControls.controls.enabled = settings.firstPerson;
		_firstPersonControls.controls.applyGravity = settings.gravity;
		_firstPersonControls.controls.applyCollision = settings.collision;
		_firstPersonControls.controls.positionEasing = settings.positionEasing; 
		_firstPersonControls.controls.moveSpeed = settings.speed; 
		window.addEventListener('resize', onWindowResize, false);
		render();
	}
	//关闭
	_firstPersonControls.DisActive = function() {
		bimengine.scene.controls && (bimengine.scene.controls.enabled = true)
		window.removeEventListener('resize', onWindowResize)
		cancelAnimationFrame(AnimationFrame) //清除动画
		_firstPersonControls.isActive = false
		
		roam_dialog.style.display = "none";//关闭弹框UI
		header_max.style.display = "none";
		header_min.style.display = "block";
		header_main.style.display = "block";
		bimengine.MinMap.close();//关闭小地图
	}

	function CreatorRoamDialog(){
		if(roam_dialog){
			roam_dialog.style.display = "block";//关闭弹框UI
			return
		}
		roam_dialog = document.createElement("div");
		roam_dialog.className = "Roam_Dialog";
		
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
		header_min.onclick = ()=>{
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
		header_max.style.display = "none"
		header_max.onclick = ()=>{
			header_max.style.display = "none"
			header_min.style.display = "block"
			header_main.style.display = "block"
		}
		header_btns.appendChild(header_max);
	
		let header_close = document.createElement("div")
		header_close.className = "Header_Close Btn"
		header_close.innerText = "×"
		header_close.onclick = ()=>{
			bimengine.FirstPersonControls.DisActive()
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
		input_item_0.checked = true
		input_item_0.onchange = (e)=>{
			console.log(e.target.checked)
			if(e.target.checked){
				bimengine.MinMap.show();//打开小地图
			}else{
				bimengine.MinMap.close();//关闭小地图
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
		input_item_1.checked = false
		input_item_1.onchange = (e)=>{
			bimengine.FirstPersonControls.controls.applyGravity = e.target.checked;
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
		input_item_2.checked = false
		input_item_2.onchange = (e)=>{
			bimengine.FirstPersonControls.controls.applyCollision = e.target.checked;
		}
		form_item_2.appendChild(input_item_2);
	
		let form_item_3 = document.createElement("div");
		form_item_3.className = "Form_Item"
		form_contain.appendChild(form_item_3);
		let form_item_label_3 = document.createElement("div");
		form_item_label_3.className = "Form_Item_Label"
		form_item_label_3.innerText = "速度"
		form_item_3.appendChild(form_item_label_3);
		let input_item_3 = document.createElement("input")
		input_item_3.className = "inputtext"
		input_item_3.type = "number"
		input_item_3.min = 1
		input_item_3.max = 100
		input_item_3.step = 1
		input_item_3.value = 2
		input_item_3.onchange = (e)=>{
			bimengine.FirstPersonControls.controls.moveSpeed = e.target.value/100
		}
		form_item_3.appendChild(input_item_3);
	
		_container.appendChild(roam_dialog);
	}
	
	/* 窗口变动触发 */
	function onWindowResize() {
		bimengine.scene.camera.aspect = window.innerWidth / window.innerHeight;
		bimengine.scene.camera.updateProjectionMatrix();
		bimengine.scene.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	/* 数据更新 */
	function render() {
		AnimationFrame = requestAnimationFrame(render);
		_firstPersonControls.controls && _firstPersonControls.controls.enabled && _firstPersonControls.controls.update();
	}
	return _firstPersonControls
}
