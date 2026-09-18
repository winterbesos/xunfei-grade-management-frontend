<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="(v) => emit('update:modelValue', v)"
    :title="`平时成绩导入 - ${semesterTitle}`"
    width="860px"
    :close-on-click-modal="false"
    :before-close="beforeClose"
    @open="onOpen"
  >
    <el-alert
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 16px"
      title="按年级导入：模板已预填学生现有平时分，填写的分数会覆盖原平时分并重算综合分/等级/学分；空白单元格不修改。"
    />

    <el-form label-width="80px" v-loading="optionsLoading">
      <el-form-item label="年级">
        <el-select
          v-model="gradeCode"
          placeholder="请选择该学期时的年级"
          style="width: 320px"
          @change="onGradeChange"
        >
          <el-option
            v-for="g in grades"
            :key="g.grade_code"
            :label="gradeLabel(g)"
            :value="g.grade_code"
            :disabled="g.student_count === 0"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="学科">
        <el-select
          v-model="subjectCodes"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="6"
          placeholder="请选择模板包含的学科"
          style="width: 100%"
          :disabled="!gradeCode"
        >
          <el-option
            v-for="s in gradeSubjects"
            :key="s.subject_code"
            :label="s.subject_name"
            :value="s.subject_code"
          />
        </el-select>
        <div class="form-tip">
          仅影响下载的模板包含哪些学科列；导入时以文件中的学科列为准
          <el-button link type="primary" size="small" @click="subjectCodes = gradeSubjects.map((s) => s.subject_code)">全选</el-button>
          <el-button link size="small" @click="subjectCodes = []">清空</el-button>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button
          @click="handleDownloadTemplate"
          :loading="downloading"
          :disabled="!gradeCode || subjectCodes.length === 0"
        >
          下载导入模板
        </el-button>
        <el-button type="primary" @click="triggerUpload" :loading="parsing" :disabled="!gradeCode || running">
          上传平时成绩
        </el-button>
        <input ref="fileInputRef" type="file" accept=".xlsx" style="display: none" @change="handleFileChange" />
      </el-form-item>
    </el-form>

    <div v-if="parsed">
      <el-divider content-position="left">{{ fileName }}</el-divider>
      <el-row :gutter="16" style="margin-bottom: 16px">
        <el-col :span="5"><el-statistic title="总行数" :value="parsed.total_rows" /></el-col>
        <el-col :span="5"><el-statistic title="成功行数" :value="counts.success" /></el-col>
        <el-col :span="5"><el-statistic title="跳过行数" :value="counts.skip" /></el-col>
        <el-col :span="5"><el-statistic title="失败行数" :value="counts.fail" /></el-col>
        <el-col :span="4"><el-statistic title="已更新成绩数" :value="updatedScores" /></el-col>
      </el-row>

      <div class="import-bar">
        <template v-if="phase === 'ready'">
          <span>
            校验完成：{{ parsed.valid_rows }} 行、{{ parsed.score_count }} 个平时分待导入
            <template v-if="parsed.fail_rows">，{{ parsed.fail_rows }} 行校验失败将不导入</template>
          </span>
          <el-button type="primary" :disabled="parsed.valid_rows === 0" @click="startImport">开始导入</el-button>
        </template>
        <template v-else>
          <el-progress
            :percentage="percent"
            :status="phase === 'done' ? (counts.fail ? 'warning' : 'success') : phase === 'paused' ? 'exception' : ''"
            style="flex: 1"
          />
          <span class="progress-text">{{ doneRows }} / {{ parsed.valid_rows }} 行</span>
          <el-button v-if="phase === 'running'" size="small" @click="stopRequested = true">暂停</el-button>
          <el-button v-if="phase === 'paused'" size="small" type="primary" @click="runBatches">继续导入</el-button>
        </template>
      </div>
      <el-alert v-if="phase === 'paused' && pauseReason" type="error" :closable="false" :title="pauseReason" style="margin-bottom: 8px" />

      <div style="margin-bottom: 8px">
        <el-checkbox v-model="showSkipped">显示跳过的行</el-checkbox>
      </div>
      <el-table :data="visibleDetails" stripe border max-height="320">
        <el-table-column prop="row" label="行号" width="70" align="center" />
        <el-table-column prop="student_name" label="学生姓名" width="110" />
        <el-table-column prop="class_name" label="班级" width="120" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updated_count" label="学科数" width="80" align="center" />
        <el-table-column prop="reason" label="失败原因" min-width="200" show-overflow-tooltip />
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { maintenanceAPI } from "@/api/maintenance";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  schoolId: { type: String, required: true },
  semester: { type: Object, default: null },
});
const emit = defineEmits(["update:modelValue"]);

