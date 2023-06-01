import request from '@/utils/request'
//获取构件树
export function GetModelTreeSimple(id, level, modelkey, modelids) {
	return request({
		url: '/modelToken/ModelTree/GetModelTreeSimple?id=' + id + "&level=" + level + "&modelkey=" + modelkey +
			"&modelids=" + modelids,
		method: 'get',
	})
}
//获取所有的类型
export function GetModelCategory(models, callback) {
	request({
		url: "/modelToken/ModelTree/GetModelCategory",
		method: 'post',
		data: models
	}).then(res => {
		callback(res.data)
	})
}
export function GetModelQuantitieslData(filters) {
	return request({
		url: "/modelToken/ModelQuantities/GetModelQuantitieslData",
		method: 'post',
		data: filters
	})
}
export function DownLoadQuantitieslData(filters) {
	return request({
		url: "/modelToken/ModelQuantities/DownLoadQuantitieslData",
		method: 'post',
		data: filters
	})
}

//获取所有的级别
export function GetModelLevel(models, callback) {
	request({
		url: '/modelToken/ModelTree/GetModelLevel',
		method: 'post',
		data: models
	}).then(res => {
		callback(res.data)
	})
}
//获取分部分项的构件树
export function GetSubItemTreeSimple(id, level, modelkey, modelids) {
	return request({
		url: '/api/TaskGanttBinding/GetSubItemTreeSimple?id=' + id,
		method: 'get',
	})
}
//获取构件树类型
export function GetModelTreeType() {
	return request({
		url: '/api/TaskGanttBinding/GetModelTreeType',
		method: 'get',
	})
}

//获取构件树根列表接口
export function GetModelList() {
	return request({
		url: '/api/BIMModel/GetModelList',
		method: 'get',
	})
}


//获取设置工程量的接口
export function GetCostFilter() {
	return request({
		url: '/api/CostFilter/GetCostFilter',
		method: 'get',
	})
}

// 保存设置工程量列表接口
export function SaveCostFilters(data) {
	return request({
		url: `/api/CostFilter/SaveCostFilters`,
		method: 'post',
		data
	})
}
