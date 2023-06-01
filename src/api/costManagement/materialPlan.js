import request from '@/utils/request'
// 存储表格
export function SaveMaterialPlaneSingle(data) {
  return request({
    url: '/api/MaterialSinglePlane/SaveMaterialPlaneSingle',
    method: 'post',
    data
  })
}