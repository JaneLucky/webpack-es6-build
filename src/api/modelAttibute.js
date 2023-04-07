import request from '@/utils/request'
//查询进度信息
export function GetModelProperties(data) {
	return request({
		url: '/modelToken/Models/GetModelProperties',
		method: 'get',
		params: data
	})
}
//查询计价信息
export function GetModelMeasurementData(taskid) {
	return request({
		url: '/modelToken/MeasurementCheck/GetModelMeasurementData',
		method: 'get',
		params: {
			taskid: taskid
		}
	})
}
