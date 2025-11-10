import request from '@/utils/request'
import { mockAPI } from '@/utils/mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const studentAPI = {
  // 获取我的成绩
  getMyGrades(params) {
    if (USE_MOCK) {
      return mockAPI.getGrades(params)
    }
    return request({
      url: '/student/grades',
      method: 'get',
      params
    })
  },

  // 导出成绩单
  exportGrades(params) {
    return request({
      url: '/student/grades/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}
