<template>
  <div class="award-review">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>获奖审核</span>
          <el-radio-group v-model="filterStatus" @change="handleFilter">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="pending">待审核</el-radio-button>
            <el-radio-button label="processed">已处理</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="filteredAwards" v-loading="loading" style="width: 100%">
        <el-table-column prop="student_name" label="学生姓名" width="120" />
        <el-table-column prop="activity_name" label="活动名称" width="150" />
        <el-table-column
          prop="name"
          label="奖项"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{
              getStatusText(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div v-if="row.status === 'pending'">
              <el-button
                type="success"
                size="small"
                @click="handleReview(row, 'approved')"
                >通过</el-button
              >
              <el-button
                type="danger"
                size="small"
                @click="handleReview(row, 'rejected')"
                >拒绝</el-button
              >
            </div>
            <span v-else class="processed-text">已处理</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 审核对话框 -->
    <el-dialog v-model="dialogVisible" title="审核意见" width="400px">
      <el-form>
        <el-form-item label="处理结果">
          <el-tag :type="reviewStatus === 'approved' ? 'success' : 'danger'">
            {{ reviewStatus === "approved" ? "通过" : "拒绝" }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview" :loading="submitting"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { teacherAPI } from "@/api/teacher";
import { ElMessage } from "element-plus";

const loading = ref(false);
const submitting = ref(false);
const awards = ref([]);
const filterStatus = ref("all");

const dialogVisible = ref(false);
const currentAward = ref(null);
const reviewStatus = ref("");
const reviewComment = ref("");

const loadAwards = async () => {
  loading.value = true;
  try {
    const response = await teacherAPI.getAwards();
    if (response.status === 200) {
      awards.value = response.data;
    }
  } catch (error) {
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

const filteredAwards = computed(() => {
  if (filterStatus.value === "all") return awards.value;
  if (filterStatus.value === "pending")
    return awards.value.filter((a) => a.status === "pending");
  if (filterStatus.value === "processed")
    return awards.value.filter((a) => a.status !== "pending");
  return awards.value;
});

const getStatusType = (status) => {
  const map = { pending: "warning", approved: "success", rejected: "danger" };
  return map[status] || "info";
};

const getStatusText = (status) => {
  const map = { pending: "待审核", approved: "已通过", rejected: "已拒绝" };
  return map[status] || status;
};

const handleFilter = () => {
  // Client-side filtering logic is handled by computed property
};

const handleReview = (row, status) => {
  currentAward.value = row;
  reviewStatus.value = status;
  reviewComment.value = "";
  dialogVisible.value = true;
};

const submitReview = async () => {
  if (!currentAward.value) return;

  submitting.value = true;
  try {
    const response = await teacherAPI.reviewAward(currentAward.value.id, {
      approve: reviewStatus.value === "approved",
    });

    if (response.status === 200) {
      ElMessage.success("审核完成");
      dialogVisible.value = false;
      loadAwards(); // Reload list
    }
  } catch (error) {
    ElMessage.error("审核失败");
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadAwards();
});
</script>

<style scoped>
.award-review {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.processed-text {
  color: #909399;
  font-size: 13px;
}
</style>
