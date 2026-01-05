<template>
  <div class="page-wrapper">
    <!-- 打印操作栏 -->
    <div class="action-bar no-print">
      <button @click="handlePrint" class="action-btn print-btn">
        <span>🖨️</span> 打印证明单
      </button>
      <button @click="handleExportWord" class="action-btn word-btn">
        <span>💾</span> 保存为 Word
      </button>
    </div>

    <!-- A4 纸张容器 -->
    <div class="a4-container">
      <!-- 1. 标题 -->
      <h1 class="main-title">成绩证明单</h1>

      <!-- 2. 证明正文 -->
      <div class="intro-text" v-if="gradeProofData">
        <p>
          兹证明学生
          {{
            studentInfo.name
          }}，出生于&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          。该生于&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;进入我校就读，现为我校{{
            studentInfo.year_name + studentInfo.class_name
          }}学生。该生在校成绩如下：
        </p>
      </div>
      <div v-else>加载中...</div>

      <!-- 3. 成绩表格 -->
      <table class="score-table">
        <thead>
          <!-- 表头第一行：学科 + 年级 -->
          <tr>
            <th rowspan="2" class="col-subject">
              学<br /><br />科
              <!-- 模拟图片中竖向的排版感 -->
            </th>
            <th colspan="2">高 一</th>
            <th colspan="2">高 二</th>
            <th colspan="2">高 三</th>
          </tr>
          <!-- 表头第二行：学期 -->
          <tr>
            <th class="semester-col">第一学期</th>
            <th class="semester-col">第二学期</th>
            <th class="semester-col">第一学期</th>
            <th class="semester-col">第二学期</th>
            <th class="semester-col">第一学期</th>
            <th class="semester-col">第二学期</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in scores" :key="index">
            <td class="subject-name">{{ row.subject }}</td>
            <td>{{ formatProofGrade(row.g1_1, row.type) }}</td>
            <td>{{ formatProofGrade(row.g1_2, row.type) }}</td>
            <td>{{ formatProofGrade(row.g2_1, row.type) }}</td>
            <td>{{ formatProofGrade(row.g2_2, row.type) }}</td>
            <td>{{ formatProofGrade(row.g3_1, row.type) }}</td>
            <td>{{ formatProofGrade(row.g3_2, row.type) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 4. 底部说明与落款 -->
      <div class="footer-section">
        <div class="note">注：学校科目均为百分制。</div>
        <div class="signature">
          <div class="school-name">{{ gradeProofData?.signature }}</div>
          <div class="date">{{ gradeProofData?.signature_date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, watch } from "vue";
import { printElement } from "@/utils/print";
import { teacherAPI } from "@/api/teacher";
import { ElMessage } from "element-plus";
import { formatProofGrade } from "@/utils/grades";

// --- 组件Props ---
const props = defineProps({
  studentId: {
    type: [String, Number],
    required: true,
  },
});

// --- 数据定义 ---

// 后端返回的数据模型
const gradeProofData = ref(null);

// 获取数据的函数

const fetchData = (id) => {
  teacherAPI
    .getStudentGradeProof(id)
    .then((response) => {
      if (response.status !== 200) {
        ElMessage.error("加载学生列表失败");

        return;
      }

      gradeProofData.value = response.data;
    })

    .catch((error) => {
      console.error("获取成绩报告失败:", error);
    });
};

// 模拟从API获取数据

onMounted(() => {
  fetchData(props.studentId);
});

// 监听 prop 变化，以便在 Dialog 复用时能重新加载数据

watch(
  () => props.studentId,

  (newId) => {
    if (newId) {
      fetchData(newId);
    }
  },
);

const studentInfo = computed(() => {
  if (!gradeProofData.value) {
    return {
      name: "",
      birth: "",
      enrollment_date: "",
      class_name: "",
      year_name: "",
    };
  }

  return {
    name: gradeProofData.value.student.user_name,

    birth: gradeProofData.value.student.birth_date,

    enrollment_date: gradeProofData.value.student.enrollment_date,

    class_name: gradeProofData.value.student.class_name,
    year_name: gradeProofData.value.student.year_name,
  };
});

// 将后端数据转换为表格所需的格式

const scores = computed(() => {
  if (!gradeProofData.value || !gradeProofData.value.subject_grades) return [];

  return gradeProofData.value.subject_grades.map((subjectItem) => {
    const row = {
      subject: subjectItem.subject_name,
      type: subjectItem.grades_type, // 传递学科类型以便格式化
      g1_1: null,
      g1_2: null,
      g2_1: null,
      g2_2: null,
      g3_1: null,
      g3_2: null,
    };

    if (subjectItem.year_grades) {
      subjectItem.year_grades.forEach((yearItem, yearIndex) => {
        if (yearIndex < 3 && yearItem.term_grades) {
          row[`g${yearIndex + 1}_1`] =
            yearItem.term_grades.term_1_score || null;
          row[`g${yearIndex + 1}_2`] =
            yearItem.term_grades.term_2_score || null;
        }
      });
    }

    return row;
  });
});

const handlePrint = () => {
  const container = document.querySelector(".a4-container");
  if (container) {
    printElement(container);
  }
};

const handleExportWord = () => {
  const content = document.querySelector(".a4-container").innerHTML;
  // 构建包含样式的完整 HTML
  // 注意：Word 对 CSS 的支持有限，尽量使用简单的 CSS
  const style = `
    <style>
      body { font-family: 'SimSun', '宋体', serif; }
      .main-title { text-align: center; font-size: 22pt; font-weight: bold; margin-bottom: 30px; }
      .intro-text { font-size: 12pt; line-height: 1.8; margin-bottom: 15px; }
      .intro-text p { text-indent: 2em; margin: 0; text-align: justify; }
      .score-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 11pt; margin-bottom: 10px; }
      .score-table th, .score-table td { border: 1px solid #000; text-align: center; padding: 6px 2px; }
      .col-subject { width: 80px; }
      .subject-name { text-align: left; padding-left: 15px; }
      .footer-section { margin-top: 10px; height: 100px; overflow: hidden; }
      .note { float: left; font-size: 10.5pt; }
      .signature { float: right; text-align: right; margin-top: 30px; font-size: 12pt; }
      .school-name { margin-bottom: 5px; }
    </style>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>成绩证明</title>
        ${style}
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  // 使用 .doc 后缀，Word 能更好识别这种 HTML 格式
  link.download = `成绩证明_${studentInfo.value.name}.doc`;
  link.click();
  URL.revokeObjectURL(link.href);
};
</script>

<style scoped>
/* 引入宋体/衬线体，模拟正式文件 */
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap");

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
  background-color: #409eff;
}

.print-btn:hover {
  background-color: #66b1ff;
}

.word-btn {
  background-color: #67c23a;
}

.word-btn:hover {
  background-color: #85ce61;
}

/* A4 纸张模拟 */
.a4-container {
  background: white;
  width: 210mm;
  min-height: 297mm;
  padding: 25mm 20mm; /* 标准公文页边距 */
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  position: relative;
}

/* 1. 标题样式 */
.main-title {
  text-align: center;
  font-size: 22pt;
  font-weight: 900; /* 加粗 */
  margin-top: 0;
  margin-bottom: 30px;
  letter-spacing: 2px;
}

/* 2. 正文样式 */
.intro-text {
  font-size: 12pt;
  line-height: 1.8;
  margin-bottom: 15px;
}

.intro-text p {
  text-indent: 2em; /* 首行缩进两个字符 */
  margin: 0;
  text-align: justify; /* 两端对齐 */
}

/* 3. 表格样式 */
.score-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  font-size: 11pt;
  margin-bottom: 10px;
}

.score-table th,
.score-table td {
  border: 1px solid #000;
  text-align: center;
  padding: 6px 2px;
  height: 26px; /* 固定行高，保持整齐 */
}

.score-table th {
  font-weight: normal; /* 图片中的表头好像不是特别粗，或者只是普通加粗 */
  background-color: #fff; /* 保持白底，图片里是灰的是因为拍照光线 */
}

.col-subject {
  width: 80px;
  font-size: 12pt;
  vertical-align: middle;
}

.semester-col {
  font-size: 10.5pt;
}

.subject-name {
  text-align: left;
  padding-left: 15px; /* 增加左侧间距，让文字居中偏左一点，或者直接居左好看 */
  text-align: center; /* 图片里看起来是居中的 */
}

/* 4. 底部样式 */
.footer-section {
  margin-top: 10px;
  position: relative;
  height: 100px;
}

.note {
  float: left;
  font-size: 10.5pt;
}

.signature {
  float: right;
  text-align: right;
  margin-top: 30px; /* 与表格拉开距离 */
  font-size: 12pt;
  line-height: 1.6;
}

.school-name {
  margin-bottom: 5px;
}

.date {
}

/* --- 打印专用样式 --- */
@media print {
  .no-print {
    display: none;
  }
  @page {
    size: A4;
    margin: 0;
  }

  body {
    margin: 0;
  }

  .page-wrapper {
    padding: 0;
    background: transparent;
    display: block;
  }

  .action-bar {
    display: none;
  }

  .a4-container {
    width: 100%;
    box-shadow: none;
    margin: 0;
    border: none;
    padding: 20mm; /* 打印时的物理边距 */
  }
}
</style>
