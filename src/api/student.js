import request from "@/utils/request";

export const studentAPI = {
  // 获取我的成绩
  getMyGrades(semesterId, params) {
    return request({
      url: `/api/student/semesters/${semesterId}/grades`,
      method: "get",
      params,
    });
  },

  getMySemesterReport(semesterId) {
    return request({
      url: `/api/student/semesters/${semesterId}/report-grades`,
      method: "get",
    });
  },

  // 获取学期列表
  getSemesters(params) {
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
    return request({
      url: "/api/student/awards",
      method: "post",
      data,
    });
  },

  // 更新奖项
  updateAward(id, data) {
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

  getOriginGradeTrend(studentId) {
    return request({
      url: `/api/teacher/students/${studentId}/origin-grades`,
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
