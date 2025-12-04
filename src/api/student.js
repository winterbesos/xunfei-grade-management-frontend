import request from "@/utils/request";
import { mockAPI } from "@/utils/mock";

// 是否使用 Mock 数据
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const studentAPI = {
  // 更新学生信息
  async updateStudent(id, student) {
    if (USE_MOCK) {
      return mockAPI.updateStudent(id, student);
    }
    return request({
      url: `/api/students/${id}`,
      method: "put",
      data: student,
    });
  },

  // 获取学校列表
  async getSchools() {
    return request({
      url: "/api/schools",
      method: "get",
    });
  },

  // 获取班级列表
  async getClasses(params = {}) {
    if (USE_MOCK) {
      return mockAPI.getClasses(params);
    }
    return request({
      url: "/api/classes",
      method: "get",
      params,
    });
  },

  // 根据学校获取班级
  async getClassesBySchool(schoolId) {
    if (USE_MOCK) {
      return mockAPI.getClassesBySchool(schoolId);
    }
    return request({
      url: `/api/schools/${schoolId}/classes`,
      method: "get",
    });
  },

  // 获取我的成绩
  getMyGrades(semesterId, params) {
    return request({
      url: `/api/student/semesters/${semesterId}/grades`,
      method: "get",
      params,
    });
  },

  // 获取学期列表
  getSemesters(params) {
    if (USE_MOCK) {
      return mockAPI.getSemesters(params);
    }
    return request({
      url: "/api/student/semesters",
      method: "get",
      params,
    });
  },

  // 导出成绩单
  exportGrades(params) {
    return request({
      url: "/student/grades/export",
      method: "get",
      params,
      responseType: "blob",
    });
  },

  // 提交奖项
  submitAward(data) {
    if (USE_MOCK) {
      return mockAPI.submitAward(data);
    }
    return request({
      url: "/api/student/awards",
      method: "post",
      data,
    });
  },

  // 更新奖项
  updateAward(id, data) {
    if (USE_MOCK) {
      return mockAPI.updateAward(id, data);
    }
    return request({
      url: `/api/student/awards/${id}`,
      method: "put",
      data,
    });
  },

  // 获取奖项列表
  getAwards() {
    return request({
      url: "/api/student/awards",
      method: "get",
    });
  },

  // 获取所有教师
  getAllTeachers() {
    return request({
      url: "/api/student/teachers",
      method: "get",
    });
  },

  // 获取活动列表
  getActivities() {
    return request({
      url: "/api/student/activities",
      method: "get",
    });
  },

  // 获取成绩趋势
  getGradeTrend(studentId) {
    return request({
      url: `/api/admin/students/${studentId}/grades`,
      method: "get",
    });
  },

  getYearReport(studentId, academicYearId) {
    return request({
      url: `/api/student/year-reports`,
      method: "get",
      params: {
        student_id: studentId,
        academic_year_id: academicYearId,
      },
    });
  },
};