const BATCH_SIZE = 50;

const optionsLoading = ref(false);
const grades = ref([]);
const subjects = ref([]);
const gradeCode = ref(null);
const subjectCodes = ref([]);
const downloading = ref(false);
const fileInputRef = ref(null);
const showSkipped = ref(false);

// 导入状态：解析结果 + 分批进度
const parsing = ref(false);
const parsed = ref(null); // parse 接口返回
const fileName = ref("");
const phase = ref("ready"); // ready | running | paused | done
const nextBatch = ref(0);
const doneRows = ref(0);
const updatedScores = ref(0);
const stopRequested = ref(false);
const pauseReason = ref("");
const running = computed(() => phase.value === "running");

const semesterTitle = computed(() =>
  props.semester ? `${props.semester.academic_year_name || ""}${props.semester.term_name || ""}` : "",
);
const selectedGrade = computed(() => grades.value.find((g) => g.grade_code === gradeCode.value));
const gradeSubjects = computed(() => {
  const phaseCode = selectedGrade.value?.phase_code;
  return subjects.value.filter(
    (s) => !phaseCode || s.phase_code_list.length === 0 || s.phase_code_list.includes(phaseCode),
  );
});
const batches = computed(() => {
  const items = parsed.value?.items || [];
  const result = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) result.push(items.slice(i, i + BATCH_SIZE));
  return result;
});
const percent = computed(() => {
  const total = parsed.value?.valid_rows || 0;
  return total ? Math.floor((doneRows.value / total) * 100) : 100;
});
const counts = computed(() => {
  const c = { success: 0, skip: 0, fail: 0 };
  for (const d of parsed.value?.details || []) if (d.status in c) c[d.status] += 1;
  return c;
});
const visibleDetails = computed(() =>
  (parsed.value?.details || []).filter((d) => showSkipped.value || d.status !== "skip"),
);

const gradeLabel = (g) => {
  const cohort = g.graduated_year ? `${g.graduated_year}届，` : "";
  const now = g.is_graduated ? "已毕业" : g.current_grade_name === g.grade_name ? "" : `现${g.current_grade_name}`;
  return `${g.grade_name}（${cohort}${now ? now + "，" : ""}${g.student_count}人）`;
};
const statusType = (s) => ({ success: "success", skip: "warning", fail: "danger", pending: "info" })[s] || "info";
const statusLabel = (s) => ({ success: "成功", skip: "跳过", fail: "失败", pending: "待导入" })[s] || s;

const resetImport = () => {
  parsed.value = null;
  fileName.value = "";
  phase.value = "ready";
  nextBatch.value = 0;
  doneRows.value = 0;
  updatedScores.value = 0;
  stopRequested.value = false;
  pauseReason.value = "";
};

const beforeClose = (done) => {
  if (running.value) {
    ElMessage.warning("正在导入，请先暂停后再关闭");
    return;
  }
  done();
};

const onOpen = async () => {
  gradeCode.value = null;
  subjectCodes.value = [];
  showSkipped.value = false;
  resetImport();
  if (!props.semester) return;
  optionsLoading.value = true;
  try {
    const res = await maintenanceAPI.getUsualScoreImportOptions(props.schoolId, props.semester.semester_id);
    grades.value = res.data?.grades || [];
    subjects.value = res.data?.subjects || [];
  } catch {
    grades.value = [];
    subjects.value = [];
  } finally {
    optionsLoading.value = false;
  }
};

