import request from '@/utils/request'

//获取材质类型
export function GetMaterialTypes(data) {
  return request({
    url: `/materialSet/MaterialService/GetMaterialTypes`,
    method: 'get',
    data: data
  })
}

//获取材质尺寸
export function GetMaterialSize(data) {
  return request({
    url: `/materialSet/MaterialService/GetMaterialSize`,
    method: 'get',
    data: data
  })
}

//获取最近使用材质列表
export function GetRecentUse(data) {
  return request({
    url: `/materialSet/MaterialService/GetRecentUse`,
    method: 'get',
    data: data
  })
}

//获取最近使用材质个数
export function GetRecentUseCount(data) {
  return request({
    url: `/materialSet/MaterialService/GetRecentUseCount`,
    method: 'get',
    data: data
  })
}

//新增材质
export function SaveMaterialEntity(data) {
  return request({
    url: `/materialSet/MaterialService/SaveMaterialEntity`,
    method: 'post',
    data: data
  })
}

//获取材质列表
export function GetMaterialList(data) {
  return request({
    url: `/materialSet/MaterialService/GetMaterialList`,
    method: 'post',
    data: data
  })
}

//重命名材质
export function ResetMaterialName(data) {
  return request({
    url: `/materialSet/MaterialService/ResetMaterialName`,
    method: 'post',
    data: data
  })
}

//复制材质
export function CopyMaterial(data) {
  return request({
    url: `/materialSet/MaterialService/CopyMaterial`,
    method: 'post',
    data: data
  })
}

//删除材质
export function DeleteMaterial(data) {
  return request({
    url: `/materialSet/MaterialService/DeleteMaterial`,
    method: 'get',
    data: data
  })
}

//删除材质类型
export function DeleteMaterialType(data) {
  return request({
    url: `/materialSet/MaterialService/DeleteMaterialType`,
    method: 'get',
    data: data
  })
}

//材质树
export function GetMaterialCount(data) {
  return request({
    url: `/materialSet/MaterialService/GetMaterialCount`,
    method: 'get',
    data: data
  })
}



//保存材质映射
export function SaveMaterialMap(data) {
	return request({
		url: '/materialSet/MaterialService/SaveMaterialMap',
		method: 'post',
    data: data
	})
}
