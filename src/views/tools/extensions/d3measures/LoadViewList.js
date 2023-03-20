import {
	LoadZipJson,
	LoadJSON
} from "@/utils/LoadJSON.js" 
const THREE = require('@/three/three.js')
export function LoadViewList(bimEngine, path){
	//加载视图清单 
	LoadJSON(path + "/viewlist.json", res => {
		if(res){
			var viewList = JSON.parse(res).viewList;
			var _viewList1 = viewList.CeilingPlans.concat(viewList.FloorPlans);
			var _viewList2 = viewList.Elevations.concat(viewList.Sections);
			var _viewList = _viewList1.concat(_viewList2);
			//遍历平面视图
			for (let view of _viewList) {
				let index1 = bimEngine.D3Measure.ViewList.findIndex(x => x.label == view.Rules);
				if (index1 != -1) {
					let index2 = bimEngine.D3Measure.ViewList[index1].children.findIndex(x => x.label == view
						.ViewType);
					if (index2 != -1) {
						bimEngine.D3Measure.ViewList[index1].children[index2].children.push({
							label: view.Name,
							Id: view.Id,
							ViewType: view.ViewType,
							ViewData: view
						});
					} else {
						bimEngine.D3Measure.ViewList[index1].children.push({
							label: view.ViewType,
							Id: guid(),
							children: [{
								label: view.Name,
								Id: view.Id,
								ViewType: view.ViewType,
								ViewData: view
							}]
						})
					}
				} else {
					bimEngine.D3Measure.ViewList.unshift({
						label: view.Rules,
						Id: guid(),
						children: [{
							label: view.ViewType,
							Id: guid(),
							children: [{
								label: view.Name,
								Id: view.Id,
								ViewType: view.ViewType,
								ViewData: view
							}]
						}]
					})
				}
			}
		}
	})
	function guid() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
}