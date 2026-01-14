<template>
  <div class="school-exams">
    <div class="page-header" v-if="!props.embedded">
      <el-page-header @back="goBack">
        <template #content>
          <span class="text-large font-600 mr-3"> 学校考试列表 </span>
        </template>
      </el-page-header>
    </div>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>考试列表</span>
        </div>
      </template>

      <el-table
        :data="examList"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column
          prop="exam_id"
          label="考试ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="exam_name" label="考试名称" min-width="200" />
        <el-table-column prop="exam_type_name" label="考试类型" width="150" />
        <el-table-column prop="semester_name" label="学期" width="200" />
        <el-table-column prop="source" label="成绩来源" width="120">
          <template #default="{ row }">
            {{ row.source === 1 ? '智学网' : '手动维护' }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="最后同步时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewGrades(row)"
            >
              查看成绩
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleResync(row)"
              :loading="resyncLoading === row.exam_id"
              v-if="row.source === 1"
            >
              重新同步
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && examList.length === 0"
        description="暂无考试数据"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { maintenanceAPI } from "@/api/maintenance";
import { ElMessage, ElMessageBox } from "element-plus";
import { formatDate } from "@/utils/date";

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  schoolId: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const router = useRouter();
const currentSchoolId = computed(() => props.schoolId || route.params.schoolId);

const loading = ref(false);
const examList = ref([]);
const resyncLoading = ref(null);

const goBack = () => {
  router.back();
};

const handleViewGrades = (row) => {
  router.push({
    name: "maintenanceSchoolExamGrades",
    params: {
      schoolId: currentSchoolId.value,
      examId: row.exam_id,
    },
  });
};

const fetchExams = async () => {
  loading.value = true;
  try {
    const res = await maintenanceAPI.getSchoolExams(currentSchoolId.value);
    if (res.status === 200) {
      if (Array.isArray(res.data)) {
        examList.value = res.data;
      } else {
        // Fallback if wrapped in an object
        examList.value = res.data.exams || res.data.items || [];
      }
    } else {
      ElMessage.error("获取考试列表失败");
    }
  } catch (error) {
    console.error("Failed to fetch exams:", error);
    ElMessage.error("获取考试列表失败");
  } finally {
    loading.value = false;
  }
};

const handleResync = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要重新同步考试 "${row.exam_name}" 的事件吗？`,
      "确认同步",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    resyncLoading.value = row.exam_id;
    const res = await maintenanceAPI.resyncExamEvents(
      currentSchoolId.value,
      row.exam_id
    );

    if (res.status === 200) {
      ElMessage.success("同步请求已提交");
    } else {
      ElMessage.error("同步失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("Resync error:", error);
      ElMessage.error("同步操作失败");
    }
  } finally {
    resyncLoading.value = null;
  }
};

onMounted(() => {
  if (currentSchoolId.value) {
    fetchExams();
  } else {
    ElMessage.error("缺少学校ID参数");
  }
});
</script>

<style scoped>
.school-exams {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 16px;
}
</style>
