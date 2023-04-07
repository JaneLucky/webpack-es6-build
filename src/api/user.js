import request from '@/utils/request'

//物联网的token
export function lotlogin(data) {
	return request({
		url: '/lot/Security/lotToken',
		method: 'post',
		data
	})
}
// 用户登录
export function login(data) {
	return request({
		url: '/api/oauth/Login',
		method: 'post',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		data
	})
}

// 获取当前用户信息
export function getInfo() {
	return request({
		url: '/api/oauth/CurrentUser',
		method: 'get',
	})
}

// 退出登录
export function logout() {
	return request({
		url: '/api/oauth/Logout',
		method: 'get'
	})
}

// 锁屏解锁登录
export function unlock(data) {
	return request({
		url: '/api/oauth/LockScreen',
		method: 'post',
		data
	})
}

// 设置项目
export function proejctPick(id) {
	return request({
		url: '/api/oauth/ProjectPick?projectId=' + id,
		method: 'get',
	})
}
// 获取当前项目
export function GetCurrentProject() {
	return request({
		url: '/api/oauth/GetCurrentProject',
		method: 'get',
	})
}