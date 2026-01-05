<template>
  <div class="page-wrapper">
    <!-- 操作栏：打印时会自动隐藏 -->
    <div class="action-bar no-print">
      <button @click="handlePrint" class="action-btn print-btn">
        <span>🖨️</span> 打印成绩单
      </button>
      <button @click="handleExportWord" class="action-btn word-btn">
        <span>💾</span> 保存为 Word
      </button>
    </div>

    <!-- A4 纸张容器 -->
    <div class="a4-container" id="print-area">
      <!-- 标题 -->
      <h1 class="title">
        {{ school.school_name }} {{ school.academic_year_name }}
        {{ school.term_name }} 学生成绩单
      </h1>

      <!-- 1. 学生基本信息表 -->
      <table class="info-table">
        <colgroup>
          <col style="width: 100px" />
          <col style="min-width: 100px" />
          <col style="width: 100px" />
          <col style="min-width: 100px" />
          <col style="width: 100px" />
          <col style="min-width: 100px" />
        </colgroup>
        <tbody>
          <tr>
            <td class="label">班级</td>
            <td>{{ student.year_name }}{{ student.class_name }}</td>
            <td class="label">姓名</td>
            <td>{{ student.student_name }}</td>
            <td class="label">学籍号</td>
            <td>{{ student.student_status_number }}</td>
          </tr>
          <tr>
            <td class="label">性别</td>
            <td>{{ student.gender_text }}</td>
            <td class="label">入学时间</td>
            <td>{{ student.enrollment_date }}</td>
            <td class="label">班主任</td>
            <td>{{ student.header_teacher }}</td>
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
            <th colspan="2">{{ averageGpa }}</th>
          </tr>
          <!-- 表头 -->
          <tr>
            <th>课程名</th>
            <th>期中成绩</th>
            <th>期末成绩</th>
            <th>平时成绩</th>
            <th>学期总评</th>
            <th>学时学分</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in grades" :key="item.subject_code">
            <td class="subject-name">{{ item.subject_name }}</td>
            <td>
              {{ formatReportGrade(item.midterm_score, item.grades_type) }}
            </td>
            <td>
              {{ formatReportGrade(item.finalterm_score, item.grades_type) }}
            </td>
            <td>{{ formatReportGrade(item.usual_score, item.grades_type) }}</td>
            <td>{{ formatReportGrade(item.score, item.grades_type) }}</td>
            <td>{{ item.credits }}</td>
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
            <td>{{ row.left?.subject_name }}</td>
            <td>{{ row.left?.level }}</td>
            <td>{{ row.left?.credit_hours }}</td>
            <td>{{ row.left?.teacher_name }}</td>
            <td>{{ row.right?.subject_name }}</td>
            <td>{{ row.right?.level }}</td>
            <td>{{ row.right?.credit_hours }}</td>
            <td>{{ row.right?.teacher_name }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 4. 底部区域：品格评语 + 雷达图 -->
      <div class="footer-section">
        <!-- 左侧：品格评语 -->
        <div class="comments-box">
          <h3 class="section-title box-header">品格评语</h3>
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
import { ref, onMounted, onUnmounted, computed, defineProps } from "vue";
import { ElMessage } from "element-plus";
import * as echarts from "echarts";
import { useRoute } from "vue-router";
import { printElement } from "@/utils/print.js";
import { teacherAPI } from "@/api/teacher";
import { studentAPI } from "@/api/student";
import { formatReportGrade } from "@/utils/grades.js";

const props = defineProps({
  studentId: {
    type: [String, Number],
    default: null,
  },
  semesterId: {
    type: [String, Number],
    default: null,
  },
});

const route = useRoute();

// 学校信息
const school = ref({
  school_id: "",
  school_name: "",
  semester_id: "",
  semester_name: "",
});

// 学生基本信息
const student = ref({
  class_id: "",
  class_name: "",
  year_name: "",
  student_id: "",
  student_name: "",
  student_status_number: "",
  gender: 1,
  gender_text: "",
  enrollment_date: "",
  header_teacher: "",
});

const totalCredits = ref("0");
const averageGpa = ref("0.0");

// 必修科目数据 (SemesterGradeItem)
const grades = ref([]);

// 选修课数据 (ElectiveSubjectGradeItem)
const electiveGrades = ref([]);

// 能力评价 (AbilityComment)
const abilities = ref({
  study_ability: 0,
  logical_thinking: 0,
  creativity: 0,
  teamwork: 0,
  responsibility: 0,
});

// 品格评语
const moralComment = ref("");

const getEffectiveParams = () => {
  return {
    semesterId: props.semesterId || route.params.semesterId,
    studentId: props.studentId || route.params.studentId,
  };
};

const loadReportData = async () => {
  const { semesterId, studentId } = getEffectiveParams();

  let promise = null;
  if (studentId) {
    promise = teacherAPI.getStudentSemesterReport(studentId, semesterId);
  } else {
    promise = studentAPI.getMySemesterReport(semesterId);
  }

  promise
    .then((response) => {
      if (response.status !== 200) {
        ElMessage.error("加载学生列表失败");
        return;
      }

      // 应用数据
      school.value = {
        school_id: response.data.school_id,
        school_name: response.data.school_name,
        semester_id: response.data.semester_id,
        semester_name: response.data.semester_name,
        term_name: response.data.term_name,
        academic_year_name: response.data.academic_year_name,
      };

      student.value = {
        class_id: response.data.class_id,
        class_name: response.data.class_name,
        year_name: response.data.year_name,
        student_id: response.data.student_id,
        student_name: response.data.student_name,
        student_status_number: response.data.student_status_number,
        gender: response.data.gender,
        gender_text:
          response.data.gender === 1
            ? "男"
            : response.data.gender === 2
              ? "女"
              : "",
        enrollment_date: response.data.enrollment_date,
        header_teacher: response.data.header_teacher,
      };

      totalCredits.value = response.data.total_credits;
      averageGpa.value = response.data.average_gpa;
      grades.value = response.data.grades;
      electiveGrades.value = response.data.elective_grades;
      moralComment.value = response.data.moral_education_comment;
      abilities.value = response.data.abilities;

      // 更新图表
      if (chartRef.value && myChart) {
        updateChart();
      }
    })
    .catch((error) => {
      console.error("获取成绩报告失败:", error);
    });
};

// 将选修课处理成左右两列的行结构
const electiveRows = computed(() => {
  const rows = [];
  const list = electiveGrades.value || [];
  for (let i = 0; i < list.length; i += 2) {
    rows.push({
      left: list[i],
      right: list[i + 1] || {},
    });
  }
  return rows;
});

// --- ECharts 配置 ---
const chartRef = ref(null);
let myChart = null;

const updateChart = () => {
  if (!myChart) return;

  const option = {
    radar: {
      indicator: [
        { name: "学习能力", max: 10 },
        { name: "逻辑思维", max: 10 },
        { name: "创新创造", max: 10 },
        { name: "团队协作", max: 10 },
        { name: "责任心", max: 10 },
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
            value: [
              abilities.value.study_ability,
              abilities.value.logical_thinking,
              abilities.value.creativity,
              abilities.value.teamwork,
              abilities.value.responsibility,
            ],
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
};

// --- 打印功能 ---
const handlePrint = () => {
  const printContent = document.getElementById("print-area");
  if (printContent) {
    replaceChartsWithImages(printContent);
    printElement(printContent);
  }
};

const handleExportWord = () => {
  // 1. 克隆 DOM 以免影响页面显示
  const originalContent = document.getElementById("print-area");
  if (!originalContent) return;

  const clonedContent = originalContent.cloneNode(true);

  // 2. 处理图表：获取原图表的 base64，插入到克隆节点中
  if (myChart) {
    const dataURL = myChart.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#fff",
    });

    // 在克隆节点中找到图表容器
    const clonedChartContainer =
      clonedContent.querySelector(".chart-container");
    if (clonedChartContainer) {
      clonedChartContainer.innerHTML = "";
      const img = new Image();
      img.src = dataURL;
      // 设置固定宽高，防止Word中变形
      img.width = 272;
      img.height = 250;
      clonedChartContainer.appendChild(img);
    }
  }

  // 3. 构建包含样式的 HTML
  // Word 对 CSS 支持有限，尽量使用 inline style 或者简单的 class
  // 关键：使用 @page 设置页边距，模拟 A4
  const style = `
    <style>
      @page {
        size: A4;
        margin: 15mm 15mm;
      }
      body { 
        font-family: 'SimSun', '宋体', serif; 
        color: #000; 
      }
      .a4-container { 
        width: 100%; 
        box-sizing: border-box;
      }
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
      
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-bottom: 0; 
        font-size: 10.5pt; 
      }
      th, td { 
        border: 1px solid #000; 
        padding: 4px 2px; 
        text-align: center; 
        height: 24px; 
        vertical-align: middle;
      }
      
      .info-table { 
        margin-bottom: 15px; 
        border: 2px solid #000; 
      }
      /* Word有时需要对 td 明确指定边框 */
      .info-table td { 
        border: 1px solid #000; 
      } 
      .info-table .label { 
        font-weight: bold; 
        background-color: #ffffff; 
      }
      
      .score-table th { 
        font-weight: bold; 
        background-color: #ffffff; 
      }
      .bold-text { 
        font-weight: 800; 
      }
      
      /* 底部区域改为表格布局 */
      .footer-table { 
        width: 100%; 
        border: none; 
        margin-top: 30px; /* 增加与上方选修课表格的间距 */
      }
      .footer-table td { 
        border: none; 
        vertical-align: top; 
        padding: 0; 
      }
      
      /* 专门为 Word 导出设计的品格评语表格 */
      .comments-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000; /* 外边框 */
        height: 250px; /* 固定高度，与雷达图保持一致 */
      }
      .comments-table td {
        border: none; /* 移除默认的单元格边框，防止双重边框 */
        border-right: 1px solid #000; /* 确保右边框闭合，虽然 collapse 下 table border 应该够了，但在 Word 里保险起见 */
        border-left: 1px solid #000;
      }
      /* 修正：collapse 模式下，table border 已经涵盖了外围，内部 td 不需要左右 border，除非是多列。
         这里只有一列，所以 td 不需要左右 border，只需要 top/bottom 分隔线。
      */
      .comments-table td {
         border: none;
      }
      
      .box-header-cell {
        height: 30px;
        background-color: #ffffff;
        font-weight: bold;
        text-align: center;
        border-bottom: 1px solid #000 !important; /* 标题栏下边框 */
        font-size: 11pt;
      }
      
      .comments-content-cell {
        vertical-align: top;
        padding: 10px;
        font-size: 11pt;
        line-height: 1.5;
        text-indent: 2em;
        text-align: left;
      }
      
      .radar-box-inner { 
        text-align: center; 
        height: 250px; /* 确保高度一致 */
      }
      .radar-title-static { 
        font-size: 11pt; 
        color: #666; 
        text-align: right; 
        margin-bottom: 2px;
        height: 20px;
      }
    </style>
  `;

  // 针对 footer 部分，由于 Word 对 flex 支持不好，我们将 clone 中的 footer-section 替换为 table 布局
  const footerSection = clonedContent.querySelector(".footer-section");
  if (footerSection) {
    // const commentsBox = footerSection.querySelector(".comments-box");
    // const radarBox = footerSection.querySelector(".radar-box");
    // 注意：radarBox 里有 absolute 定位的 title，Word 支持不好，需要重构结构
    const radarContainer = clonedContent.querySelector(".chart-container"); // 已经替换为 img

    // 调整图片大小以适应 250px 总高度 (减去标题高度)
    if (radarContainer) {
      const img = radarContainer.querySelector("img");
      if (img) {
        img.height = 228; // 250 - 20 (title) - 2 (margin)
        img.width = 250; // 保持比例微调
      }
    }

    const footerTable = document.createElement("table");
    footerTable.className = "footer-table";

    // 手动构建右侧雷达图区域，避免 absolute positioning
    const rightCellContent = `
       <div class="radar-box-inner">
         <div class="radar-title-static">雷达图</div>
         ${radarContainer ? radarContainer.innerHTML : ""} 
       </div>
    `;
    // 注意：上面用了 innerHTML，因为 radarContainer 本身是 div，我们只需要里面的 img

    // 关键：使用 table 替换 div.comments-box 以确保 Word 中边框显示正常
    // 获取原有的评语内容
    const originalMoralComment = moralComment.value || "";

    const leftCellContent = `
      <table class="comments-table">
        <tr>
          <td class="box-header-cell">品格评语</td>
        </tr>
        <tr>
          <td class="comments-content-cell">${originalMoralComment}</td>
        </tr>
      </table>
    `;

    footerTable.innerHTML = `
      <tr>
        <td style="width: 55%; padding-right: 15px;">
          ${leftCellContent}
        </td>
        <td style="width: 45%; padding-left: 15px;">
           ${rightCellContent}
        </td>
      </tr>
    `;
    footerSection.parentNode.replaceChild(footerTable, footerSection);
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${school.value.school_name || "学生"}成绩单</title>
        ${style}
      </head>
      <body>
        <div class="a4-container">
          ${clonedContent.innerHTML}
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], {
    type: "application/msword;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${school.value.term_name || ""}成绩单_${student.value.student_name}.doc`;
  link.click();
  URL.revokeObjectURL(link.href);
};

function replaceChartsWithImages(root = document) {
  // 假设每个图表容器都有 class="echart"
  const chartEls = root.querySelectorAll(".chart-container");
  chartEls.forEach((el) => {
    const chart = echarts.getInstanceByDom(el);
    if (!chart) return;

    // 关键：先确保尺寸正确
    chart.resize();

    const dataURL = chart.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#fff",
    });

    const img = new Image();
    img.src = dataURL;
    img.style.width = el.clientWidth + "px";
    img.style.height = el.clientHeight + "px";

    // 用 img 替换掉原容器（或 append 到容器里并隐藏 canvas）
    el.innerHTML = "";
    el.appendChild(img);
  });
}

onMounted(() => {
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value);
    window.addEventListener("resize", () => {
      myChart && myChart.resize();
    });
  }

  loadReportData();
});

onUnmounted(() => {
  if (myChart) {
    myChart.dispose();
  }
});
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
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.action-btn {
  padding: 10px 20px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.action-btn span {
  font-size: 18px;
}

.print-btn {
  background-color: #409eff; /* Element Plus Primary Blue */
}

.print-btn:hover {
  background-color: #66b1ff;
}

.word-btn {
  background-color: #67c23a; /* Element Plus Success Green */
}

.word-btn:hover {
  background-color: #85ce61;
}
.a4-container {
  background: white;
  width: 210mm;
  min-height: 297mm; /* A4 高度 */
  padding: 15mm 15mm; /* 页边距 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  position: relative;
  /* Ensure font persists when printed in isolation */
  font-family: "SimSun", "Songti SC", "Noto Serif SC", serif;
  color: #000;
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
  word-break: break-word;
  overflow-wrap: break-word;
  flex: 1;
  /* 留空给手写 */
  padding: 10px;
  font-size: 11pt;
  line-height: 1.5;
  text-indent: 2em;
}

.radar-box {
  width: 272px;
  height: 250px;
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
  width: 272px;
  height: 250px;
}


</style>
