<template>
  <div class="historical-exam-detail">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ name: 'maintenanceHistoricalImport' }">历史成绩导入</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ name: 'maintenanceHistoricalExams', params: { semesterId } }">
        {{ semesterId }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ exam?.exam_name || examId }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card style="margin-top: 16px">
      <template #header>
        <div class="card-header">
          <span>{{ exam?.exam_name }} — 成绩导入</span>
          <div>
            <el-button @click="handleDownloadTemplate" :loading="downloading">
              下载成绩模板
            </el-button>
            <el-button type="primary" @click="triggerUpload" :loading="importing">
              上传成绩文件
            </el-button>
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx"
              style="display: none"
              @change="handleFileChange"
            />
          </div>
        </div>
      </template>

      <!-- 本次导入结果 -->
      <div v-if="lastResult" style="margin-bottom: 24px">
        <el-divider content-position="left">本次导入结果</el-divider>
        <el-row :gutter="16" style="margin-bottom: 16px">
          <el-col :span="6">
            <el-statistic title="总行数" :value="lastResult.total_rows" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="成功行数" :value="lastResult.success_rows">
              <template #suffix>
                <el-tag type="success" size="small">成功</el-tag>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="跳过行数" :value="lastResult.skip_rows">
              <template #suffix>
                <el-tag type="warning" size="small">跳过</el-tag>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="6">
            <el-statistic title="失败行数" :value="lastResult.fail_rows">
              <template #suffix>
                <el-tag type="danger" size="small">失败</el-tag>
              </template>
            </el-statistic>
          </el-col>
        </el-row>

        <el-table :data="lastResult.details" stripe border style="width: 100%" max-height="400">
          <el-table-column prop="row" label="行号" width="70" align="center" />
          <el-table-column prop="student_name" label="学生姓名" width="100" />
          <el-table-column prop="class_name" label="班级" width="120" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="success_subjects" label="成功科目数" width="100" align="center" />
          <el-table-column prop="reason" label="失败原因" min-width="200" show-overflow-tooltip />
        </el-table>

        <div style="margin-top: 12px; text-align: right">
          <el-button size="small" @click="exportReport(lastResult.log_id)">导出本次报告</el-button>
        </div>
      </div>

      <!-- 历次导入记录 -->
      <el-divider content-position="left">历次导入记录</el-divider>
      <el-table v-loading="logsLoading" :data="importLogs" stripe style="width: 100%">
        <el-table-column prop="file_name" label="文件名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="total_rows" label="总行数" width="80" align="center" />
        <el-table-column prop="success_rows" label="成功" width="70" align="center" />
        <el-table-column prop="skip_rows" label="跳过" width="70" align="center" />
        <el-table-column prop="fail_rows" label="失败" width="70" align="center" />
        <el-table-column label="导入时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewLogDetail(row)">查看详情</el-button>
            <el-button link @click="exportReport(row.log_id)">导出报告</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 查看历史详情 Dialog -->
    <el-dialog v-model="logDetailVisible" title="导入详情" width="800px">
      <el-table v-loading="logDetailLoading" :data="logDetail" stripe border max-height="500">
        <el-table-column prop="row" label="行号" width="70" align="center" />
        <el-table-column prop="student_name" label="学生姓名" width="100" />
        <el-table-column prop="class_name" label="班级" width="120" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="success_subjects" label="成功科目数" width="100" align="center" />
        <el-table-column prop="reason" label="失败原因" min-width="200" show-overflow-tooltip />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { maintenanceAPI } from "@/api/maintenance";
import dayjs from "dayjs";

const route = useRoute();
const semesterId = route.params.semesterId;
const examId = route.params.examId;

const exam = ref(null);
const importing = ref(false);
const downloading = ref(false);
const logsLoading = ref(false);
const importLogs = ref([]);
const lastResult = ref(null);
const fileInputRef = ref(null);
const logDetailVisible = ref(false);
const logDetailLoading = ref(false);
const logDetail = ref([]);

const statusType = (s) => ({ success: "success", skip: "warning", fail: "danger" }[s] || "info");
const statusLabel = (s) => ({ success: "成功", skip: "跳过", fail: "失败" }[s] || s);
const formatDateTime = (dt) => (dt ? dayjs(dt).format("YYYY-MM-DD HH:mm:ss") : "-");

const fetchExamInfo = async () => {
  try {
    const res = await maintenanceAPI.getHistoricalExams(semesterId);
    exam.value = (res.data || []).find(e => e.exam_id === examId) || null;
  } catch {
    // 忽略
  }
};

const fetchLogs = async () => {
  logsLoading.value = true;
  try {
    const res = await maintenanceAPI.getHistoricalImportLogs(examId);
    importLogs.value = res.data || [];
  } catch {
    ElMessage.error("获取导入记录失败");
  } finally {
    logsLoading.value = false;
  }
};

const handleDownloadTemplate = async () => {
  downloading.value = true;
  try {
    const res = await maintenanceAPI.downloadHistoricalTemplate(examId);
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const disposition = res.headers?.["content-disposition"] || "";
    const match = disposition.match(/filename\*?=(?:UTF-8'')?(.+)/i);
    a.download = match ? decodeURIComponent(match[1]) : "成绩导入模板.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    ElMessage.error("下载模板失败");
  } finally {
    downloading.value = false;
  }
};

const triggerUpload = () => {
  fileInputRef.value?.click();
};

const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.name.endsWith(".xlsx")) {
    ElMessage.error("请上传 .xlsx 格式文件");
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error("文件大小超过 10MB 限制");
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  importing.value = true;
  try {
    const res = await maintenanceAPI.importHistoricalGrades(examId, formData);
    lastResult.value = res.data;
    ElMessage.success(
      `导入完成：成功 ${res.data.success_rows} 行，跳过 ${res.data.skip_rows} 行，失败 ${res.data.fail_rows} 行`
    );
    fetchLogs();
  } catch {
    // 错误已由 request 拦截器处理
  } finally {
    importing.value = false;
    e.target.value = "";
  }
};

const viewLogDetail = async (log) => {
  logDetailVisible.value = true;
  logDetailLoading.value = true;
  try {
    const res = await maintenanceAPI.getHistoricalImportLogDetail(log.log_id);
    logDetail.value = res.data?.details || [];
  } catch {
    ElMessage.error("获取详情失败");
  } finally {
    logDetailLoading.value = false;
  }
};

const exportReport = async (logId) => {
  try {
    const res = await maintenanceAPI.exportHistoricalImportReport(logId);
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `导入结果报告.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    ElMessage.error("导出报告失败");
  }
};

onMounted(() => {
  fetchExamInfo();
  fetchLogs();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-breadcrumb {
  margin-bottom: 4px;
}
</style>
