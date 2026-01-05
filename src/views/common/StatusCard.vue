<template>
  <div class="status-card-root">
    <div class="action-bar no-print">
      <button @click="handlePrint" class="action-btn print-btn">
        <span>🖨️</span> 打印学籍卡
      </button>
    </div>
    <!-- Add ref to target this specific element -->
    <div class="print-area" ref="printAreaRef">
      <!-- ================= 第一页：基本信息与成绩 ================= -->
      <div class="page page-front">
        <!-- 顶部标题 -->
        <div class="header">
          <h1 class="card-title">
            上海市高中学生学籍卡（&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            届）
          </h1>
          <div class="sub-header">
            <span>区：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <span style="margin-left: 20px">学校：{{ info.school }}</span>
          </div>
        </div>

        <!-- 基本信息表 -->
        <table class="base-table">
          <colgroup>
            <col style="width: 30px" />
            <col style="width: 40px" />
            <col style="width: 40px" />
            <col style="width: 40px" />
            <col style="width: 60px" />
            <col style="width: 50px" />
            <col style="width: 70px" />
            <col style="width: 50px" />
            <col style="width: 35px" />
            <col style="width: 35px" />
            <col style="width: 90px" />

            <col style="width: 30px" />
            <col style="width: 45px" />

            <col style="width: 70px" />
            <!-- 照片列 -->
          </colgroup>
          <tbody>
            <tr>
              <td colspan="2" class="label">姓名</td>
              <td colspan="2">{{ info.name }}</td>
              <td class="label">性别</td>
              <td>{{ info.gender }}</td>
              <td class="label">民族</td>
              <td>{{ info.nation }}</td>
              <td colspan="2" class="label">籍贯</td>
              <td>{{ info.nativePlace }}</td>
              <td colspan="2" rowspan="4" class="photo-cell">
                <div class="photo-box">
                  <img v-if="info.photo" :src="info.photo" alt="照片" />
                  <span v-else>照片</span>
                </div>
              </td>
              <td rowspan="4" class="photo-cell">
                <div class="photo-box">
                  <span>照片<br />(离校时贴)</span>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="2" class="label">证件类型</td>
              <td colspan="2"></td>
              <td class="label">证件号码</td>
              <td colspan="3">{{ info.idCard }}</td>
              <td colspan="2" class="label">出生日期</td>
              <td>{{ info.birthday }}</td>
            </tr>
            <tr>
              <td colspan="3" class="label">全国学籍号</td>
              <td colspan="3">{{ info.nationalCode }}</td>
              <td colspan="2" class="label">上海市学籍号</td>
              <td colspan="3">{{ info.shanghaiCode }}</td>
            </tr>
            <tr>
              <td colspan="3" class="label">原毕业学校</td>
              <td colspan="3">{{ info.middleSchool }}</td>
              <td colspan="1" class="label">健康状况</td>
              <td>{{ info.health }}</td>
              <td colspan="2" class="s-label">入团(党)<br />时间</td>
            </tr>
            <tr>
              <td colspan="3" class="label">户籍地址</td>
              <td colspan="4">{{ info.hukouAddress }}</td>
              <td colspan="2" class="label">街道居委</td>
              <td colspan="2">{{ info.hukouStreet }}</td>
              <td rowspan="1" colspan="3" class="label">学籍变更情况</td>
            </tr>
            <tr>
              <td colspan="3" class="label">现住地址</td>
              <td colspan="4">{{ info.currentAddress }}</td>
              <td colspan="2" class="label">街道居委</td>
              <td colspan="2">{{ info.currentStreet }}</td>
              <td rowspan="5">入本校日期</td>
              <td rowspan="5" colspan="2" class="label"></td>
            </tr>

            <tr>
              <td rowspan="4">家庭主要成员</td>
              <td class="label">称谓</td>
              <td colspan="2" class="label">姓名</td>
              <td class="label">政治面貌</td>
              <td colspan="5" class="label">工作单位</td>
              <td class="label">联系电话</td>
            </tr>

            <tr>
              <td></td>
              <td colspan="2"></td>
              <td colspan="1"></td>
              <td colspan="5"></td>
              <td></td>
            </tr>

            <tr>
              <td></td>
              <td colspan="2"></td>
              <td colspan="1"></td>
              <td colspan="5"></td>
              <td></td>
            </tr>

            <tr>
              <td></td>
              <td colspan="2"></td>
              <td colspan="1"></td>
              <td colspan="5"></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <!-- 学业成绩表 -->
        <table class="grade-table">
          <colgroup>
            <!-- 685px -->
            <col style="width: 25px" />
            <col style="width: 25px" />
            <col style="width: 25px" />

            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />
            <col style="width: 29px" />

            <col style="width: 30px" />
            <col style="width: 45px" />

            <col style="width: 70px" />
          </colgroup>

          <tbody>
            <tr>
              <td colspan="3">学业成绩</td>
              <td v-for="(, index) in 16" :key="index">
                <div style="height: 100px" class="vertical-text">
                  {{ subjects[index]?.subject_name || "" }}
                </div>
              </td>
              <td rowspan="4">转入本校日期及原因</td>
              <td rowspan="4" colspan="2"></td>
            </tr>
            <tr>
              <td rowspan="4" class="vertical-text label-bg">高一年级</td>
              <td colspan="2" class="label">上学期</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[0]?.term_1_score || "" }}
              </td>
            </tr>
            <tr>
              <td colspan="2" class="label">下学期</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[0]?.term_2_score || "" }}
              </td>
            </tr>
            <tr>
              <td colspan="2" class="label">总评</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[0]?.score || "" }}
              </td>
            </tr>
            <tr>
              <td colspan="2" class="label">补考</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[0]?.makeup_score || "" }}
              </td>
              <td rowspan="7">转出本校日期及原因</td>
              <td rowspan="7" colspan="2"></td>
            </tr>

            <tr>
              <td rowspan="4" class="vertical-text label-bg">高二年级</td>
              <td colspan="2" class="label">上学期</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[1]?.term_1_score || "" }}
              </td>
            </tr>
            <tr>
              <td colspan="2" class="label">下学期</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[1]?.term_2_score || "" }}
              </td>
            </tr>
            <tr>
              <td colspan="2" class="label">总评</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[1]?.score || "" }}
              </td>
            </tr>
            <tr>
              <td colspan="2" class="label">补考</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[1]?.makeup_score || "" }}
              </td>
            </tr>

            <tr>
              <td rowspan="4" class="vertical-text label-bg">高三年级</td>
              <td colspan="2" class="label">上学期</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[2]?.term_1_score || "" }}
              </td>
            </tr>
            <tr>
              <td colspan="2" class="label">下学期</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[2]?.term_2_score || "" }}
              </td>
            </tr>
            <tr>
              <td colspan="2" class="label">总评</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[2]?.score || "" }}
              </td>

              <td colspan="2" rowspan="3">毕业日期及证书编号</td>
              <td rowspan="3"></td>
            </tr>
            <tr>
              <td colspan="2" class="label">补考</td>
              <td v-for="(, index) in 16" :key="index">
                {{ subjects[index]?.year_grades?.[2]?.makeup_score || "" }}
              </td>
            </tr>

            <!-- 学业水平考试 -->
            <tr>
              <td rowspan="2" class="zysp">学业水平考试</td>
              <td colspan="2" class="label">成绩</td>
              <td v-for="(sub, sIndex) in 16" :key="sIndex"></td>
            </tr>
            <tr>
              <td colspan="2" class="label">补考</td>
              <td v-for="(sub, sIndex) in 16" :key="sIndex"></td>

              <td colspan="2" rowspan="1">毕业后去向</td>
              <td rowspan="1"></td>
            </tr>
          </tbody>
        </table>

        <table class="base-table">
          <colgroup>
            <!-- 685px -->
            <col style="width: 120px" />
            <col style="width: 200px" />
            <col style="width: 110px" />
            <col style="width: 110px" />

            <col style="width: 25px" />
            <col style="width: 120px" />
          </colgroup>
          <tbody>
            <tr>
              <td class="label">休学日期及原因</td>
              <td></td>
              <td class="label">复学日期</td>
              <td></td>

              <td rowspan="2" class="qtxjbgqk">其他学籍变更情况</td>
              <td></td>
            </tr>
            <tr>
              <td class="label">退学日期及原因</td>
              <td></td>
              <td class="label">退学后去向</td>
              <td></td>

              <td></td>
            </tr>
          </tbody>
        </table>

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

          <tbody>
            <!-- 高一 -->
            <tr class="h-33">
              <td class="vertical-text label-bg">高一年级</td>
              <td class="cell-content">
                <div class="term-header">第一学期品德测评成绩</div>
                <div class="term-row">
                  品德总评等第：
                  <span>
                    {{ character_comments[0]?.term_1_level || "" }}
                  </span>
                </div>
                <div class="term-label">评语：</div>
                <div class="comment-text">
                  {{ character_comments[0]?.term_1_comment }}
                </div>
                <div class="sign-box">
                  班主任（签名）
                  <span class="date"
                    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</span
                  >
                </div>
              </td>
              <td class="cell-content">
                <div class="term-header">第二学期品德测评成绩</div>
                <div class="term-row">
                  品德总评等第：
                  <span>
                    {{ character_comments[0]?.term_2_level }}
                  </span>
                </div>
                <div class="term-label">评语：</div>
                <div class="comment-text">
                  {{ character_comments[0]?.term_2_comment }}
                </div>
                <div class="sign-box">
                  班主任（签名）
                  <span class="date"
                    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</span
                  >
                </div>
              </td>
            </tr>

            <!-- 高二 -->
            <tr class="h-33">
              <td class="vertical-text label-bg">高二年级</td>
              <td class="cell-content">
                <div class="term-header">第一学期品德测评成绩</div>
                <div class="term-row">
                  品德总评等第：
                  <span>
                    {{ character_comments[1]?.term_1_level }}
                  </span>
                </div>
                <div class="term-label">评语：</div>
                <div class="comment-text">
                  {{ character_comments[1]?.term_1_comment }}
                </div>
                <div class="sign-box">
                  班主任（签名）
                  <span class="date"
                    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</span
                  >
                </div>
              </td>
              <td class="cell-content">
                <div class="term-header">第二学期品德测评成绩</div>
                <div class="term-row">
                  品德总评等第：
                  <span>
                    {{ character_comments[1]?.term_2_level }}
                  </span>
                </div>
                <div class="term-label">评语：</div>
                <div class="comment-text">
                  {{ character_comments[1]?.term_2_comment }}
                </div>
                <div class="sign-box">
                  班主任（签名）
                  <span class="date"
                    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</span
                  >
                </div>
              </td>
            </tr>

            <!-- 高三 -->
            <tr class="h-33">
              <td class="vertical-text label-bg">高三年级</td>
              <td class="cell-content">
                <div class="term-header">第一学期品德测评成绩</div>
                <div class="term-row">
                  品德总评等第：
                  <span>
                    {{ character_comments[2]?.term_1_level }}
                  </span>
                </div>
                <div class="term-label">评语：</div>
                <div class="comment-text">
                  {{ character_comments[2]?.term_1_comment }}
                </div>
                <div class="sign-box">
                  班主任（签名）
                  <span class="date"
                    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</span
                  >
                </div>
              </td>
              <td class="cell-content">
                <div class="term-header">第二学期品德测评成绩</div>
                <div class="term-row">
                  品德总评等第：
                  <span>
                    {{ character_comments[2]?.term_2_level }}
                  </span>
                </div>
                <div class="term-label">评语：</div>
                <div class="comment-text">
                  {{ character_comments[2]?.term_2_comment }}
                </div>
                <div class="sign-box">
                  班主任（签名）
                  <span class="date"
                    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</span
                  >
                </div>
              </td>
            </tr>
          </tbody>
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
import { adminAPI } from "@/api/admin";
import { printStatusCardElement } from "@/utils/print.js";

