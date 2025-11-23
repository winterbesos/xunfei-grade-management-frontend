<template>
  <div>
    <!-- A4 纸张容器 -->
    <div class="a4-container">
      <!-- 1. 标题 -->
      <h1 class="main-title">成绩证明单</h1>

      <!-- 2. 证明正文 -->
      <div class="intro-text" v-if="gradeProofData">
        <p>
          兹证明学生 {{ studentInfo.name }}，出生于
          {{ studentInfo.birth }}。该生于
          {{ studentInfo.enrollment_date }} 进入我校就读，现为我校{{
            studentInfo.class_name
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
            <td>{{ row.g1_1 }}</td>
            <td>{{ row.g1_2 }}</td>
            <td>{{ row.g2_1 }}</td>
            <td>{{ row.g2_2 }}</td>
            <td>{{ row.g3_1 }}</td>
            <td>{{ row.g3_2 }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 4. 底部说明与落款 -->
      <div class="footer-section">
        <div class="note">注：学校科目均为百分制。</div>
        <div class="signature">
          <div class="school-name">{{ gradeProofData?.signature }}</div>
          <div class="date">{{ gradeProofData?.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  defineProps,
  watch,
  defineExpose,
} from "vue";

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
  // TODO: 调用API获取真实数据
  // import { getStudentGradeProof } from '@/api/student';
  // getStudentGradeProof(id).then(response => {
  //   gradeProofData.value = response.data;
  // });
  console.log("Fetching data for studentId:", id);

  // 使用模拟数据
  gradeProofData.value = {
    student_id: id, // 使用传入的ID
    student_name: "王艺诺",
    student_birth: "2007 年 3 月 30 日",
    student_enrollment_date: "2022 年 9 月",
    student_class_name: "高三 5 班",
    signature: "上海音乐学院虹口区北虹高级中学教导处",
    date: "2025 年 4 月 29 日",

    politics: {
      level1: { first_semester_score: "90", second_semester_score: "85" },
      level2: { first_semester_score: "78", second_semester_score: "73" },
      level3: { first_semester_score: "88", second_semester_score: "86" },
    },
    chinese: {
      level1: { first_semester_score: "84", second_semester_score: "82" },
      level2: { first_semester_score: "84", second_semester_score: "91" },
      level3: { first_semester_score: "82", second_semester_score: "82" },
    },
    math: {
      level1: { first_semester_score: "86", second_semester_score: "87" },
      level2: { first_semester_score: "84", second_semester_score: "80" },
      level3: { first_semester_score: "72", second_semester_score: "73" },
    },
    english: {
      level1: { first_semester_score: "87", second_semester_score: "87" },
      level2: { first_semester_score: "88", second_semester_score: "87" },
      level3: { first_semester_score: "88", second_semester_score: "81" },
    },
    physics: {
      level1: { first_semester_score: "77", second_semester_score: "77" },
      level2: { first_semester_score: "77", second_semester_score: "72" },
      level3: { first_semester_score: null, second_semester_score: null },
    },
    chemistry: {
      level1: { first_semester_score: "85", second_semester_score: "77" },
      level2: { first_semester_score: "80", second_semester_score: "75" },
      level3: { first_semester_score: null, second_semester_score: null },
    },
    history: {
      level1: { first_semester_score: "94", second_semester_score: "89" },
      level2: { first_semester_score: "86", second_semester_score: "88" },
      level3: { first_semester_score: "96", second_semester_score: "87" },
    },
    geography: {
      level1: { first_semester_score: null, second_semester_score: null },
      level2: { first_semester_score: "86", second_semester_score: "73" },
      level3: { first_semester_score: "96", second_semester_score: "83" },
    },
    biology: {
      level1: { first_semester_score: null, second_semester_score: null },
      level2: { first_semester_score: "80", second_semester_score: "79" },
      level3: { first_semester_score: null, second_semester_score: null },
    },
    information_technology: {
      level1: { first_semester_score: "82", second_semester_score: "81" },
      level2: { first_semester_score: null, second_semester_score: null },
      level3: { first_semester_score: null, second_semester_score: null },
    },
    pe: {
      level1: { first_semester_score: "优", second_semester_score: "优" },
      level2: { first_semester_score: "优", second_semester_score: "优" },
      level3: { first_semester_score: "优", second_semester_score: "优" },
    },
    art: {
      level1: { first_semester_score: "良", second_semester_score: "良" },
      level2: { first_semester_score: "良", second_semester_score: "良" },
      level3: { first_semester_score: null, second_semester_score: null },
    },
  };
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
    return { name: "", birth: "", enrollment_date: "", class_name: "" };
  }
  return {
    name: gradeProofData.value.student_name,
    birth: gradeProofData.value.student_birth,
    enrollment_date: gradeProofData.value.student_enrollment_date,
    class_name: gradeProofData.value.student_class_name,
  };
});

// 科目名称映射
const subjectMap = {
  politics: "政治",
  chinese: "语文",
  math: "数学",
  english: "英语",
  physics: "物理",
  chemistry: "化学",
  history: "历史",
  geography: "地理",
  biology: "生物",
  information_technology: "信息科技",
  pe: "体育",
  art: "艺术",
};

// 将后端数据转换为表格所需的格式
const scores = computed(() => {
  if (!gradeProofData.value) return [];

  const subjectOrder = [
    "politics",
    "chinese",
    "math",
    "english",
    "physics",
    "chemistry",
    "history",
    "geography",
    "biology",
    "information_technology",
    "pe",
    "art",
  ];

  return subjectOrder
    .map((key) => {
      const subjectData = gradeProofData.value[key];
      if (!subjectData) return null;

      return {
        subject: subjectMap[key],
        g1_1: subjectData.level1?.first_semester_score ?? "—",
        g1_2: subjectData.level1?.second_semester_score ?? "—",
        g2_1: subjectData.level2?.first_semester_score ?? "—",
        g2_2: subjectData.level2?.second_semester_score ?? "—",
        g3_1: subjectData.level3?.first_semester_score ?? "—",
        g3_2: subjectData.level3?.second_semester_score ?? "—",
      };
    })
    .filter(Boolean);
});

const handlePrint = () => {
  // Create a style element
  const style = document.createElement("style");
  style.id = "printing-style";

  // Define the print-specific CSS
  style.innerHTML = `
    @media print {
      /* Hide everything in the body by default */
      body > * {
        display: none !important;
      }
      /* Show the overlay and its content */
      .el-overlay {
        display: block !important;
      }
      .el-overlay,
      .el-dialog,
      .el-dialog__body,
      .dialog-content-wrapper {
        position: static !important;
        overflow: visible !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        box-shadow: none !important;
        background-color: white !important;
      }
      .el-dialog__header, .el-dialog__footer {
        display: none !important;
      }
    }
  `;

  // Append the style to the head
  document.head.appendChild(style);

  // Trigger the print dialog
  window.print();

  // Remove the style element after printing
  document.head.removeChild(style);
};

defineExpose({
  handlePrint,
});
</script>

<style scoped>
/* 引入宋体/衬线体，模拟正式文件 */
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap");

.action-bar {
  margin-bottom: 20px;
}

button {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
  margin-right: 20px; /* 日期稍微靠左一点 */
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

  .a4-container {
    width: 100%;
    box-shadow: none;
    margin: 0;
    border: none;
    padding: 20mm; /* 打印时的物理边距 */
  }
}
</style>
