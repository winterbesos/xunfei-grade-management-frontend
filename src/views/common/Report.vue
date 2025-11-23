<template>
  <div class="page-wrapper">
    <!-- 操作栏：打印时会自动隐藏 -->
    <div class="action-bar no-print">
      <button @click="handlePrint" class="print-btn">
        <span>🖨️</span> 打印成绩单
      </button>
    </div>

    <!-- A4 纸张容器 -->
    <div class="a4-container" id="print-area">
      <!-- 标题 -->
      <h1 class="title">{{ school.name }} {{ school.semester }} 学生成绩单</h1>

      <!-- 1. 学生基本信息表 -->
      <table class="info-table">
        <colgroup>
          <col style="width: 100px" />
          <col />
          <col style="width: 100px" />
          <col />
          <col style="width: 100px" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td class="label">班级</td>
            <td>{{ student.class }}</td>
            <td class="label">姓名</td>
            <td>{{ student.name }}</td>
            <td class="label">学籍号</td>
            <td>{{ student.code }}</td>
          </tr>
          <tr>
            <td class="label">性别</td>
            <td>{{ student.gender }}</td>
            <td class="label">入学时间</td>
            <td>{{ student.admissionDate }}</td>
            <td class="label">班主任</td>
            <td>{{ student.teacher }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 2. 成绩单主表 -->
      <h3 class="section-title">成绩单</h3>
      <table class="score-table">
        <thead>
          <!-- 总学分/平均绩点 行 -->
          <tr>
            <th class="bold-text">总学分</th>
            <th colspan="2">{{ totalCredits }}</th>
            <th class="bold-text" colspan="2">平均绩点</th>
            <th colspan="2">{{ gpa }}</th>
          </tr>
          <!-- 表头 -->
          <tr>
            <th>课程名</th>
            <th>期中成绩</th>
            <th>期末成绩</th>
            <th>平时成绩</th>
            <th>学期总评</th>
            <th>学时学分</th>
            <th>等第</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in subjects" :key="item.name">
            <td class="subject-name">{{ item.name }}</td>
            <td>{{ item.mid }}</td>
            <td>{{ item.final }}</td>
            <td>{{ item.daily }}</td>
            <td>{{ item.total }}</td>
            <td>{{ item.credit }}</td>
            <td>{{ item.rank }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 3. 选修课成绩 -->
      <h3 class="section-title" style="margin-top: 15px">选修课成绩</h3>
      <table class="elective-table">
        <thead>
          <tr>
            <th>课程名称</th>
            <th>评价</th>
            <th>学时学分</th>
            <th>教师</th>
            <th>课程名称</th>
            <th>评价</th>
            <th>学时学分</th>
            <th>教师</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in electiveRows" :key="index">
            <td>{{ row.left?.name || row.left?.subject_name }}</td>
            <td>{{ row.left?.grade || row.left?.level }}</td>
            <td>{{ row.left?.credit || row.left?.credit_hours }}</td>
            <td>{{ row.left?.teacher || row.left?.teacher_name }}</td>
            <td>{{ row.right?.name || row.right?.subject_name }}</td>
            <td>{{ row.right?.grade || row.right?.level }}</td>
            <td>{{ row.right?.credit || row.right?.credit_hours }}</td>
            <td>{{ row.right?.teacher || row.right?.teacher_name }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 4. 底部区域：品德评语 + 雷达图 -->
      <div class="footer-section">
        <!-- 左侧：品德评语 -->
        <div class="comments-box">
          <h3 class="section-title box-header">品德评语</h3>
          <div class="comments-content">
            {{ moralComment }}
          </div>
        </div>

        <!-- 右侧：雷达图 -->
        <div class="radar-box">
          <h3 class="radar-title">雷达图</h3>
          <div ref="chartRef" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";

import * as echarts from "echarts";

// --- 数据定义 (映射到Pydantic模型) ---

import { mapPydanticToReport } from "@/utils/reportDataMapper.js";

import { useRoute } from "vue-router";

const route = useRoute();

// 学校信息

const school = ref({
  id: "",

  name: "上海音乐学院虹口区北虹高级中学",

  semester: "2023-2024 学年度第一学期",
});

// 学生基本信息

const student = ref({
  class: "",

  name: "",

  code: "",

  gender: "",

  admissionDate: "",

  teacher: "",
});

const totalCredits = ref("0");

const gpa = ref("0.0");

// 必修科目数据

const subjects = ref([]);

// 选修课数据

const electives = ref([]);

// 能力评价

const abilities = ref([4, 3, 2, 3, 3]);

// 品德评语

const moralComment = ref("");

// 映射Pydantic数据到Report格式

const loadReportData = async () => {
  try {
    // 模拟从API获取Pydantic格式的数据

    const mockPydanticData = {
      school_id: "SCH001",

      school_name: "上海音乐学院虹口区北虹高级中学",

      class_id: "CLASS001",

      class_name: "高二(3)班",

      semester_id: "SEM202301",

      semester_name: "2023-2024学年度第一学期",

      student_id: "STU2023001",

      student_name: "张三",

      student_status_number: "2021001234",

      gender: 1,

      enrollment_date: "2022-09",

      header_teacher: "李老师",

      total_credits: "32",

      average_gpa: "3.8",

      chinese: {
        mid_term_score: "85",

        final_term_score: "88",

        coursework_grade: "90",

        final_term_grade: "88",

        credit_hours: "5",

        grade_level: "优秀",
      },

      math: {
        mid_term_score: "90",

        final_term_score: "92",

        coursework_grade: "88",

        final_term_grade: "90",

        credit_hours: "5",

        grade_level: "优秀",
      },

      english: {
        mid_term_score: "82",

        final_term_score: "85",

        coursework_grade: "80",

        final_term_grade: "83",

        credit_hours: "5",

        grade_level: "良好",
      },

      physics: {
        mid_term_score: "78",

        final_term_score: "82",

        coursework_grade: "75",

        final_term_grade: "80",

        credit_hours: "4",

        grade_level: "良好",
      },

      chemistry: {
        mid_term_score: "85",

        final_term_score: "88",

        coursework_grade: "82",

        final_term_grade: "86",

        credit_hours: "4",

        grade_level: "优秀",
      },

      technology: {
        mid_term_score: "90",

        final_term_score: "88",

        coursework_grade: "92",

        final_term_grade: "90",

        credit_hours: "2",

        grade_level: "优秀",
      },

      pe: {
        mid_term_score: "优秀",

        final_term_score: "优秀",

        coursework_grade: "优秀",

        final_term_grade: "优秀",

        credit_hours: "2",

        grade_level: "优秀",
      },

      history: {
        mid_term_score: "88",

        final_term_score: "90",

        coursework_grade: "85",

        final_term_grade: "88",

        credit_hours: "3",

        grade_level: "优秀",
      },

      biology: {
        mid_term_score: "82",

        final_term_score: "85",

        coursework_grade: "80",

        final_term_grade: "83",

        credit_hours: "3",

        grade_level: "良好",
      },

      geography: {
        mid_term_score: "85",

        final_term_score: "88",

        coursework_grade: "82",

        final_term_grade: "86",

        credit_hours: "3",

        grade_level: "优秀",
      },

      art: {
        mid_term_score: "良好",

        final_term_score: "良好",

        coursework_grade: "良好",

        final_term_grade: "良好",

        credit_hours: "1",

        grade_level: "良好",
      },

      labor_technology: {
        mid_term_score: "优秀",

        final_term_score: "优秀",

        coursework_grade: "优秀",

        final_term_grade: "优秀",

        credit_hours: "1",

        grade_level: "优秀",
      },

      information_technology: {
        mid_term_score: "90",

        final_term_score: "88",

        coursework_grade: "92",

        final_term_grade: "90",

        credit_hours: "2",

        grade_level: "优秀",
      },

      politics: {
        mid_term_score: "85",

        final_term_score: "88",

        coursework_grade: "82",

        final_term_grade: "86",

        credit_hours: "3",

        grade_level: "优秀",
      },

      elective_subjects: [
        {
          subject_name: "英语演讲赏析",

          level: "合格",

          credit_hours: "1",

          teacher_id: "T001",

          teacher_name: "王老师",
        },

        {
          subject_name: "中国古代史",

          level: "合格",

          credit_hours: "1",

          teacher_id: "T002",

          teacher_name: "李老师",
        },
      ],

      abilities: [
        {
          study_ability: 4.5,

          logical_thinking: 4.2,

          creativity: 3.8,

          teamwork: 4.0,

          responsibility: 4.3,
        },
      ],

      moral_education_comment:
        "该生学习态度端正，积极参与课堂活动，具有良好的团队合作精神。",
    };

    const reportData = mapPydanticToReport(mockPydanticData);

    // 应用映射后的数据

    Object.assign(student.value, reportData.student);

    totalCredits.value = reportData.totalCredits;

    gpa.value = reportData.gpa;

    subjects.value = reportData.subjects;

    electives.value = reportData.electives;

    abilities.value = reportData.abilities;

    moralComment.value = reportData.moralComment;

    school.value = reportData.school;

    // 从URL参数更新

    if (route.query.schoolName) school.value.name = route.query.schoolName;

    if (route.query.semesterName)
      school.value.semester = route.query.semesterName;
  } catch (error) {
    console.error("加载成绩报告失败:", error);
  }
};

// 将选修课处理成左右两列的行结构

const electiveRows = computed(() => {
  const rows = [];

  const electivesList = electives.value || [];

  for (let i = 0; i < electivesList.length; i += 2) {
    rows.push({
      left: electivesList[i],

      right: electivesList[i + 1] || {},
    });
  }

  return rows;
});

// --- ECharts 配置 ---

const chartRef = ref(null);

// --- 打印功能 ---

const beforePrint = () => {
  document.body.classList.add("printing");
};

const afterPrint = () => {
  document.body.classList.remove("printing");
};

onMounted(() => {
  loadReportData();

  if (chartRef.value) {
    const myChart = echarts.init(chartRef.value);

    const option = {
      radar: {
        indicator: [
          { name: "学习能力", max: 5 },

          { name: "逻辑思维能力", max: 5 },

          { name: "创新创造能力", max: 5 },

          { name: "团队协作能力", max: 5 },

          { name: "责任心", max: 5 },
        ],

        radius: "64%",

        center: ["56%", "55%"],

        splitNumber: 5,

        axisName: {
          color: "#666",

          fontSize: 10,
        },

        splitLine: {
          lineStyle: {
            color: "#ddd",
          },
        },

        splitArea: {
          show: false,
        },
      },

      series: [
        {
          type: "radar",

          data: [
            {
              value: abilities.value,

              name: "能力维度",

              symbol: "circle",

              symbolSize: 4,

              lineStyle: {
                width: 2,

                color: "#4a90e2",
              },

              itemStyle: {
                color: "#4a90e2",
              },

              areaStyle: {
                color: "rgba(74, 144, 226, 0.05)",
              },
            },
          ],
        },
      ],
    };

    myChart.setOption(option);

    window.addEventListener("resize", () => {
      myChart.resize();
    });
  }

  // 添加打印事件监听

  window.addEventListener("beforeprint", beforePrint);

  window.addEventListener("afterprint", afterPrint);
});

onUnmounted(() => {
  // 移除打印事件监听

  window.removeEventListener("beforeprint", beforePrint);

  window.removeEventListener("afterprint", afterPrint);
});

const handlePrint = () => {
  window.print();
};
</script>

<style scoped>
/* 引入宋体，模拟公文/成绩单风格 */

@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap");

@import "./print.css";

.page-wrapper {
  background-color: #f0f0f0;

  display: flex;

  flex-direction: column;

  align-items: center;

  padding: 20px;

  font-family: "SimSun", "Songti SC", "Noto Serif SC", serif;

  color: #000;
}

.action-bar {
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;

  background-color: #007bff;

  color: white;

  border: none;

  border-radius: 5px;

  cursor: pointer;

  font-size: 16px;
}

button:hover {
  background-color: #0056b3;
}

/* A4 纸张样式模拟 */

.a4-container {
  background: white;

  width: 210mm;

  min-height: 297mm; /* A4 高度 */

  padding: 15mm 15mm; /* 页边距 */

  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  box-sizing: border-box;

  position: relative;
}

/* 通用排版 */

.title {
  text-align: center;

  font-size: 18pt;

  font-weight: bold;

  margin-bottom: 15px;

  margin-top: 10px;
}

.section-title {
  text-align: center;

  font-size: 12pt;

  font-weight: bold;

  margin: 5px 0;
}

/* 表格通用样式 */

table {
  width: 100%;

  border-collapse: collapse;

  margin-bottom: 0; /* 紧凑布局 */

  font-size: 10.5pt; /* 五号字 */
}

th,
td {
  border: 1px solid #000;

  padding: 4px 2px; /* 紧凑内边距 */

  text-align: center;

  height: 24px; /* 单元格固定高度，防止内容为空时塌陷 */
}

/* 1. 学生信息表样式 */

.info-table {
  margin-bottom: 15px;

  border: 2px solid #000; /* 外框加粗 */
}

.info-table .label {
  font-weight: bold;

  background-color: #fff; /* 打印时背景 */
}

.info-table td {
  border: 1px solid #000;
}

/* 2. 成绩单主表样式 */

.score-table {
  border: 1px solid #000;
}

.score-table th {
  font-weight: bold;

  background-color: #fff;
}

.bold-text {
  font-weight: 800;
}

.subject-name {
  letter-spacing: 2px;
}

/* 3. 选修课表样式 */

.elective-table {
  border: 1px solid #000;
}

/* 4. 底部区域 */

.footer-section {
  display: flex;

  justify-content: space-between;

  margin-top: 20px;

  height: 250px; /* 固定高度 */
}

.comments-box {
  width: 55%;

  border: 1px solid #000;

  display: flex;

  flex-direction: column;
}

.box-header {
  border-bottom: 1px solid #000;

  margin: 0;

  padding: 5px 0;

  font-size: 11pt;
}

.comments-content {
  flex: 1;

  /* 留空给手写 */
}

.radar-box {
  width: 40%;

  position: relative;

  display: flex;

  flex-direction: column;

  align-items: center;
}

.radar-title {
  font-size: 11pt;

  color: #666; /* 灰色文字 */

  margin-bottom: 0;

  position: absolute;

  right: 0;

  top: 0;
}

.chart-container {
  width: 100%;

  height: 100%;
}

/* 裁剪标记 (装饰用) */

.crop-mark {
  position: absolute;

  width: 20px;

  height: 20px;

  border-color: #ccc;

  border-style: solid;
}

.top-left {
  top: 10px;

  left: 10px;

  border-width: 1px 0 0 1px;
}

.top-right {
  top: 10px;

  right: 10px;

  border-width: 1px 1px 0 0;
}

.bottom-left {
  bottom: 10px;

  left: 10px;

  border-width: 0 0 1px 1px;
}

/* 按钮样式 */

.print-btn {
  padding: 10px 20px;

  background-color: #007bff;

  color: white;

  border: none;

  border-radius: 5px;

  cursor: pointer;

  font-size: 16px;

  display: flex;

  align-items: center;

  gap: 5px;

  transition: all 0.3s ease;
}

.print-btn:hover {
  background-color: #0056b3;

  transform: translateY(-1px);

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.print-btn span {
  font-size: 18px;
}

/* 打印时隐藏不需要的元素 */

@media print {
  .no-print,
  .action-bar,
  .action-bar * {
    display: none !important;
  }

  .a4-container {
    box-shadow: none;
  }
}

/* --- 最终打印隐藏样式 --- */

@media print {
  * {
    margin: 0;

    padding: 0;
  }

  .page-wrapper {
    background: none;

    position: absolute;

    top: 0;

    left: 0;

    right: 0;

    bottom: 0;

    margin: 0;

    padding: 0;
  }

  .action-bar,
  .action-bar > * {
    display: none !important;
  }
}

/* --- 打印专用样式 --- */

@media print {
  @page {
    size: A4;

    margin: 15mm; /* 设置合理的打印边距 */
  }

  body {
    background: white;

    margin: 0;

    padding: 0;
  }

  .page-wrapper {
    padding: 0;

    background: white;

    display: block;

    min-height: auto;
  }

  /* 隐藏所有不需要打印的元素 */

  .action-bar {
    display: none !important;
  }

  .a4-container {
    box-shadow: none;

    margin: 0;

    width: 100%;

    min-height: auto;

    border: none;

    padding: 10mm; /* 打印时的内边距 */
  }

  /* 强制背景色打印 */

  * {
    -webkit-print-color-adjust: exact;

    print-color-adjust: exact;
  }

  /* 更加紧凑的表格 */

  table {
    font-size: 10pt;
  }

  th,
  td {
    height: 22px;

    padding: 3px 2px;
  }

  /* 确保表格边框打印 */

  table,
  th,
  td {
    border-color: #000 !important;
  }

  /* 优化字体大小以适应打印 */

  .title {
    font-size: 16pt;

    margin-top: 0;

    margin-bottom: 10px;
  }

  .section-title {
    font-size: 11pt;

    margin: 8px 0;
  }

  .footer-section {
    height: 220px;

    margin-top: 15px;
  }

  /* 确保内容不会溢出 */

  .a4-container > * {
    max-width: 100%;
  }
}
</style>
