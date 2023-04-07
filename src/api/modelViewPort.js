import request from '@/utils/request'
//获取模型视点
export function GetModelViewPort(parentId, data) {
	return request({
		url: '/api/BIMViewPort/GetModelViewGroup?parentId=' + parentId,
		method: 'post',
		data: data
	})
}
//报错模型组
export function SaveModelGroup(data) {
	return request({
		url: '/api/BIMViewPort/SaveModelViewGroup',
		method: 'post',
		data: data
	})
}
//保存视点
export function SaveModelViewPort(data) {
	return request({
		url: '/api/BIMViewPort/SaveModelViewPort',
		method: 'post',
		data: data
	})
}
//更新视点的收藏状态
export function ChangerViewPortCollection(id) {
	return request({
		url: '/api/BIMViewPort/ChangerViewPortCollection?id=' + id,
		method: 'get'
	})
}
//拖拽视点
export function DropViewGroupDataUpdata(data) {
	return request({
		url: '/api/BIMViewPort/DropViewGroupDataUpdata',
		method: 'post',
		data: data
	})
}
//删除视点
export function DeleteProjectModelView(id) {
	return request({
		url: '/api/BIMViewPort/DeleteModelView?id=' + id,
		method: 'get'
	})
}
//删除视点组
export function DeleteModelViewGroup(id) {
	return request({
		url: '/api/BIMViewPort/DeleteModelViewGroup?id=' + id,
		method: 'get'
	})
}
//批量删除视点或视点组
export function DeleteViewPortBatch(data){
	return request({
		url: '/api/BIMViewPort/DeleteViewPortBatch',
		method: 'post',
		data:data
	})
}