<template>
  <div class="award-review">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>获奖审核</span>
          </div>
          <div class="header-right" v-if="activeTab === 'pending'">
            <el-button
              type="success"
              :disabled="!hasSelectedPending"
              @click="handleBatchReview('approved')"
            >
              批量通过
            </el-button>
            <el-button
              type="danger"
              :disabled="!hasSelectedPending"
              @click="handleBatchReview('rejected')"
            >
              批量拒绝
            </el-button>
          </div>
          <div v-else style="height: 32px"></div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane label="待审核" name="pending">
          <el-table
            :data="pendingAwards"
            v-loading="loading"
            style="width: 100%; margin-top: 20px"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="student_name" label="学生姓名" width="120" />
            <el-table-column
              prop="activity_name"
              label="活动名称"
              width="150"
            />
            <el-table-column
              prop="name"
              label="奖项"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag type="warning">待审核</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <div>
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
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="!loading && pendingAwards.length === 0"
            description="暂无待审核记录"
          />
        </el-tab-pane>

        <el-tab-pane label="已处理" name="processed">
          <el-table
            :data="processedAwards"
            v-loading="loading"
            style="width: 100%; margin-top: 20px"
          >
            <el-table-column prop="student_name" label="学生姓名" width="120" />
            <el-table-column
              prop="activity_name"
              label="活动名称"
              width="150"
            />
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
              <template #default>
                <span class="processed-text">已处理</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="!loading && processedAwards.length === 0"
            description="暂无已处理记录"
          />
        </el-tab-pane>
      </el-tabs>
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
const activeTab = ref("pending");
const selectedAwards = ref([]);

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

const hasSelectedPending = computed(() => {
  return selectedAwards.value.some((award) => award.status === "pending");
});

const handleSelectionChange = (selection) => {
  selectedAwards.value = selection;
};

const handleBatchReview = async (status) => {
  const pendingAwardsList = selectedAwards.value.filter(
    (a) => a.status === "pending",
  );
  if (pendingAwardsList.length === 0) {
    ElMessage.warning("请选择待审核的记录");
    return;
  }

  loading.value = true;
  try {
    const promises = pendingAwardsList.map((award) =>
      teacherAPI.reviewAward(award.id, {
        approve: status === "approved",
      }),
    );

    await Promise.all(promises);

    ElMessage.success(
      `已批量${status === "approved" ? "通过" : "拒绝"} ${pendingAwardsList.length} 条申请`,
    );
    loadAwards();
    selectedAwards.value = [];
  } catch (error) {
    ElMessage.error("批量处理失败");
  } finally {
    loading.value = false;
  }
};

const pendingAwards = computed(() => {
  return awards.value.filter((a) => a.status === "pending");
});

const processedAwards = computed(() => {
  return awards.value.filter((a) => a.status !== "pending");
});

const getStatusType = (status) => {
  const map = { pending: "warning", approved: "success", rejected: "danger" };
  return map[status] || "info";
};

const getStatusText = (status) => {
  const map = { pending: "待审核", approved: "已通过", rejected: "已拒绝" };
  return map[status] || status;
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
.header-left {
  display: flex;
  align-items: center;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.processed-text {
  color: #909399;
  font-size: 13px;
}
</style>