// --- 组件Props ---
const props = defineProps({
  studentId: {
    type: [String, Number],
    required: true,
  },
});

const printAreaRef = ref(null);

const fillData = (data) => {
  info.value.name = data.student_name;
  info.value.gender = data.gender;
  info.value.school = data.school_name;
  info.value.idCard = data.id_number;
  info.value.shanghaiCode = data.student_status_number;
  subjects.value = data.subject_grades;
  character_comments.value = data.character_comments;
};

const fetchData = async (id) => {
  if (!id) return;
  try {
    const res = await adminAPI.getStudentStatusCard(id);
    fillData(res.data);
  } catch (error) {
    console.error("Failed to fetch status card:", error);
  }
};

// --- 数据定义 ---
const info = ref({
  district: "",
  school: "",
  name: "",
  gender: "",
  nation: "",
  nativePlace: "",
  idCard: "",
  birthday: "",
  nationalCode: "",
  shanghaiCode: "",
  middleSchool: "",
  health: "",
  hukouAddress: "",
  hukouStreet: "",
  currentAddress: "",
  currentStreet: "",
  photo: "",
});

const subjects = ref([]);
const character_comments = ref([]);

const handlePrint = () => {
  if (printAreaRef.value) {
    printStatusCardElement(printAreaRef.value);
  }
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
  },
);

