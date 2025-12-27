import request from "@/utils/request";
import { mockAPI } from "@/utils/mock";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const adminAPI = {
  // 获取学期列表
  getSemesters() {
    if (USE_MOCK) {
      return mockAPI.getSemesters();
    }
    return request({
      url: "/admin/semesters",
      method: "get",
    });
  },

  // 创建学期
  createSemester(data) {
    if (USE_MOCK) {
      return mockAPI.createSemester(data);
    }
    return request({
      url: "/admin/semesters",
      method: "post",
      data,
    });
  },

  // 更新学期
  updateSemester(id, data) {
    if (USE_MOCK) {
      return mockAPI.updateSemester(id, data);
    }
    return request({
      url: `/admin/semesters/${id}`,
      method: "put",
      data,
    });
  },

  // 删除学期
  deleteSemester(id) {
    return request({
      url: `/admin/semesters/${id}`,
      method: "delete",
    });
  },

  getActiveSubjects() {
    return request({
      url: "/api/admin/subjects?active=true",
      method: "get",
    });
  },

  // 获取课程列表
  getCourses() {
    return request({
      url: "/api/admin/subjects",
      method: "get",
    });
  },

  // 更新课程
  updateCourse(id, data) {
    return request({
      url: `/api/admin/subjects/${id}`,
      method: "put",
      data,
    });
  },

  // 获取班级列表
  getClasses(params) {
    if (USE_MOCK) {
      return mockAPI.getAdminClasses(params);
    }
    return request({
      url: "/api/admin/classes",
      method: "get",
      params,
    });
  },

  // 获取班级详情
  getClassDetail(classId) {
    if (USE_MOCK) {
      return mockAPI.getAdminClassDetail(classId);
    }
    return request({
      url: `/api/admin/classes/${classId}`,
      method: "get",
    });
  },

  getSchoolInfo() {
    return request({
      url: "/api/admin/school",
      method: "get",
    });
  },

  updateSchoolInfo(data) {
    return request({
      url: "/api/admin/school",
      method: "put",
      data,
    });
  },

  getSemesters(params = {}) {
    return request({
      url: "/api/admin/semesters",
      method: "get",
      params,
    });
  },

  updateSemesterScoringTime(semesterId, data) {
    return request({
      url: `/api/admin/semesters/${semesterId}/scoring-times`,
      method: "post",
      data,
    });
  },

  // 获取活动列表
  getActivities(params) {
    return request({
      url: `/api/admin/activities`,
      method: "get",
      params,
    });
  },

  // 创建活动
  createActivity(semesterId, data) {
    return request({
      url: `/api/admin/semesters/${semesterId}/activities`,
      method: "post",
      data,
    });
  },

  // 删除活动
  deleteActivity(id) {
    return request({
      url: `/api/admin/activities/${id}`,
      method: "delete",
    });
  },

  getStudentStatusCard(studentId) {
    return request({
      url: `/api/teacher/students/${studentId}/status_card`,
      method: "get",
    });
  },

  exportStudentStatusCard(studentId) {
    return request({
      url: `/api/admin/students/${studentId}/status_card/export`,
      method: "get",
      responseType: "blob",
    });
  },

  // 获取教师列表
  getTeachers(params) {
    return request({
      url: "/api/admin/teachers",
      method: "get",
      params,
    });
  },

  // 获取选修课列表
  getElectiveSubjects(params) {
    return request({
      url: "/api/admin/elective-subjects",
      method: "get",
      params,
    });
  },

  // 创建选修课
  createElectiveSubject(data) {
    return request({
      url: "/api/admin/elective-subjects",
      method: "post",
      data,
    });
  },

  // 更新选修课
  updateElectiveSubject(id, data) {
    return request({
      url: `/api/admin/elective-subjects/${id}`,
      method: "put",
      data,
    });
  },

  // 获取选修课学生成绩列表
  getElectiveSubjectGrades(subjectId) {
    return request({
      url: `/api/admin/elective-subjects/${subjectId}/students`,
      method: "get",
    });
  },

  // 添加学生 to 选修课
  addStudentToElectiveSubject(subjectId, studentId) {
    return request({
      url: `/api/admin/elective-subjects/${subjectId}/students`,
      method: "post",
      data: { student_ids: [studentId] },
    });
  },

  // 从选修课移除学生
  removeStudentFromElectiveSubject(subjectId, studentId) {
    return request({
      url: `/api/admin/elective-subjects/${subjectId}/students/${studentId}`,
      method: "delete",
    });
  },

  // 获取学生列表 (用于搜索)
  getStudents(params) {
    return request({
      url: "/api/admin/students",
      method: "get",
      params,
    });
  },

  // 批量添加学生 to 选修课
  batchAddStudentsToElectiveSubject(subjectId, studentIds) {
    return request({
      url: `/api/admin/elective-subjects/${subjectId}/students`,
      method: "post",
      data: { student_ids: studentIds },
    });
  },

  getSchoolYears() {
    return request({
      url: "/api/admin/years",
      method: "get",
    });
  },

  // 获取班级评分进度
  getClassProcesses(semesterId, yearCode, subjectCode) {
    return request({
      url: `/api/admin/semesters/${semesterId}/years/${yearCode}/subjects/${subjectCode}/classe-processes`,
      method: "get",
    });
  },
};
