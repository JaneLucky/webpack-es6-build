import request from '@/utils/request'

//上传图片
export function UploadRoamPicture(data) {
	return request({
		url: '/api/RoamServer/Uploader/roamPicture',
		method: 'post',
		data: data
	})
}

//获得漫游列表
export function GetRoamAnimationList(data) {
	return request({
		url: '/api/RoamServer/GetRoamAnimation',
		method: 'post',
		data: data
	})
}

//保存漫游
export function SaveRoamAnimation(data) {
	return request({
		url: '/api/RoamServer/SaveRoamAnimationList',
		method: 'post',
		data: data
	})
}

//获得漫游详情
export function GetRoamAnimationById(data) {
	return request({
		url: '/api/RoamServer/GetRoamAnimationById',
		method: 'get',
		params: data
	})
}

//删除漫游
export function DeleteRoamAnimation(data) {
	return request({
		url: '/api/RoamServer/DeleteRoamAnimation',
		method: 'get',
		params: data
	})
}
