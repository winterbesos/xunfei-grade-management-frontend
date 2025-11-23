<template>
  <div class="page-wrapper">
    <!-- 打印操作栏 -->
    <div class="action-bar">
      <button @click="handlePrint">🖨️ 打印证明单</button>
    </div>

    <!-- A4 纸张容器 -->
    <div class="a4-container">
      <!-- 1. 标题 -->
      <h1 class="main-title">成绩证明单</h1>

      <!-- 2. 证明正文 -->
      <div class="intro-text">
        <p>
          兹证明学生{{ student.name }}，性别{{ student.gender }}，出生于
          {{ student.birthday }}。该生于
          {{ student.admissionDate }} 进入我校就读，现为我校{{
            student.currentClass
          }}学生。该生在校成绩如下：
        </p>
      </div>

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
          <div class="school-name">上海音乐学院虹口区北虹高级中学教导处</div>
          <div class="date">{{ currentDate }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// --- 数据定义 (完全复刻图片内容) ---
const student = ref({
  name: "王艺诺",
  gender: "女",
  birthday: "2007 年 3 月 30 日",
  admissionDate: "2022 年 9 月",
  currentClass: "高三 5 班",
});

const currentDate = ref("2025 年 4 月 29 日");

// 成绩数据
const scores = ref([
  {
    subject: "政治",
    g1_1: "90",
    g1_2: "85",
    g2_1: "78",
    g2_2: "73",
    g3_1: "88",
    g3_2: "86",
  },
  {
    subject: "语文",
    g1_1: "84",
    g1_2: "82",
    g2_1: "84",
    g2_2: "91",
    g3_1: "82",
    g3_2: "82",
  },
  {
    subject: "数学",
    g1_1: "86",
    g1_2: "87",
    g2_1: "84",
    g2_2: "80",
    g3_1: "72",
    g3_2: "73",
  },
  {
    subject: "英语",
    g1_1: "87",
    g1_2: "87",
    g2_1: "88",
    g2_2: "87",
    g3_1: "88",
    g3_2: "81",
  },
  {
    subject: "物理",
    g1_1: "77",
    g1_2: "77",
    g2_1: "77",
    g2_2: "72",
    g3_1: "—",
    g3_2: "—",
  },
  {
    subject: "化学",
    g1_1: "85",
    g1_2: "77",
    g2_1: "80",
    g2_2: "75",
    g3_1: "—",
    g3_2: "—",
  },
  {
    subject: "历史",
    g1_1: "94",
    g1_2: "89",
    g2_1: "86",
    g2_2: "88",
    g3_1: "96",
    g3_2: "87",
  },
  {
    subject: "地理",
    g1_1: "—",
    g1_2: "—",
    g2_1: "86",
    g2_2: "73",
    g3_1: "96",
    g3_2: "83",
  },
  {
    subject: "生物",
    g1_1: "—",
    g1_2: "—",
    g2_1: "80",
    g2_2: "79",
    g3_1: "—",
    g3_2: "—",
  },
  {
    subject: "信息科技",
    g1_1: "82",
    g1_2: "81",
    g2_1: "—",
    g2_2: "—",
    g3_1: "—",
    g3_2: "—",
  },
  {
    subject: "体育",
    g1_1: "优",
    g1_2: "优",
    g2_1: "优",
    g2_2: "优",
    g3_1: "优",
    g3_2: "优",
  },
  {
    subject: "艺术",
    g1_1: "良",
    g1_2: "良",
    g2_1: "良",
    g2_2: "良",
    g3_1: "—",
    g3_2: "—",
  },
]);

const handlePrint = () => {
  window.print();
};
</script>

<style scoped>
/* 引入宋体/衬线体，模拟正式文件 */
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap");

.page-wrapper {
  background-color: #f0f0f0;
  min-height: 100vh;
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
