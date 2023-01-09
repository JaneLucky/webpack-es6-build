const THREE = require('three')
import "./../style/RenderSetDialog.scss"
import "./../style/FormStyle.scss"

//渲染相关
/*
1. 设置光照
2. 设置阴影
3. 设置显示边线
4. 设置背景颜色等等 
*/

export function Render(bimengine) {
	var _render = new Object();
	_render.isActive = false;
	let render_set_dialog;
	let _container = bimengine.scene.renderer.domElement.parentElement;
	let bgColorList = [
		{
			id:'1',
			color:'linear-gradient(rgb(241, 243, 244), rgb(241, 243, 244))',
			status:false
		},
		{
			id:'2',
			color:'linear-gradient(rgb(40, 44, 53), rgb(248, 249, 249))',
			status:false
		},
		{
			id:'3',
			color:'linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255))',
			status:false
		},
		{
			id:'4',
			color:'linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0))',
			status:false
		},
		{
			id:'5',
			color:'linear-gradient(rgb(127, 191, 225), rgb(198, 226, 255))',
			status:false
		}
	];
	let lightColorList = [
		{
			id:'1',
			label:'照相亭',
			color:'rgb(226, 227, 224)'
		},
		{
			id:'2',
			label:'游泳池',
			color:'rgb(170, 168, 165)'
		},
		{
			id:'3',
			label:'户外',
			color:'rgb(152, 160, 176)'
		},
		{
			id:'4',
			label:'照相亭',
			color:'rgb(225, 227, 223)'
		},
		{
			id:'5',
			label:'田野',
			color:'rgb(199, 213, 227)'
		},
		{
			id:'6',
			label:'蓝天',
			color:'rgb(235, 235, 234)'
		},
		{
			id:'7',
			label:'暖光',
			color:'rgb(203, 204, 208)'
		},
		{
			id:'8',
			label:'冷光',
			color:'rgb(202, 203, 208)'
		}
	];
	
	//激活
	_render.Active = function() {
		_render.isActive = true
		CreatorSetDialog() //创建弹框UI
	}
	//关闭
	_render.DisActive = function() {
		_render.isActive = false
		render_set_dialog.style.display = "none";//关闭弹框UI
		render_set_dialog.style.left = "0px";
		render_set_dialog.style.top = "0px";
		render_set_dialog.removeEventListener("mousedown",_onMouseDown);
	}

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
			var rootmodel = bimengine.scene.children.filter(x => x.Name == "ModelEdges")[0];
			bimengine.scene.remove(rootmodel)
		}
	}
	//设置背景颜色
	_render.SetBackGroundColor = function(color) {
		bimengine.scene.renderer.domElement.parentElement.style.background = color;
	}
	//设置环境光
	_render.SetAmbientLightColor = function(color) {
		bimengine.scene.ambientLight.color = new THREE.Color(color);
	}
	//设置曝光强度
	_render.SetAmbientLightIntensity = function(val) {
		bimengine.scene.ambientLight.intensity = val;
	}
	//设置阴影强度


	
	function CreatorSetDialog(){
		if(render_set_dialog){
			render_set_dialog.style.display = "block";//关闭弹框UI
			render_set_dialog.addEventListener("mousedown",_onMouseDown);
			return
		}
		render_set_dialog = document.createElement("div");
		render_set_dialog.className = "Render-Set-Dialog";
		render_set_dialog.addEventListener("mousedown",_onMouseDown);
		
		let header_contain = document.createElement("div");
		header_contain.className = "Feader-Contain";
		
		let header_title = document.createElement("div");
		header_title.className = "Title";
		header_title.innerText = "引擎设置"
		let header_close= document.createElement("div");
		header_close.className = "Close-Btn";
		header_close.innerText = "×"
		header_close.onclick = ()=>{
			// _render.DisActive()
			let item = bimengine.TopMenu.MenuList.filter(item=>item.label === "引擎设置")[0]
			item.domEl.click()
		}
		header_contain.appendChild(header_title)
		header_contain.appendChild(header_close)
		render_set_dialog.appendChild(header_contain)

		let main_contain = document.createElement("div");
		main_contain.className = "Main-Contain";
		render_set_dialog.appendChild(main_contain)

		let module_header1 = document.createElement("div")
		module_header1.className = "Module-Header";
		let icon1 = document.createElement("div")
		icon1.className = "Icon";
		let title1 = document.createElement("div")
		title1.className = "Title";
		title1.innerText = "模型效果"
		module_header1.appendChild(icon1)
		module_header1.appendChild(title1)
		main_contain.appendChild(module_header1)


	
		let form_item_0 = document.createElement("div");
		form_item_0.className = "Form_Item"
		main_contain.appendChild(form_item_0);
		let form_item_label_0 = document.createElement("div");
		form_item_label_0.className = "Form_Item_Label"
		form_item_label_0.innerText = "地面阴影"
		form_item_0.appendChild(form_item_label_0);
		let input_item_0 = document.createElement("input")
		input_item_0.className = "switch"
		input_item_0.type = "checkbox"
		input_item_0.checked = true
		input_item_0.onchange = (e)=>{
			// console.log(e.target.checked)
		}
		form_item_0.appendChild(input_item_0);
	
		let form_item_1 = document.createElement("div");
		form_item_1.className = "Form_Item"
		main_contain.appendChild(form_item_1);
		let form_item_label_1 = document.createElement("div");
		form_item_label_1.className = "Form_Item_Label"
		form_item_label_1.innerText = "显示阴影"
		form_item_1.appendChild(form_item_label_1);
		let input_item_1 = document.createElement("input")
		input_item_1.className = "switch"
		input_item_1.type = "checkbox"
		input_item_1.checked = false
		input_item_1.onchange = (e)=>{
			// console.log(e.target.checked)
		}
		form_item_1.appendChild(input_item_1);
	
		let form_item_2 = document.createElement("div");
		form_item_2.className = "Form_Item"
		main_contain.appendChild(form_item_2);
		let form_item_label_2 = document.createElement("div");
		form_item_label_2.className = "Form_Item_Label"
		form_item_label_2.innerText = "显示边线"
		form_item_2.appendChild(form_item_label_2);
		let input_item_2 = document.createElement("input")
		input_item_2.className = "switch"
		input_item_2.type = "checkbox"
		input_item_2.checked = false
		input_item_2.onchange = (e)=>{
			_render.DisplayEdge(e.target.checked)
		}
		form_item_2.appendChild(input_item_2);



		let module_header2 = document.createElement("div")
		module_header2.className = "Module-Header";
		let icon2 = document.createElement("div")
		icon2.className = "Icon";
		let title2 = document.createElement("div")
		title2.className = "Title";
		title2.innerText = "场景光照"
		module_header2.appendChild(icon2)
		module_header2.appendChild(title2)
		main_contain.appendChild(module_header2)

		let form_item_3 = document.createElement("div");
		form_item_3.className = "Form_Item"
		main_contain.appendChild(form_item_3);
		let form_item_label_3 = document.createElement("div");
		form_item_label_3.className = "Form_Item_Label"
		form_item_label_3.innerText = "阴影强度"
		form_item_3.appendChild(form_item_label_3);
		let input_item_3 = document.createElement("input")
		input_item_3.className = "inputtext"
		input_item_3.type = "number"
		input_item_3.min = 0
		input_item_3.max = 1
		input_item_3.step = 0.1
		input_item_3.value = 1
		input_item_3.onchange = (e)=>{
			// bimengine.FirstPersonControls.controls.moveSpeed = e.target.value/100
		}
		form_item_3.appendChild(input_item_3);


		let form_item_4 = document.createElement("div");
		form_item_4.className = "Form_Item"
		main_contain.appendChild(form_item_4);
		let form_item_label_4 = document.createElement("div");
		form_item_label_4.className = "Form_Item_Label"
		form_item_label_4.innerText = "曝光强度"
		form_item_4.appendChild(form_item_label_4);
		let input_item_4 = document.createElement("input")
		input_item_4.className = "inputtext"
		input_item_4.type = "number"
		input_item_4.min = 0
		input_item_4.max = 1
		input_item_4.step = 0.1
		input_item_4.value = 0.6
		input_item_4.onchange = (e)=>{
      _render.SetAmbientLightIntensity(e.target.value)
		}
		form_item_4.appendChild(input_item_4);





		let module_header3 = document.createElement("div")
		module_header3.className = "Module-Header";
		let icon3 = document.createElement("div")
		icon3.className = "Icon";
		let title3 = document.createElement("div")
		title3.className = "Title";
		title3.innerText = "高级效果"
		module_header3.appendChild(icon3)
		module_header3.appendChild(title3)
		main_contain.appendChild(module_header3)

		let bg_color_list = document.createElement("div");
		bg_color_list.className = "Bg-Color-List";
		let form_item_label_6 = document.createElement("div")
		form_item_label_6.className = "Form_Item_Label";
		form_item_label_6.innerText = "背景颜色"
		bg_color_list.appendChild(form_item_label_6)
		for(let i=0;i<bgColorList.length;i++){
			let item = document.createElement("div");
			item.className = "Item";
			item.style.backgroundImage = bgColorList[i].color
			item.dataset.value = bgColorList[i].id
			item.dataset.color = bgColorList[i].color
			bgColorList[i].domEl = item
			item.onclick = (e)=>{
				for(let j=0;j<bgColorList.length;j++){
					if(bgColorList[j].id === e.target.dataset.value){
						bgColorList[j].domEl.className = "Item Actived";
					}else{
						bgColorList[j].domEl.className = "Item";
					}
				}
				_render.SetBackGroundColor(e.target.dataset.color)
			}
			bg_color_list.appendChild(item)
		}
		main_contain.appendChild(bg_color_list)



	let light_color_list = document.createElement("div");
	light_color_list.className = "Light-Color-List";
	let form_item_label_7 = document.createElement("div")
	form_item_label_7.className = "Form_Item_Label";
	form_item_label_7.innerText = "环境光照"
	light_color_list.appendChild(form_item_label_7)

	let item_contain = document.createElement("div");
	item_contain.className = "Item-Contain";
	let item_inside_contain = document.createElement("div");
	item_inside_contain.className = "Item-Inside-Contain";
	item_contain.appendChild(item_inside_contain)
	light_color_list.appendChild(item_contain)

	for(let i=0;i<lightColorList.length;i++){
		let item = document.createElement("div");
		item.className = "Item";

		let legened = document.createElement("div");
		legened.className = "Legened";
		legened.style.backgroundColor = lightColorList[i].color
		let title = document.createElement("div");
		title.className = "Title";
		title.innerText = lightColorList[i].label
		item.appendChild(legened)
		item.appendChild(title)
		item.dataset.value = lightColorList[i].id
		item.dataset.color = lightColorList[i].color
		lightColorList[i].domEl = item
		item.onclick = (e)=>{
			for(let j=0;j<lightColorList.length;j++){
				if(lightColorList[j].id === e.target.dataset.value){
					lightColorList[j].domEl.className = "Item Actived";
				}else{
					lightColorList[j].domEl.className = "Item";
				}
			}
			_render.SetAmbientLightColor(e.target.dataset.color)
		}
		item_inside_contain.appendChild(item)
	}
	main_contain.appendChild(light_color_list)
	


		_container.appendChild(render_set_dialog);

	}

	function _onMouseDown(e) {
		var left = render_set_dialog.offsetLeft;
		var top = render_set_dialog.offsetTop;
		//计算出鼠标的位置与元素位置的差值。
		var cleft = e.clientX - left;
		var ctop = e.clientY - top;
		render_set_dialog.style.cursor = "move";
		document.onmousemove = function (doc) {
			//计算出移动后的坐标。
			var moveLeft = doc.clientX - cleft;
			var moveTop = doc.clientY - ctop;
			let maxWidth = (_container.offsetWidth - render_set_dialog.offsetWidth)
			let maxHeight = (_container.offsetHeight - render_set_dialog.offsetHeight)
			if(moveLeft < 0){
				moveLeft = 0
			}
			if(moveTop < 0){
				moveTop = 0
			}
			if(moveLeft > maxWidth){
				moveLeft = maxWidth
			}
			if(moveTop > maxHeight){
				moveTop = maxHeight
			}
			//当移动位置在范围内时，元素跟随鼠标移动。
			render_set_dialog.style.left = moveLeft + "px";
			render_set_dialog.style.top = moveTop + "px";
		}

		document.onmouseup = function () {
			render_set_dialog.style.cursor = "auto";
			document.onmousemove = function () { }
		};
	}
	

	return _render;
}
