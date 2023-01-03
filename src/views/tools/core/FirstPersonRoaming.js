const THREE = require('three')
import "../style/FirstPersonRoaming.css"
export function FirstPersonRoaming(bimengine) {
	// CreatorUI(bimengine)




}





//创建UI


export function CreatorUI(bimengine) {
	var htmls = [
		"<div class='FormControl'>",
		"<div class='FormHeard'>",
		"<div class='FormTitle'>漫游设置</div>",
		"<div class='FormClose'>×</div>",

		"<div class='FormMax'>□</div>",
		"<div class='FormMin'>-</div>",
		"</div>",
		"<div class='FormMain'>",
		"<div class='MinMap'></div>",
		'<div class="FirstPerson">',
		'<div class="SwitchItem"><div class="Lable">开启重力</div> <input type="checkbox" class="switch"></div>',
		'<div class="SwitchItem"><div class="Lable">开启碰撞</div> <input type="checkbox" class="switch"></div>',
		'<div class="SwitchItem"><div class="Lable">漫游速度</div> <input type="number" class="switch inputtext"></div>',
		'</div>',
		"</div>",
		"</div>",
	];
	var _container = bimengine.scene.renderer.domElement.parentElement;
	var dom = document.createElement("div");
	dom.innerHTML = htmls.join("");
	_container.appendChild(dom);
	//绑定事件
	document.getElementsByClassName("FormMin")[0].addEventListener("click", function() {
		
	})
	document.getElementsByClassName("FormMin")[0].addEventListener("click", function() {
		
	})
	document.getElementsByClassName("FormClose")[0].addEventListener("click", function() {
		
	})
	
	
}
