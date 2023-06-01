import request from '@/utils/request'
//获取历史版本
export function GetHistoryModelVersion(id) {
	return request({
		url: '/api/BIMModel/GetHistoryVersion?modelId=' + id,
		method: 'get',
	})
}
//删除模型版本
export function DeleteModelVersion(id) {
	return request({
		url: '/api/BIMModel/DeleteModelVersion?id=' + id,
		method: 'get',
	})
}
//获取项目的标签
export function GetProjectModelTags() {
	return request({
		url: '/api/BIMModel/GetModelTag',
		method: 'get',
	})
}
//获取项目的模型
export function GetProjectModels(config) {
	config.type = "web"
	return request({
		url: '/api/BIMModel/GetModelList',
		method: 'post',
		data: config
	})
}
//保存模型组合
export function SaveModelCompose(data) {
	data.Type = "web";
	return request({
		url: '/api/BIMModel/SaveModelCompose',
		method: 'post',
		data: data
	})
}
//删除模型组合，解散
export function DeleteModelCompose(id) {
	return request({
		url: '/api/BIMModel/DeleteModelCompose?id=' + id,
		method: 'get',
	})
}

export function UpdateModelCompose(input) {
	return request({
		url: '/api/BIMModel/UpdateModelCompose',
		method: 'post',
		data: input
	})
}
//获取模型组合内容
export function getModelCompose() {
	return request({
		url: '/api/BIMModel/GetModelCompose?type=web',
		method: 'get',
	})
}
//获取项目中所有模型
export function GetProjectModelAndVersion(path) {
	return request({
		url: '/api/BIMModel/GetProjectModelAndVersion?path='+path,
		method: 'get',
	})
}
//更新模型信息
export function UpdateModelInfo(input) {
	return request({
		url: '/api/BIMModel/UpdateModelInfo',
		method: 'put',
		data: input
	})
}
//删除模型
export function DeleteModel(id) {
	return request({
		url: `/api/BIMModel/Delete/${id}`,
		method: 'DELETE',

	})
}
//修改模型状态
export function ChangeModelState(id) {
	return request({
		url: `/api/BIMModel/Change/${id}`,
		method: 'put',
	})
}
//通过模型加载路径获取模型名称
export function GetModelNameWithUrl(url) {
	return request({
		url: '/api/BIMModel/GetModelNameWithUrl?url=' + url,
		method: 'get',
	})
}
//上传模型
export function UploadModel(input) {
	return request({
		url: '/api/BIMModel/UploadModel',
		method: 'post',
		data: input
	})
}
//添加模型转换队列
export function CreatorModelConver(path, filename, size) {
	return request({
		url: '/api/BIMModel/CreatorModelConver?path=' + path + "&fileName=" + filename + "&size=" + size,
		method: 'get',
	})
}
//重新转换模型
export function ResertCurrentModel(id) {
	return request({
		url: '/api/ModelConversionServer/UpdataCurrentModelVersionState?id=' + id + '&state=0',
		method: 'get',
	})
}
