import request from '@/utils/request'

//校验共享模型权限
export function CheckVerifyPermissions(data) {
	return request({
		url: '/api/ModelShare/CheckVerifyPermissions',
		method: 'get',
		params: data
	})
}

//通过路径获取模型名称
export function GetModelNameWithUrl(url) {
	return request({
		url: '/api/BIMModel/GetModelNameWithUrl?url='+url,
		method: 'get'
	})
}

//提交访问记录
export function ModelVisit(path){
	return request({
		url: '/api/BIMModel/ModelVisit?path='+path,
		method: 'get'
	})
}

//创建模型共享
export function CreatorModelUrlsShare(data) {
	return request({
		url: `/api/ModelShare/CreatorModelUrlsShare`,
		method: 'post',
		data
	})
}