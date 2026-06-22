<template>
  <div class="character-comment-import-tab">
    <!-- 学期 + 班级选择 -->
    <el-form :inline="true" style="margin-bottom: 12px">
      <el-form-item label="学期">
        <el-select
          v-model="selectedSemesterId"
          placeholder="请选择学期"
          style="width: 280px"
          filterable
          @change="onSelectionChange"
        >
          <el-option
            v-for="s in semesters"
            :key="s.semester_id"
            :label="s.semester_name"
            :value="s.semester_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="班级">
        <el-select
          v-model="selectedClassId"
          placeholder="请选择班级"
          style="width: 220px"
          filterable
          @change="onSelectionChange"
        >
          <el-option
            v-for="c in classes"
            :key="c.class_id"
            :label="`${c.year_name || c.year_code} ${c.class_name}`"
            :value="c.class_id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <el-empty v-if="!selectedSemesterId || !selectedClassId" description="请选择学期与班级后进行品格评语导入" />

    <div v-else>
      <div style="margin-bottom: 16px; display: flex; justify-content: flex-end; gap: 8px">
        <el-button @click="handleDownloadTemplate" :loading="downloading">下载导入模板</el-button>
        <el-button type="primary" @click="triggerUpload" :loading="importing">上传评语文件</el-button>
        <input ref="fileInputRef" type="file" accept=".xlsx" style="display:none" @change="handleFileChange" />
      </div>

      <!-- 本次导入结果 -->
      <div v-if="lastResult">
        <el-divider content-position="left">本次导入结果</el-divider>
        <el-row :gutter="16" style="margin-bottom: 16px">
          <el-col :span="6"><el-statistic title="总行数" :value="lastResult.total_rows" /></el-col>
          <el-col :span="6"><el-statistic title="成功行数" :value="lastResult.success_rows" /></el-col>
          <el-col :span="6"><el-statistic title="跳过行数" :value="lastResult.skip_rows" /></el-col>
          <el-col :span="6"><el-statistic title="失败行数" :value="lastResult.fail_rows" /></el-col>
        </el-row>
        <el-table :data="lastResult.details" stripe border max-height="360">
          <el-table-column prop="row" label="行号" width="70" align="center" />
          <el-table-column prop="student_name" label="学生姓名" width="110" />
          <el-table-column prop="grade" label="等第" width="70" align="center" />
          <el-table-column prop="comment" label="品格评语" min-width="220" show-overflow-tooltip />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="失败原因" min-width="160" show-overflow-tooltip />
        </el-table>
        <div style="margin-top: 8px; text-align: right">
          <el-button size="small" @click="exportReport(lastResult.log_id)">导出本次报告</el-button>
        </div>
      </div>

      <!-- 历次导入记录 -->
      <el-divider content-position="left">历次导入记录</el-divider>
      <el-table v-loading="logsLoading" :data="importLogs" stripe style="width: 100%">
        <el-table-column prop="file_name" label="文件名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="total_rows" label="总行数" width="80" align="center" />
        <el-table-column prop="success_rows" label="成功" width="70" align="center" />
        <el-table-column prop="skip_rows" label="跳过" width="70" align="center" />
        <el-table-column prop="fail_rows" label="失败" width="70" align="center" />
        <el-table-column label="导入时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewLogDetail(row)">查看详情</el-button>
            <el-button link @click="exportReport(row.log_id)">导出</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 导入详情 Dialog -->
    <el-dialog v-model="logDetailVisible" title="导入详情" width="800px">
      <el-table v-loading="logDetailLoading" :data="logDetail" stripe border max-height="500">
        <el-table-column prop="row" label="行号" width="70" align="center" />
        <el-table-column prop="student_name" label="学生姓名" width="110" />
        <el-table-column prop="grade" label="等第" width="70" align="center" />
        <el-table-column prop="comment" label="品格评语" min-width="220" show-overflow-tooltip />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="失败原因" min-width="160" show-overflow-tooltip />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { maintenanceAPI } from "@/api/maintenance";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const props = defineProps({ schoolId: { type: String, required: true } });

const semesters = ref([]);
const classes = ref([]);
const selectedSemesterId = ref(null);
const selectedClassId = ref(null);

const fileInputRef = ref(null);
const importing = ref(false);
const downloading = ref(false);
const lastResult = ref(null);
const logsLoading = ref(false);
const importLogs = ref([]);
const logDetailVisible = ref(false);
const logDetailLoading = ref(false);
const logDetail = ref([]);

const formatDateTime = (dt) => (dt ? dayjs.utc(dt).local().format("YYYY-MM-DD HH:mm") : "-");
const statusType = (s) => ({ success: "success", skip: "warning", fail: "danger" }[s] || "info");
const statusLabel = (s) => ({ success: "成功", skip: "跳过", fail: "失败" }[s] || s);

const fetchSemestersAndClasses = async () => {
  try {
    const [semRes, clsRes] = await Promise.all([
      maintenanceAPI.getSchoolSemesters(props.schoolId),
      maintenanceAPI.getSchoolClasses(props.schoolId),
    ]);
    semesters.value = semRes.data || [];
    classes.value = clsRes.data || [];
  } catch {
    ElMessage.error("获取学期或班级列表失败");
  }
};

const onSelectionChange = () => {
  lastResult.value = null;
  importLogs.value = [];
  if (selectedSemesterId.value && selectedClassId.value) {
    fetchLogs();
  }
};

const fetchLogs = async () => {
  logsLoading.value = true;
  try {
    const res = await maintenanceAPI.getCharacterCommentImportLogs(selectedSemesterId.value, selectedClassId.value);
    importLogs.value = res.data || [];
  } catch {
    /* ignore */
  } finally {
    logsLoading.value = false;
  }
};

const handleDownloadTemplate = async () => {
  downloading.value = true;
  try {
    const res = await maintenanceAPI.downloadCharacterCommentTemplate(selectedSemesterId.value, selectedClassId.value);
    const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const disposition = res.headers?.["content-disposition"] || "";
    const match = disposition.match(/filename\*?=(?:UTF-8'')?(.+)/i);
    a.download = match ? decodeURIComponent(match[1]) : "品格评语导入模板.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    ElMessage.error("下载模板失败");
  } finally {
    downloading.value = false;
  }
};

const triggerUpload = () => fileInputRef.value?.click();

const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.name.endsWith(".xlsx")) {
    ElMessage.error("请上传 .xlsx 格式文件");
    e.target.value = "";
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error("文件大小超过 10MB");
    e.target.value = "";
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  importing.value = true;
  try {
    const res = await maintenanceAPI.importCharacterComments(selectedSemesterId.value, selectedClassId.value, formData);
    lastResult.value = res.data;
    ElMessage.success(`导入完成：成功 ${res.data.success_rows} 行，跳过 ${res.data.skip_rows} 行，失败 ${res.data.fail_rows} 行`);
    fetchLogs();
  } catch {
    /* ignore */
  } finally {
    importing.value = false;
    e.target.value = "";
  }
};

const viewLogDetail = async (log) => {
  logDetailVisible.value = true;
  logDetailLoading.value = true;
  try {
    const res = await maintenanceAPI.getCharacterCommentImportLogDetail(log.log_id);
    logDetail.value = res.data?.details || [];
  } catch {
    ElMessage.error("获取详情失败");
  } finally {
    logDetailLoading.value = false;
  }
};

const exportReport = async (logId) => {
  try {
    const res = await maintenanceAPI.exportCharacterCommentImportReport(logId);
    const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "品格评语导入结果报告.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    ElMessage.error("导出失败");
  }
};

onMounted(() => {
  fetchSemestersAndClasses();
});
</script>
