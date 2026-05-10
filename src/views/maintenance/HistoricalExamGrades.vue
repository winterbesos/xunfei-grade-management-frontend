<template>
  <div class="historical-exam-grades">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ name: 'maintenanceHistoricalImport' }">历史成绩导入</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ name: 'maintenanceHistoricalExams', params: { semesterId } }">
        {{ meta?.teaching_cycle_name || semesterId }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ headerTitle }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card style="margin-top: 16px" v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button :icon="ArrowLeft" circle @click="goBack" />
            <span class="header-title">{{ headerTitle }} - 成绩列表</span>
          </div>
        </div>
      </template>

      <el-descriptions v-if="meta" :column="3" border class="mb-4">
        <el-descriptions-item label="学期">{{ meta.teaching_cycle_name || meta.teaching_cycle_id }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ meta.grade_name || meta.grade_code || "-" }}</el-descriptions-item>
        <el-descriptions-item label="科目">{{ meta.subject_name || meta.subject_code }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ meta.remark || "-" }}</el-descriptions-item>
        <el-descriptions-item label="共">{{ meta.total }} 条</el-descriptions-item>
      </el-descriptions>

      <div class="toolbar mb-4">
        <el-input
          v-model="searchQuery"
          placeholder="搜索学生姓名/学号"
          style="width: 250px"
          clearable
          @input="onFilterChange"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-button
          type="danger"
          :disabled="meta?.total === 0"
          :loading="clearing"
          @click="handleClear"
        >
          {{ meta?.total === 0 ? "无可清空成绩" : `清空（共 ${meta?.total || 0} 条）` }}
        </el-button>
      </div>

      <el-table
        :data="items"
        v-loading="loading"
        style="width: 100%"
        stripe
        border
      >
        <el-table-column prop="student_name" label="姓名" min-width="120" sortable />
        <el-table-column prop="student_id" label="学号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="class_name" label="班级" width="120" />
        <el-table-column prop="usual_score" label="平时分" width="90" sortable />
        <el-table-column prop="midterm_score" label="期中" width="90" sortable />
        <el-table-column prop="final_score" label="期末" width="90" sortable />
        <el-table-column prop="score" label="综合" width="90" sortable />
        <el-table-column prop="grade_level" label="等级" width="80" />
        <el-table-column label="导入时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.imported_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-popconfirm
              title="确认删除该学生的历史成绩？该行将被物理删除，删除后无法恢复。"
              confirm-button-text="删除"
              confirm-button-type="danger"
              cancel-button-text="取消"
              :width="280"
              @confirm="handleSingleDelete(row)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  link
                  :disabled="singleDeletingPk === row.grade_pk"
                  :loading="singleDeletingPk === row.grade_pk"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft, Search } from "@element-plus/icons-vue";
import { maintenanceAPI } from "@/api/maintenance";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();
const semesterId = route.params.semesterId;
const examId = route.params.examId;

const loading = ref(false);
const clearing = ref(false);
const singleDeletingPk = ref(null);
const meta = ref(null);
const items = ref([]);
const searchQuery = ref("");

let searchTimer = null;

const headerTitle = computed(() => {
  if (!meta.value) return "成绩列表";
  const parts = [
    meta.value.grade_name || meta.value.grade_code,
    meta.value.subject_name || meta.value.subject_code,
  ].filter(Boolean);
  return parts.join(" · ") || "成绩列表";
});

const formatDateTime = (dt) => (dt ? dayjs(dt).format("YYYY-MM-DD HH:mm") : "-");

const fetchEntries = async () => {
  loading.value = true;
  try {
    const params = {};
    if (searchQuery.value) params.student_keyword = searchQuery.value;
    const res = await maintenanceAPI.getHistoricalGradeEntries(examId, params);
    const data = res.data || {};
    meta.value = data.meta || null;
    items.value = data.items || [];
  } catch (e) {
    // 错误提示由 axios 拦截器统一处理
  } finally {
    loading.value = false;
  }
};

const onFilterChange = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchEntries(), 300);
};

const goBack = () => router.back();

const handleSingleDelete = async (row) => {
  singleDeletingPk.value = row.grade_pk;
  try {
    await maintenanceAPI.deleteHistoricalGradeEntry(examId, row.grade_pk);
    ElMessage.success("已删除");
    await fetchEntries();
  } catch (e) {
    // 错误提示由拦截器处理
  } finally {
    singleDeletingPk.value = null;
  }
};

const handleClear = async () => {
  const total = meta.value?.total || 0;
  if (total === 0) return;

  try {
    await ElMessageBox.confirm(
      `确认清空该批次下的全部 ${total} 条历史成绩？\n将物理删除 ${total} 行 Grade 数据，删除后无法恢复。`,
      "清空成绩",
      {
        confirmButtonText: "清空",
        confirmButtonClass: "el-button--danger",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
  } catch {
    return; // 用户取消
  }

  clearing.value = true;
  try {
    const res = await maintenanceAPI.clearHistoricalGradeEntries(examId);
    const data = res.data || {};
    const successCount = data.success_count || 0;
    const failCount = data.fail_count || 0;
    const failedPks = data.failed_grade_pks || [];

    if (failCount === 0) {
      ElMessage.success(`已清空 ${successCount} 条成绩`);
    } else if (successCount === 0) {
      ElMessage.error(`全部 ${data.total || 0} 条清空失败`);
    } else {
      const failHtml = failedPks.map((pk) => `<li>grade_pk=${pk}</li>`).join("");
      const more = failCount > failedPks.length
        ? `<p>仅显示前 ${failedPks.length} 项，共 ${failCount} 项失败</p>`
        : "";
      try {
        await ElMessageBox.alert(
          `<p>成功 ${successCount} 条，失败 ${failCount} 条。</p><ul>${failHtml}</ul>${more}`,
          "清空部分成功",
          { dangerouslyUseHTMLString: true, confirmButtonText: "知道了" },
        );
      } catch {}
    }
    await fetchEntries();
  } catch (e) {
    // axios 拦截器已弹错误 toast
  } finally {
    clearing.value = false;
  }
};

onMounted(() => {
  fetchEntries();
});
</script>

<style scoped>
.historical-exam-grades {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.el-breadcrumb {
  margin-bottom: 4px;
}
</style>
