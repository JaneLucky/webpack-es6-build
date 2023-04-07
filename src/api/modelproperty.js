import request from '@/utils/request'
//获取历史版本
export function GetPropertyGroup() {
	return request({
		url: '/modelToken/ModelProperty/GetPropertyGroup',
		method: 'get',
	})
}