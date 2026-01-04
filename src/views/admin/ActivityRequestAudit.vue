<template>
  <div class="activity-request-audit">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>奖项申报审核</h3>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <div class="filter-section">
        <el-form :inline="true" :model="filters" class="demo-form-inline">
          <el-form-item label="学生姓名">
            <el-input
              v-model="filters.student_name"
              placeholder="请输入学生姓名"
              clearable
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="filters.status"
              placeholder="全部"
              clearable
              style="width: 120px"
            >
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 列表 -->
      <el-table
        :data="requestList"
        v-loading="loading"
        style="width: 100%"
        border
      >
        <el-table-column prop="student_name" label="学生姓名" width="120" />
        <el-table-column prop="student_class" label="班级" width="150" />
        <el-table-column prop="name" label="活动名称" min-width="150" />
        <el-table-column prop="award_name" label="荣誉奖项" min-width="150" />
        <el-table-column label="证明材料" width="120" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.image_url"
              style="width: 50px; height: 50px"
              :src="row.image_url"
              :preview-src-list="[row.image_url]"
              fit="cover"
              preview-teleported
            />
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status_code)">
              {{ getStatusText(row.status_code) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status_code === 'pending'">
              <el-button size="small" type="success" @click="handleApprove(row)"
                >通过</el-button
              >
              <el-button size="small" type="danger" @click="handleReject(row)"
                >拒绝</el-button
              >
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝申请" width="400px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input
            v-model="rejectForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject" :loading="rejecting"
            >确认拒绝</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 通过并发布对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="通过并发布活动奖项"
      width="500px"
    >
      <el-form
        :model="approveForm"
        :rules="approveRules"
        ref="approveFormRef"
        label-width="100px"
      >
        <el-form-item label="所属学期" prop="semester_id">
          <el-select
            v-model="approveForm.semester_id"
            placeholder="请选择学期"
            style="width: 100%"
          >
            <el-option
              v-for="sem in semesters"
              :key="sem.semester_id"
              :label="sem.academic_year_name + sem.term_name"
              :value="sem.semester_id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="活动类型" prop="activity_type">
          <el-radio-group v-model="approveForm.activity_type">
            <el-radio label="existing">现有活动</el-radio>
            <el-radio label="new">新活动</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="approveForm.activity_type === 'existing'">
          <el-form-item label="选择活动" prop="activity_id">
            <el-select
              v-model="approveForm.activity_id"
              placeholder="请选择活动"
              filterable
              style="width: 100%"
              @change="handleExistingActivityChange"
            >
              <el-option
                v-for="act in semesterActivities"
                :key="act.id"
                :label="act.name"
                :value="act.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="选择奖项" prop="award_name">
            <el-select
              v-model="approveForm.award_name"
              placeholder="请选择奖项"
              filterable
              allow-create
              default-first-option
              style="width: 100%"
              @change="handleExistingAwardChange"
            >
              <el-option
                v-for="award in existingAwards"
                :key="award.name"
                :label="award.name"
                :value="award.name"
              />
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="活动名称" prop="activity_name">
            <el-input
              v-model="approveForm.activity_name"
              placeholder="请输入活动名称"
            />
          </el-form-item>
          <el-form-item label="活动级别" prop="level">
            <el-select
              v-model="approveForm.level"
              placeholder="请选择级别"
              style="width: 100%"
            >
              <el-option label="校级" :value="1" />
              <el-option label="市级" :value="2" />
              <el-option label="省级" :value="3" />
              <el-option label="国家级" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="荣誉奖项" prop="award_name">
            <el-input
              v-model="approveForm.award_name"
              placeholder="请输入奖项名称"
            />
          </el-form-item>
        </template>

        <template v-if="approveForm.activity_type === 'new'">
          <el-divider content-position="left">能力项评分</el-divider>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="学习能力" label-width="80px">
                <el-input-number
                  v-model="approveForm.study_ability"
                  :min="0"
                  :max="10"
                  size="small"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="思维逻辑" label-width="80px">
                <el-input-number
                  v-model="approveForm.logical_thinking"
                  :min="0"
                  :max="10"
                  size="small"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创新创造" label-width="80px">
                <el-input-number
                  v-model="approveForm.creativity"
                  :min="0"
                  :max="10"
                  size="small"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="团队协作" label-width="80px">
                <el-input-number
                  v-model="approveForm.teamwork"
                  :min="0"
                  :max="10"
                  size="small"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="责任心" label-width="80px">
                <el-input-number
                  v-model="approveForm.responsibility"
                  :min="0"
                  :max="10"
                  size="small"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approveDialogVisible = false">取消</el-button>
          <el-button type="success" @click="confirmApprove" :loading="approving"
            >确认通过</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { adminAPI } from "@/api/admin";
import { ElMessage, ElMessageBox } from "element-plus";
import { formatDate } from "@/utils/date";

const loading = ref(false);
const requestList = ref([]);
const total = ref(0);

const pagination = reactive({
  page: 1,
  limit: 10,
});

const filters = reactive({
  student_name: "",
  status: "pending", // Default to pending
});

const rejectDialogVisible = ref(false);
const rejecting = ref(false);
const currentRejectRow = ref(null);
const rejectForm = reactive({
  comment: "",
});

// Approve & Publish State
const approveDialogVisible = ref(false);
const approving = ref(false);
const currentApproveRow = ref(null);
const approveFormRef = ref(null);
const semesters = ref([]);
const allActivities = ref([]);
const semesterActivities = ref([]);
const existingAwards = ref([]);

const approveForm = reactive({
  semester_id: "",
  activity_type: "new", // 'new' or 'existing'
  activity_id: "",
  activity_name: "",
  level: 1,
  activity_date: "",
  award_name: "",
  study_ability: 0,
  logical_thinking: 0,
  creativity: 0,
  teamwork: 0,
  responsibility: 0,
});

const approveRules = {
  semester_id: [{ required: true, message: "请选择学期", trigger: "change" }],
  activity_type: [
    { required: true, message: "请选择活动类型", trigger: "change" },
  ],
  activity_id: [{ required: true, message: "请选择活动", trigger: "change" }],
  activity_name: [
    { required: true, message: "请输入活动名称", trigger: "blur" },
  ],
  level: [{ required: true, message: "请选择级别", trigger: "change" }],
  activity_date: [
    { required: true, message: "请选择活动时间", trigger: "change" },
  ],
  award_name: [
    { required: true, message: "请输入或选择奖项", trigger: "change" },
  ],
};

import { watch } from "vue";

watch(
  () => approveForm.semester_id,
  (newVal) => {
    if (newVal) {
      semesterActivities.value = allActivities.value.filter(
        (a) => a.semester_id === newVal,
      );
      if (
        !semesterActivities.value.find((a) => a.id === approveForm.activity_id)
      ) {
        approveForm.activity_id = "";
        existingAwards.value = [];
      }
    } else {
      semesterActivities.value = [];
    }
  },
);

const handleExistingActivityChange = (val) => {
  const activity = semesterActivities.value.find((a) => a.id === val);
  existingAwards.value = activity ? activity.awards : [];
  approveForm.award_name = "";
  // Clear scores
  approveForm.study_ability = 0;
  approveForm.logical_thinking = 0;
  approveForm.creativity = 0;
  approveForm.teamwork = 0;
  approveForm.responsibility = 0;
};

const handleExistingAwardChange = (val) => {
  const award = existingAwards.value.find((a) => a.name === val);
  if (award) {
    approveForm.study_ability = award.study_ability || 0;
    approveForm.logical_thinking = award.logical_thinking || 0;
    approveForm.creativity = award.creativity || 0;
    approveForm.teamwork = award.teamwork || 0;
    approveForm.responsibility = award.responsibility || 0;
  }
};

const getStatusType = (status) => {
  const map = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };
  return map[status] || "info";
};

const getStatusText = (status) => {
  const map = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
  };
  return map[status] || status;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    };
    for (const key in params) {
      if (params[key] === "" || params[key] === null) {
        delete params[key];
      }
    }

    const res = await adminAPI.getActivityRequests(params);
    if (res.status === 200) {
      if (res.data.items) {
        requestList.value = res.data.items;
        total.value = res.data.total;
      } else {
        requestList.value = res.data;
        total.value = res.data.length;
      }
    }
  } catch (error) {
    console.error("Fetch error:", error);
    ElMessage.error("获取列表失败");
  } finally {
    loading.value = false;
  }
};

