//添加功能按钮
require('@/views/tools/style/' + SetDeviceStyle() + '/RightClickMenu.scss')
import {
	SetDeviceStyle
} from "@/views/tools/style/deviceStyleSet.js"
export function ControlButtons() {
	var _controlButtons = new Object();
	//添加功能按钮

	_controlButtons.AddButton = function(option, callback) {
		var right_click_menu_container = document.getElementsByClassName("Right-Click-Menu-Container")[0];



	}
	//添加右键菜单
	_controlButtons.AddMenuList = function(option, callback) {
		var right_click_menu_container = document.getElementsByClassName("Right-Click-Menu-Container")[0];
		let menu_item = document.createElement("div");
		menu_item.className = "Menu-Item";
		let menu_item_span = document.createElement("span");
		menu_item_span.innerHTML = option.label
		menu_item.appendChild(menu_item_span)
		let menu_item_icon = document.createElement("span");
		menu_item_icon.className = "Menu-Item-Icon"
		menu_item.appendChild(menu_item_icon)
		menu_item.onclick = (e) => {
			right_click_menu_container && (right_click_menu_container.style.display = "none");//关闭弹框UI
			callback();
		}
		right_click_menu_container.appendChild(menu_item)
	}
	return _controlButtons;
}