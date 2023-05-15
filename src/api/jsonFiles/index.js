import request from '@/utils/request'

//判断文件是否存在
export function CheckModelFileExists(data) {
	return request({
		url: '/api/BIMModel/ModelFileExists',
		method: 'post',
		data: data
	})
}

//保存JSON文件
export function SaveModelJsonFile(data) {
	return request({
		url: '/api/BIMModel/SaveModelJsonFile',
		method: 'post',
		data: data
	})
}