const fetchSemestersAndActivities = async () => {
  try {
    const [semRes, actRes] = await Promise.all([
      adminAPI.getSemesters(),
      adminAPI.getActivities(), // Assuming this gets all activities or reasonable limit
    ]);
    if (semRes.status === 200) {
      semesters.value = semRes.data.list || semRes.data;
    }
    if (actRes.status === 200) {
      allActivities.value = actRes.data.list || actRes.data;
    }
  } catch (error) {
    console.error("Fetch options error:", error);
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

const resetFilters = () => {
  filters.student_name = "";
  filters.status = "";
  handleSearch();
};

const handleSizeChange = (val) => {
  pagination.limit = val;
  fetchData();
};

const handleCurrentChange = (val) => {
  pagination.page = val;
  fetchData();
};

const handleApprove = (row) => {
  currentApproveRow.value = row;
  approveForm.semester_id = "";
  approveForm.activity_type = "new";
  approveForm.activity_id = "";
  approveForm.activity_name = row.name;
  approveForm.level = 1;
  approveForm.activity_date = new Date().toISOString().split("T")[0];
  approveForm.award_name = row.award_name; // Check if it's row.award or row.award_name

  approveForm.study_ability = 0;
  approveForm.logical_thinking = 0;
  approveForm.creativity = 0;
  approveForm.teamwork = 0;
  approveForm.responsibility = 0;

  approveDialogVisible.value = true;
  if (semesters.value.length === 0) {
    fetchSemestersAndActivities();
  }
};

const confirmApprove = async () => {
  if (!approveFormRef.value) return;
  await approveFormRef.value.validate(async (valid) => {
    if (valid) {
      approving.value = true;
      try {
        let res;
        if (approveForm.activity_type === "new") {
          // Construct payload for new activity
          const payload = {
            award_name: approveForm.award_name,
            semester_id: approveForm.semester_id,
            activity: {
              name: approveForm.activity_name,
              level: approveForm.level,
              credit: null, // Assuming credit is optional or not in this form yet
              awards: [
                {
                  name: approveForm.award_name,
                  study_ability: approveForm.study_ability,
                  logical_thinking: approveForm.logical_thinking,
                  creativity: approveForm.creativity,
                  teamwork: approveForm.teamwork,
                  responsibility: approveForm.responsibility,
                },
              ],
            },
          };
          res = await adminAPI.approveActivityRequestWithNewActivity(
            currentApproveRow.value.id,
            payload,
          );
        } else {
          // Existing activity approval
          const payload = {
            award_name: approveForm.award_name,
            activity_id: approveForm.activity_id,
          };
          res = await adminAPI.approveActivityRequestWithActivity(
            currentApproveRow.value.id,
            payload,
          );
        }

        if (res.status === 200) {
          ElMessage.success("操作成功");
          approveDialogVisible.value = false;
          fetchData();
        }
      } catch (error) {
        console.error(error);
        ElMessage.error("操作失败");
      } finally {
        approving.value = false;
      }
    }
  });
};

const handleReject = (row) => {
  currentRejectRow.value = row;
  rejectForm.comment = "";
  rejectDialogVisible.value = true;
};

const confirmReject = async () => {
  if (!currentRejectRow.value) return;

  rejecting.value = true;
  try {
    const res = await adminAPI.rejectActivityRequest(
      currentRejectRow.value.id,
      rejectForm.comment,
    );
    if (res.status === 200) {
      ElMessage.success("已拒绝");
      rejectDialogVisible.value = false;
      fetchData();
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("操作失败");
  } finally {
    rejecting.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.activity-request-audit {
  padding: 20px;
}
.filter-section {
  margin-bottom: 20px;
}
.pagination-section {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
