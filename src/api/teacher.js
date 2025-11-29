import request from "@/utils/request";
import { mockAPI } from "@/utils/mock";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

export const teacherAPI = {
  // 获取成绩列表
  getGrades(params) {
    if (USE_MOCK) {
      return mockAPI.getGrades(params);
    }
    return request({
      url: "/teacher/grades",
      method: "get",
      params,
    });
  },

  // 录入/更新成绩
  saveGrade(data) {
    if (USE_MOCK) {
      return mockAPI.saveGrade(data);
    }
    return request({
      url: "/teacher/grades",
      method: "post",
      data,
    });
  },

  // 批量导入成绩
  importGrades(data) {
    return request({
      url: "/teacher/grades/import",
      method: "post",
      data,
    });
  },

  // 获取课程列表
  getCourses() {
    if (USE_MOCK) {
      return mockAPI.getCourses();
    }
    return request({
      url: "/teacher/courses",
      method: "get",
    });
  },

  // 获取教师可打分的学期列表
  getAvailableSemesters(params) {
    return request({
      url: "/api/teacher/semesters",
      method: "get",
      params,
    });
  },

  getSemesterSubjects() {
    return request({
      url: "/api/teacher/semester-subjects",
      method: "get",
    });
  },

  getClassesBySemester(semesterId, params) {
    return request({
      url: `/api/teacher/semesters/${semesterId}/classes`,
      method: "get",
      params,
    });
  },

  // 获取教师的班级列表
  getTeacherClasses(params) {
    return request({
      url: "/api/teacher/classes",
      method: "get",
      params,
    });
  },

  // 根据班级获取学生列表（包含成绩信息）
  getStudentsByClass(classId) {
    return request({
      url: `/api/teacher/classes/${classId}/students`,
      method: "get",
    });
  },

  // class GradeRequestItem(BaseModel):
  //     student_id: str
  //     usual_score: Optional[float] = None
  //     remark: Optional[str] = None
  //
  // class SemesterSubjectGradeRequest(BaseModel):
  //     semester_id: str
  //     class_id: str
  //     subject_code: str
  //     grades: list[GradeRequestItem]

  // 保存单个学生成绩
  saveStudentGrade(semesterId, classId, subjectCode, data) {
    return request({
      url: `/api/teacher/semesters/${semesterId}/classes/${classId}/subjects/${subjectCode}/grades`,
      method: "post",
      data,
    });
  },

  // 保存学生品格评语
  saveCharacterComment(semesterId, classId, data) {
    return request({
      url: `/api/teacher/semesters/${semesterId}/classes/${classId}/comments`,
      method: "post",
      data,
    });
  },

  getCharacterComments(semesterId, classId) {
    return request({
      url: `/api/teacher/semesters/${semesterId}/classes/${classId}/comments`,
      method: "get",
    });
  },

  // 批量保存学生成绩
  batchSaveGrades(data) {
    if (USE_MOCK) {
      return mockAPI.batchSaveGrades(data);
    }
    return request({
      url: "/teacher/grades/batch",
      method: "post",
      data,
    });
  },

  getClassSemesterSubjectGrades(classId, semesterId, subjectCode) {
    return request({
      url: `/api/teacher/semesters/${semesterId}/classes/${classId}/subjects/${subjectCode}/grades`,
      method: "get",
    });
  },

  getStudentSemesterReport(studentId, semesterId) {
    return request({
      url: `/api/teacher/students/${studentId}/semesters/${semesterId}/grades`,
      method: "get",
    });
  },

  getStudentGradeProof(studentId) {
    return request({
      url: `/api/teacher/students/${studentId}/report-proof`,
      method: "get",
    });
  },

  // 获取奖项审核列表
  getAwards(params) {
    if (USE_MOCK) {
      return mockAPI.getTeacherAwards(params);
    }
    return request({
      url: "/api/teacher/awards",
      method: "get",
      params,
    });
  },

  // 审核奖项
  reviewAward(id, data) {
    return request({
      url: `/api/teacher/awards/${id}/approve`,
      method: "post",
      data,
    });
  },
};
