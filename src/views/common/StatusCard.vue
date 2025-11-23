<template>
  <div>
    <div class="print-area">
      <!-- ================= 第一页：基本信息与成绩 ================= -->
      <div class="page page-front">
        <!-- 顶部标题 -->
        <div class="header">
          <h1 class="card-title">
            上海市高中学生学籍卡（{{ info.gradYear }} 届）
          </h1>
          <div class="sub-header">
            <span>区：{{ info.district }}</span>
            <span style="margin-left: 20px">学校：{{ info.school }}</span>
          </div>
        </div>

        <!-- 基本信息表 -->
        <table class="base-table">
          <colgroup>
            <col style="width: 80px" />
            <col style="width: 120px" />
            <col style="width: 50px" />
            <col style="width: 50px" />
            <col style="width: 50px" />
            <col style="width: 60px" />
            <col style="width: 50px" />
            <col style="width: 80px" />
            <col style="width: 100px" />
            <!-- 照片列 -->
          </colgroup>
          <tbody>
            <tr>
              <td class="label">姓名</td>
              <td colspan="2">{{ info.name }}</td>
              <td class="label">性别</td>
              <td>{{ info.gender }}</td>
              <td class="label">民族</td>
              <td>{{ info.nation }}</td>
              <td class="label">籍贯</td>
              <td>{{ info.nativePlace }}</td>
              <td rowspan="4" class="photo-cell">
                <div class="photo-box">
                  <img v-if="info.photo" :src="info.photo" alt="照片" />
                  <span v-else>照片<br />(离校时贴)</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="label">证件类型</td>
              <td colspan="2">居民身份证</td>
              <td class="label">证件号码</td>
              <td colspan="3">{{ info.idCard }}</td>
              <td class="label">出生日期</td>
              <td>{{ info.birthday }}</td>
            </tr>
            <tr>
              <td class="label">全国学籍号</td>
              <td colspan="3">{{ info.nationalCode }}</td>
              <td colspan="2" class="label">上海市学籍号</td>
              <td colspan="2">{{ info.shanghaiCode }}</td>
            </tr>
            <tr>
              <td class="label">原毕业学校</td>
              <td colspan="3">{{ info.middleSchool }}</td>
              <td colspan="2" class="label">健康状况</td>
              <td>{{ info.health }}</td>
              <td class="label">入团(党)<br />时间</td>
            </tr>
            <tr>
              <td class="label">户籍地址</td>
              <td colspan="4">{{ info.hukouAddress }}</td>
              <td class="label">街道居委</td>
              <td colspan="2">{{ info.hukouStreet }}</td>
              <td rowspan="2" class="label">学籍变更情况</td>
            </tr>
            <tr>
              <td class="label">现住地址</td>
              <td colspan="4">{{ info.currentAddress }}</td>
              <td class="label">街道居委</td>
              <td colspan="2">{{ info.currentStreet }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 家庭成员与转学信息 -->
        <div class="middle-section">
          <!-- 左侧：家庭成员 -->
          <table class="family-table">
            <colgroup>
              <col style="width: 30px" />
              <col style="width: 40px" />
              <col style="width: 60px" />
              <col style="width: 60px" />
              <col />
              <col style="width: 100px" />
            </colgroup>
            <tbody>
              <tr>
                <td rowspan="3" class="vertical-text">家庭主要成员</td>
                <td class="label">称谓</td>
                <td class="label">姓名</td>
                <td class="label">政治面貌</td>
                <td class="label">工作单位</td>
                <td class="label">联系电话</td>
              </tr>
              <tr v-for="member in family" :key="member.relation">
                <td>{{ member.relation }}</td>
                <td>{{ member.name }}</td>
                <td>{{ member.face }}</td>
                <td>{{ member.job }}</td>
                <td>{{ member.phone }}</td>
              </tr>
            </tbody>
          </table>
          <!-- 右侧：入本校日期 -->
          <div class="entry-date-box">
            <div class="vertical-text-box">入本校日期</div>
            <div class="date-val">{{ info.entryDate }}</div>
          </div>
        </div>

        <!-- 学业成绩表 -->
        <table class="grade-table">
          <thead>
            <tr>
              <th colspan="2">学业成绩</th>
              <th v-for="sub in subjects" :key="sub">{{ sub }}</th>
              <th rowspan="17" class="vertical-text narrow-col">
                转入本校日期及原因
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- 高一 -->
            <template v-for="(grade, gIndex) in grades" :key="gIndex">
              <tr>
                <td rowspan="4" class="vertical-text label-bg">
                  {{ grade.name }}
                </td>
                <td class="label">上学期</td>
                <td v-for="(sub, sIndex) in subjects" :key="sIndex">
                  {{ getScore(gIndex, 0, sub) }}
                </td>
              </tr>
              <tr>
                <td class="label">下学期</td>
                <td v-for="(sub, sIndex) in subjects" :key="sIndex">
                  {{ getScore(gIndex, 1, sub) }}
                </td>
              </tr>
              <tr>
                <td class="label">总评</td>
                <td v-for="(sub, sIndex) in subjects" :key="sIndex">
                  {{ getScore(gIndex, 2, sub) }}
                </td>
              </tr>
              <tr>
                <td class="label">补考</td>
                <td v-for="(sub, sIndex) in subjects" :key="sIndex"></td>
              </tr>
            </template>

            <!-- 学业水平考试 -->
            <tr>
              <td rowspan="2" class="vertical-text label-bg">
                学业水平<br />考试
              </td>
              <td class="label">成绩</td>
              <td :colspan="subjects.length"></td>
            </tr>
            <tr>
              <td class="label">补考</td>
              <td :colspan="subjects.length"></td>
            </tr>
          </tbody>
        </table>

        <!-- 侧边栏：转出日期/毕业信息 (利用 absolute 定位模拟表格右侧合并效果) -->
        <div class="side-info-overlay">
          <!-- 这里的布局比较特殊，为了简化HTML结构，通常用 CSS Grid 或者 absolute 覆盖 -->
          <!-- 实际上面的 table 结构中最后一列已经占位，这里不需要额外写，直接在表格里处理 -->
        </div>

        <!-- 底部变动栏 -->
        <table class="footer-table">
          <tr>
            <td class="vertical-text" rowspan="5" style="width: 30px">
              转出本校日期及原因
            </td>
            <!-- 这里为了对齐图片，其实是跟上面的表格并列的，但在HTML里为了方便打印，分开写 -->
          </tr>
        </table>

        <!-- 修正布局：为了完美对齐图片，我们使用一个新的底部结构 -->
        <div class="bottom-layout">
          <div class="left-bottom">
            <div class="row">
              <span class="label">休学日期及原因</span>
              <span class="val"></span>
              <span class="label">复学日期</span>
              <span class="val"></span>
            </div>
            <div class="row">
              <span class="label">退学日期及原因</span>
              <span class="val">{{ info.dropoutInfo }}</span>
              <span class="label">退学后去向</span>
              <span class="val">{{ info.dropoutDest }}</span>
            </div>
          </div>
          <div class="right-bottom">
            <div class="vertical-col">其他学籍变更情况</div>
            <div class="vertical-col">毕业日期及证书编号</div>
            <div class="vertical-col">毕业后去向</div>
          </div>
        </div>

        <div class="footer-sign">上海市教育委员会基础教育处制</div>
      </div>

      <!-- ================= 第二页：品德评语（背面） ================= -->
      <div class="page page-back">
        <table class="comments-table">
          <colgroup>
            <col style="width: 40px" />
            <!-- 年级 -->
            <col style="width: 50%" />
            <!-- 第一学期 -->
            <col style="width: 50%" />
            <!-- 第二学期 -->
          </colgroup>

          <!-- 高一 -->
          <tr class="h-33">
            <td class="vertical-text label-bg">高一年级</td>
            <td class="cell-content">
              <div class="term-header">第一学期品德测评成绩</div>
              <div class="term-row">
                品德总评等第：<span class="handwriting">优秀</span>
              </div>
              <div class="term-label">评语：</div>
              <div class="comment-text handwriting">
                {{ comments.g1.t1 }}
              </div>
              <div class="sign-box">
                班主任（签名）<span class="handwriting">邢怡</span>
                <span class="date">23 年 1 月 13 日</span>
              </div>
            </td>
            <td class="cell-content">
              <div class="term-header">第二学期品德测评成绩</div>
              <div class="term-row">品德总评等第：</div>
              <div class="term-label">评语：</div>
              <div class="comment-text handwriting">
                {{ comments.g1.t2 }}
              </div>
              <div class="sign-box">
                班主任（签名）
                <span class="date">2023 年 6 月 25 日</span>
              </div>
            </td>
          </tr>

          <!-- 高二 -->
          <tr class="h-33">
            <td class="vertical-text label-bg">高二年级</td>
            <td class="cell-content">
              <div class="term-header">第一学期品德测评成绩</div>
              <div class="term-row">品德总评等第：</div>
              <div class="term-label">评语：</div>
              <div class="comment-text handwriting check-mark">
                <!-- 模拟那个大大的对钩 -->
                ✓
              </div>
              <div class="sign-box">
                班主任（签名）
                <span class="date">年 月 日</span>
              </div>
            </td>
            <td class="cell-content">
              <div class="term-header">第二学期品德测评成绩</div>
              <div class="term-row">品德总评等第：</div>
              <div class="term-label">评语：</div>
              <div class="comment-text handwriting check-mark">✓</div>
              <div class="sign-box">
                班主任（签名）
                <span class="date">年 月 日</span>
              </div>
            </td>
          </tr>

          <!-- 高三 -->
          <tr class="h-33">
            <td class="vertical-text label-bg">高三年级</td>
            <td class="cell-content">
              <div class="term-header">第一学期品德测评成绩</div>
              <div class="term-row">品德总评等第：</div>
              <div class="term-label">评语：</div>
              <div class="comment-text handwriting check-mark">✓</div>
              <div class="sign-box">
                班主任（签名）
                <span class="date">年 月 日</span>
              </div>
            </td>
            <td class="cell-content">
              <div class="term-header">第二学期品德测评成绩</div>
              <div class="term-row">品德总评等第：</div>
              <div class="term-label">评语：</div>
              <div class="comment-text handwriting check-mark">✓</div>
              <div class="sign-box">
                班主任（签名）
                <span class="date">年 月 日</span>
              </div>
            </td>
          </tr>
        </table>

        <div class="remarks-box">
          <div class="label-vertical">备注</div>
          <div class="content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch, defineExpose } from "vue";

// --- 组件Props ---
const props = defineProps({
  studentId: {
    type: [String, Number],
    required: true,
  },
});

const fetchData = (id) => {
  console.log("Fetching status card data for studentId:", id);
  // 在这里，你可以根据id从API获取学生数据并更新下面的ref
  // 例如:
  // const studentData = await studentAPI.getStudentDetails(id);
  // info.value = studentData.info;
  // family.value = studentData.family;
  // ...等等
};

// --- 数据定义 ---
const info = ref({
  gradYear: "2025",
  district: "虹口区",
  school: "上海市北虹高级中学",
  name: "李尚颐",
  gender: "男性",
  nation: "汉族",
  nativePlace: "浙江省",
  idCard: "310109200706152017",
  birthday: "2007-06-15",
  nationalCode: "G310109200706152017",
  shanghaiCode: "3101093003320220155",
  middleSchool: "上海民办沪东外国语学校",
  health: "健康或良好",
  hukouAddress: "四平路780弄4号2404室",
  hukouStreet: "嘉兴路街道",
  currentAddress: "四平路780弄4号2404室",
  currentStreet: "街道居委",
  entryDate: "2022.9",
  dropoutInfo: "2023.12.25 退学",
  dropoutDest: "出国",
  photo: "https://via.placeholder.com/100x130?text=Photo", // 替换为真实图片URL
});

const family = ref([
  { relation: "父亲", name: "李增阳", face: "", job: "", phone: "18917576009" },
  { relation: "母亲", name: "吴颖洁", face: "", job: "", phone: "13611652548" },
]);

const subjects = [
  "思想政治",
  "语文",
  "数学",
  "外语",
  "物理",
  "化学",
  "生命科学",
  "历史",
  "地理",
  "艺术",
  "体育与健身",
  "劳动技术",
  "信息科技",
];

// 成绩数据结构：[高一上, 高一下, 高一总评, 高二上...]
// 为了演示方便，这里用简单对象，实际开发建议用更严谨的结构
const scoresRaw = {
  g1: {
    t1: {
      思想政治: 74,
      语文: 63,
      数学: 76,
      外语: 86,
      物理: 84,
      化学: 81,
      历史: 78,
      体育与健身: 85,
      信息科技: 74,
    },
    t2: {
      思想政治: 70,
      语文: 73,
      数学: 80,
      外语: 81,
      物理: 83,
      化学: 80,
      历史: 58,
      艺术: 68,
      体育与健身: 90,
      信息科技: 53,
    },
    total: {
      思想政治: 71,
      语文: 70,
      数学: 79,
      外语: 83,
      物理: 84,
      化学: 81,
      历史: 60,
      体育与健身: 88,
      信息科技: 61,
    },
  },
  g2: {
    t1: {
      思想政治: 61,
      语文: 64,
      数学: 70,
      外语: 84,
      物理: 17,
      生命科学: 74,
      历史: 71,
      地理: 69,
      艺术: 90,
    },
  },
};

const grades = ref([
  { name: "高一年级", data: scoresRaw.g1 },
  { name: "高二年级", data: scoresRaw.g2 },
  { name: "高三年级", data: {} },
]);

const getScore = (gradeIdx, termIdx, subject) => {
  const gradeKey = ["g1", "g2", "g3"][gradeIdx];
  const termKey = ["t1", "t2", "total"][termIdx];
  if (scoresRaw[gradeKey] && scoresRaw[gradeKey][termKey]) {
    return scoresRaw[gradeKey][termKey][subject] || "";
  }
  return "";
};

const comments = ref({
  g1: {
    t1: `你是一个积极向上，有信心的孩子。学习有计划，有目标，能够合理安排自己的时间，学习状态稳定。心态平和，关心帮助同学，关心班集体，积极参加班级、学校组织的各项活动，具有较强的劳动观念，积极参加体育活动，尊敬师长。希望你再接再厉，争取做得更好！`,
    t2: `该生性格踏实稳重，在班级同学中具有很强的号召力。对于学习，一直都能够做到心无旁骛，成绩又稳又好。道德品质高尚，具有很强的进取心，乐于助人，能够将老师布置的任务落实下去，培养了自己的各方面能力，在德智体美劳方面全面发展，堪称表率。\n综合等第：优秀`,
  },
});

const printPage = () => {
  // Create a style element
  const style = document.createElement('style');
  style.id = 'printing-style';

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

onMounted(() => {
  fetchData(props.studentId);
});

watch(
  () => props.studentId,
  (newId) => {
    if (newId) {
      fetchData(newId);
    }
  }
);

defineExpose({
  printPage,
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap"); /* 模拟手写字体 */

.action-bar {
  margin-bottom: 20px;
  text-align: center;
  color: black;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}

.tips {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

/* A4 纸张设定 */
.page {
  width: 210mm;
  height: 297mm;
  background-color: #ffdae0; /* 粉色底 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
  padding: 15mm 10mm;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  color: #000;
}

@media print {
  .page {
    overflow: visible !important;
    box-shadow: none !important;
    margin: 0 !important;
    height: auto;
    page-break-after: always;
  }
  .page:last-of-type {
    page-break-after: auto;
  }
}

/* 表格通用样式 */
table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #d45d79; /* 深红边框 */
  font-size: 10pt;
}

td,
th {
  border: 1px solid #d45d79;
  padding: 2px 4px;
  text-align: center;
  vertical-align: middle;
}

.label {
  color: #333;
  font-weight: normal;
}

.label-bg {
  /* 背景色由纸张决定，这里不额外设 */
}

/* ================== 第一页样式 ================== */

.header {
  text-align: center;
  margin-bottom: 5px;
}

.card-title {
  font-size: 18pt;
  margin: 0 0 5px 0;
  font-weight: bold;
}

.sub-header {
  display: flex;
  justify-content: flex-start;
  font-size: 10.5pt;
}

/* 基本信息表 */
.base-table td {
  height: 24px;
}

.photo-cell {
  padding: 0;
}
.photo-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #fff; /* 照片底色白 */
  font-size: 9pt;
  min-height: 120px;
}
.photo-box img {
  max-width: 100%;
  max-height: 100%;
}

/* 中间区域：家庭与日期 */
.middle-section {
  display: flex;
  border-left: 1px solid #d45d79;
  border-right: 1px solid #d45d79;
  border-bottom: 1px solid #d45d79;
}

.family-table {
  flex: 1;
  border: none;
}
.family-table td {
  border-top: none;
  border-bottom: none;
  border-right: 1px solid #d45d79;
}

.entry-date-box {
  width: 70px; /* 大约宽度 */
  display: flex;
  flex-direction: column;
}
.vertical-text-box {
  writing-mode: vertical-lr;
  margin: 0 auto;
  padding: 10px 0;
  letter-spacing: 2px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #d45d79;
}
.date-val {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Ma Shan Zheng", cursive; /* 手写体 */
  font-size: 14pt;
}

/* 学业成绩表 */
.grade-table {
  border-top: none;
}
.grade-table th {
  font-size: 9pt;
  height: 60px; /* 拉高表头容纳竖排文字 */
  white-space: pre-wrap;
}
/* 处理科目表头的竖排或换行 */
.grade-table th:nth-child(n + 2):nth-child(-n + 15) {
  width: 30px;
  padding: 0 2px;
}
/* 尝试模拟图片中科目名称的紧凑排列 */

.vertical-text {
  writing-mode: vertical-lr;
  letter-spacing: 4px;
}

.handwriting {
  font-family: "Ma Shan Zheng", cursive, "Kaiti SC", serif;
  font-size: 12pt;
}

/* 底部布局修正 */
.bottom-layout {
  border: 1px solid #d45d79;
  border-top: none;
  display: flex;
  height: 80px;
}

.left-bottom {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.left-bottom .row {
  flex: 1;
  display: flex;
  border-bottom: 1px solid #d45d79;
}
.left-bottom .row:last-child {
  border-bottom: none;
}
.left-bottom .label {
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #d45d79;
  background-color: rgba(255, 255, 255, 0.1);
}
.left-bottom .val {
  flex: 1;
  border-right: 1px solid #d45d79;
  display: flex;
  align-items: center;
  padding-left: 10px;
  font-family: "Ma Shan Zheng", cursive;
  font-size: 12pt;
}

.right-bottom {
  width: 96px; /* 对应上面转出日期的宽度 */
  display: flex;
  flex-direction: column;
}
.vertical-col {
  flex: 1;
  writing-mode: vertical-lr;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #d45d79;
  font-size: 9pt;
  padding: 2px;
}
.vertical-col:last-child {
  border-bottom: none;
}

.footer-sign {
  text-align: right;
  font-size: 9pt;
  margin-top: 5px;
}

/* ================== 第二页样式 ================== */

.comments-table {
  height: 90%;
}
.comments-table td {
  vertical-align: top;
  padding: 5px;
}

.h-33 {
  height: 28%;
}

.cell-content {
  position: relative;
  text-align: left;
}

.term-header {
  border-bottom: 1px solid #d45d79;
  margin: -5px -5px 5px -5px;
  padding: 5px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
}

.term-row,
.term-label {
  margin-bottom: 5px;
  font-weight: bold;
}

.comment-text {
  min-height: 120px;
  font-size: 11pt;
  line-height: 1.4;
  text-indent: 2em;
  white-space: pre-wrap;
}

.check-mark {
  font-size: 60pt;
  color: #333;
  text-align: center;
  line-height: 100px;
  opacity: 0.6;
}

.sign-box {
  position: absolute;
  bottom: 5px;
  left: 5px;
  right: 5px;
  border-top: 1px solid #d45d79;
  padding-top: 5px;
  display: flex;
  justify-content: space-between;
}

.remarks-box {
  margin-top: -1px; /* 合并边框 */
  border: 1px solid #d45d79;
  height: 50px;
  display: flex;
}
.label-vertical {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #d45d79;
  writing-mode: vertical-lr;
}
</style>