defineExpose({
  handlePrint, // Expose handlePrint instead
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap");

.action-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  justify-content: center;
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

.tips {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

/* A4 纸张设定 */
.page {
  width: 210mm;
  height: 297mm;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  margin-bottom: 20px;
  padding: 15mm 10mm;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  color: #000;
}

.print-area {
  display: block !important; /* 确保不是 flex 布局 */
  height: auto !important;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }

  body,
  html {
    height: auto !important;
    overflow: visible !important;
  }

  .page {
    margin: 0 !important;
    box-shadow: none !important;
    width: 210mm !important;
    height: 297mm !important;

    /* 核心分页属性 */
    display: block !important;
    float: none !important;
    position: relative !important;

    /* 强行分页 */
    page-break-after: always !important;
    break-after: page !important;

    /* 避免在页面内部折断 */
    page-break-inside: avoid !important;
  }

  .page:last-of-type {
    page-break-after: auto !important;
    break-after: auto !important;
  }
}

/* 表格通用样式 */
table {
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #333; /* 深红边框 */
  font-size: 10pt;
}

td,
th {
  border: 1px solid #333;
  padding: 2px 4px;
  text-align: center;
  vertical-align: middle;
}

.label {
  color: #333;
  font-weight: normal;
}

.s-label {
  font-size: 7pt;
  line-height: 1.2;
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
  border-right: 1px solid #333;
}

.family-table {
  flex: 1;
  border: none;
}
.family-table td {
  border-top: none;
  border-bottom: none;
  border-right: 1px solid #333;
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
  border-bottom: 1px solid #333;
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
  border: 1px solid #333;
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
  border-bottom: 1px solid #333;
}
.left-bottom .row:last-child {
  border-bottom: none;
}
.left-bottom .label {
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #333;
  background-color: rgba(255, 255, 255, 0.1);
}
.left-bottom .val {
  flex: 1;
  border-right: 1px solid #333;
  display: flex;
  align-items: center;
  padding-left: 10px;
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
  border-bottom: 1px solid #333;
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
  border-bottom: 1px solid #333;
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
  border-top: 1px solid #333;
  padding-top: 5px;
  display: flex;
  justify-content: space-between;
}

.remarks-box {
  margin-top: -1px; /* 合并边框 */
  border: 1px solid #333;
  height: 50px;
  display: flex;
}
.label-vertical {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #333;
  writing-mode: vertical-lr;
}

.zysp {
  font-size: 6pt;
}
.qtxjbgqk {
  font-size: 7pt;
}
</style>