const onGradeChange = () => {
  subjectCodes.value = gradeSubjects.value.map((s) => s.subject_code);
  resetImport();
};

const handleDownloadTemplate = async () => {
  downloading.value = true;
  try {
    const res = await maintenanceAPI.downloadUsualScoreTemplate(
      props.schoolId,
      props.semester.semester_id,
      gradeCode.value,
      subjectCodes.value,
    );
    const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const disposition = res.headers?.["content-disposition"] || "";
    const match = disposition.match(/filename\*?=(?:UTF-8'')?(.+)/i);
    a.download = match ? decodeURIComponent(match[1]) : "平时成绩导入模板.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    ElMessage.error("下载模板失败");
  } finally {
    downloading.value = false;
  }
};

const triggerUpload = () => fileInputRef.value?.click();

// 第一步：上传并校验（不写库）
const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (!file) return;
  if (!file.name.endsWith(".xlsx")) {
    ElMessage.error("请上传 .xlsx 格式文件");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error("文件大小超过 10MB");
    return;
  }
  resetImport();
  const formData = new FormData();
  formData.append("file", file);
  parsing.value = true;
  try {
    const res = await maintenanceAPI.parseUsualScoreFile(
      props.schoolId,
      props.semester.semester_id,
      gradeCode.value,
      formData,
    );
    parsed.value = res.data;
    fileName.value = file.name;
  } catch {
    /* 错误信息由请求拦截器提示 */
  } finally {
    parsing.value = false;
  }
};

// 第二步：确认后分批写入
const startImport = async () => {
  try {
    await ElMessageBox.confirm(
      `将用文件中的 ${parsed.value.score_count} 个平时分覆盖「${semesterTitle.value} ${selectedGrade.value?.grade_name || ""}」学生的现有平时分，并重算综合成绩，是否继续？`,
      "确认导入",
      { type: "warning", confirmButtonText: "导入", cancelButtonText: "取消" },
    );
  } catch {
    return;
  }
  runBatches();
};

const runBatches = async () => {
  phase.value = "running";
  stopRequested.value = false;
  pauseReason.value = "";
  const detailByRow = new Map(parsed.value.details.map((d) => [d.row, d]));
  while (nextBatch.value < batches.value.length) {
    if (stopRequested.value) {
      phase.value = "paused";
      return;
    }
    const batch = batches.value[nextBatch.value];
    try {
      const res = await maintenanceAPI.importUsualScoreBatch(props.schoolId, props.semester.semester_id, {
        grade_code: gradeCode.value,
        items: batch,
      });
      const failed = new Map((res.data.failed || []).map((f) => [f.row, f.reason]));
      for (const item of batch) {
        const d = detailByRow.get(item.row);
        if (!d) continue;
        if (failed.has(item.row)) {
          d.status = "fail";
          d.reason = failed.get(item.row);
        } else {
          d.status = "success";
        }
      }
      updatedScores.value += res.data.updated_scores || 0;
      doneRows.value += batch.length;
      nextBatch.value += 1;
    } catch (err) {
      // 本批未写入（整批一个事务），暂停后可从本批继续
      phase.value = "paused";
      pauseReason.value = `第 ${nextBatch.value + 1} 批导入失败：${err?.response?.data?.detail || err?.message || "网络错误"}，可点击“继续导入”重试`;
      return;
    }
  }
  phase.value = "done";
  ElMessage.success(
    `导入完成：成功 ${counts.value.success} 行，跳过 ${counts.value.skip} 行，失败 ${counts.value.fail} 行`,
  );
};
</script>

<style scoped>
.import-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  min-height: 32px;
}
.import-bar > span:first-child {
  flex: 1;
}
.progress-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.form-tip {
  width: 100%;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin-top: 4px;
}
</style>
