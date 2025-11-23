/**
 * Pydantic模型到Report.vue的数据映射器
 * 将后端SemesterGradeResponse模型转换为Report.vue所需的数据格式
 */

/**
 * 将Pydantic SemesterGradeResponse转换为Report.vue数据结构
 * @param {Object} pydanticData - 来自后端的SemesterGradeResponse数据
 * @returns {Object} - 适配后的Report.vue数据结构
 */
export function mapPydanticToReport(pydanticData) {
  if (!pydanticData) {
    return getDefaultReportData();
  }

  return {
    // 学生基本信息
    student: {
      class: pydanticData.class_name || '',
      name: pydanticData.student_name || '',
      code: pydanticData.student_status_number || '',
      gender: pydanticData.gender === 1 ? '男' : (pydanticData.gender === 2 ? '女' : '未知'),
      admissionDate: pydanticData.enrollment_date || '',
      teacher: pydanticData.header_teacher || ''
    },

    // 学分和绩点
    totalCredits: pydanticData.total_credits || '0',
    gpa: pydanticData.average_gpa || '0.0',

    // 必修科目映射
    subjects: mapSubjects(pydanticData),

    // 选修课数据
    electives: mapElectives(pydanticData.elective_subjects || []),

    // 能力评价
    abilities: mapAbilities(pydanticData.abilities || []),

    // 品德评语
    moralComment: pydanticData.moral_education_comment || '',

    // 学校信息
    school: {
      id: pydanticData.school_id || '',
      name: pydanticData.school_name || '',
      semester: pydanticData.semester_name || ''
    }
  };
}

/**
 * 映射必修科目
 */
function mapSubjects(data) {
  const subjectMap = {
    chinese: { name: "语文", data: data.chinese },
    math: { name: "数学", data: data.math },
    english: { name: "英语", data: data.english },
    physics: { name: "物理", data: data.physics },
    chemistry: { name: "化学", data: data.chemistry },
    technology: { name: "通用技术", data: data.technology },
    pe: { name: "体育", data: data.pe },
    history: { name: "历史", data: data.history },
    biology: { name: "生物", data: data.biology },
    geography: { name: "地理", data: data.geography },
    art: { name: "艺术", data: data.art },
    labor_technology: { name: "劳动技术", data: data.labor_technology },
    information_technology: { name: "信息技术", data: data.information_technology },
    politics: { name: "政治", data: data.politics }
  };

  return Object.entries(subjectMap).map(([key, config]) => {
    const subjectData = config.data || {};
    return {
      name: config.name,
      mid: subjectData.mid_term_score || "",
      final: subjectData.final_term_score || "",
      daily: subjectData.coursework_grade || "",
      total: subjectData.final_term_grade || "",
      credit: subjectData.credit_hours || "",
      rank: subjectData.grade_level || ""
    };
  });
}

/**
 * 映射选修课
 */
function mapElectives(electives) {
  return electives.map(item => ({
    name: item.subject_name || '',
    grade: item.level || '',
    credit: item.credit_hours || '',
    teacher: item.teacher_name || ''
  }));
}

/**
 * 映射能力评价
 */
function mapAbilities(abilities) {
  if (!abilities || abilities.length === 0) {
    return [4, 3, 2, 3, 3]; // 默认值
  }

  const ability = abilities[0];
  return [
    ability.study_ability || 4,
    ability.logical_thinking || 3,
    ability.creativity || 2,
    ability.teamwork || 3,
    ability.responsibility || 3
  ];
}

/**
 * 获取默认报告数据
 */
function getDefaultReportData() {
  return {
    student: {
      class: "",
      name: "",
      code: "",
      gender: "",
      admissionDate: "",
      teacher: ""
    },
    totalCredits: "0",
    gpa: "0.0",
    subjects: [
      { name: "语文", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "数学", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "英语", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "物理", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "化学", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "通用技术", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "体育", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "历史", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "生物", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "地理", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "艺术", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "劳动技术", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "信息技术", mid: "", final: "", daily: "", total: "", credit: "", rank: "" },
      { name: "政治", mid: "", final: "", daily: "", total: "", credit: "", rank: "" }
    ],
    electives: [],
    abilities: [4, 3, 2, 3, 3],
    moralComment: "",
    school: {
      id: "",
      name: "",
      semester: ""
    }
  };
}

/**
 * 验证Pydantic数据格式
 */
export function validatePydanticData(data) {
  const requiredFields = [
    'school_name', 'class_name', 'student_name', 'student_status_number',
    'chinese', 'math', 'english', 'physics', 'chemistry'
  ];

  return requiredFields.every(field => data[field] !== undefined && data[field] !== null);
}

/**
 * 从URL参数获取报告数据
 */
export function getReportFromParams(route) {
  const params = route.params;
  const query = route.query;

  return {
    school_name: query.schoolName || '上海音乐学院虹口区北虹高级中学',
    class_name: params.className || query.className || '',
    semester_name: params.semesterName || query.semesterName || '',
    student_name: params.studentName || query.studentName || '',
    student_status_number: params.studentId || query.studentId || '',
    // 可以添加更多参数映射
  };
}