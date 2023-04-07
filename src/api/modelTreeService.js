import request from '@/utils/request'
//获取构件树
export function GetModelTreeSimple(id, level, modelkey, modelids) {
	return request({
		url: 'modelToken/ModelTree/GetModelTreeSimple?id=' + id + "&level=" + level + "&modelkey=" + modelkey +
			"&modelids=" + modelids,
		method: 'get',
	})
}
//获取所有的类型 --- 分类
export function GetModelCategory(models, callback) {
	request({
		url: "modelToken/ModelTree/GetModelCategory",
		method: 'post',
		data: models
	}).then(res => {
		callback(res.data)
	})
}
//获取所有的级别 --- 同层
export function GetModelLevel(models, callback) {
	request({
		url: 'modelToken/ModelTree/GetModelLevel',
		method: 'post',
		data: models
	}).then(res => {
		callback(res.data)
	})
}
//获取分部分项的构件树
export function GetSubItemTreeSimple(id, level, modelkey, modelids) {
	return request({
		url: 'api/TaskGanttBinding/GetSubItemTreeSimple?id=' + id,
		method: 'get',
	})
}
//获取构件树类型
export function GetModelTreeType(){
	return request({
		url: 'api/TaskGanttBinding/GetModelTreeType',
		method: 'get',
	})
}