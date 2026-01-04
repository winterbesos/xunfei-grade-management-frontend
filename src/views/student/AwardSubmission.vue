<template>
  <div class="award-submission">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>奖项管理</span>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane label="系统奖项" name="existing">
          <div class="tab-actions">
            <el-button type="primary" @click="handleAdd('existing')"
              >提交新奖项</el-button
            >
          </div>
          <el-table :data="awards" style="width: 100%" v-loading="loading">
            <el-table-column prop="activity_name" label="活动名称" />
            <el-table-column prop="name" label="荣誉奖项" />
            <el-table-column prop="approval_teacher_name" label="审核老师" />
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{
                  getStatusText(row.status)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  type="primary"
                  link
                  size="small"
                  @click="handleEdit(row, 'existing')"
                >
                  修改
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="课外奖项申报" name="declaration">
          <div class="tab-actions">
            <el-button type="primary" @click="handleAdd('declaration')"
              >申报新奖项</el-button
            >
          </div>
          <el-table
            :data="activityRequests"
            style="width: 100%"
            v-loading="loading"
          >
            <el-table-column prop="name" label="活动名称" />
            <el-table-column prop="award_name" label="荣誉奖项" />
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tooltip
                  v-if="row.status_code === 'rejected' && row.reject_reason"
                  class="box-item"
                  effect="dark"
                  :content="'拒绝原因: ' + row.reject_reason"
                  placement="top"
                >
                  <el-tag :type="getStatusType(row.status_code)">{{
                    getStatusText(row.status_code)
                  }}</el-tag>
                </el-tooltip>
                <el-tag v-else :type="getStatusType(row.status_code)">{{
                  getStatusText(row.status_code)
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button
                  v-if="row.status_code === 'pending'"
                  type="primary"
                  link
                  size="small"
                  @click="handleEdit(row, 'declaration')"
                >
                  修改
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="
        form.id
          ? '修改' + (form.type === 'existing' ? '奖项' : '申报')
          : form.type === 'existing'
            ? '提交新奖项'
            : '申报课外奖项'
      "
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <!-- Removed Radio Group -->

        <template v-if="form.type === 'existing'">
          <el-form-item label="活动名称" prop="activity_id">
            <el-select
              v-model="form.activity_id"
              placeholder="请选择活动"
              filterable
              @change="handleActivityChange"
              style="width: 100%"
            >
              <el-option
                v-for="activity in activities"
                :key="activity.id"
                :label="activity.name"
                :value="activity.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="荣誉奖项" prop="name">
            <el-select
              v-model="form.name"
              placeholder="请选择荣誉奖项"
              filterable
              style="width: 100%"
              :disabled="!form.activity_id"
            >
              <el-option
                v-for="reward in availableRewards"
                :key="reward.name"
                :label="reward.name"
                :value="reward.name"
              ></el-option>
            </el-select>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="活动名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入活动名称" />
          </el-form-item>
          <el-form-item label="荣誉奖项" prop="award_name">
            <el-input
              v-model="form.award_name"
              placeholder="请输入荣誉奖项名称"
            />
          </el-form-item>
          <el-form-item label="奖项证明" prop="image_url">
            <el-upload
              class="avatar-uploader"
              :action="uploadData.host"
              :data="ossUploadParams"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
            >
              <img v-if="form.image_url" :src="form.image_url" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting"
            >提交</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { studentAPI } from "@/api/student";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const activeTab = ref("existing");
const awards = ref([]); // System awards
const activityRequests = ref([]); // Extracurricular declarations
const teachers = ref([]);
const activities = ref([]);
const formRef = ref(null);

const form = reactive({
  id: null,
  type: "existing",
  activity_id: "",
  activity_name: "",
  name: "", // This will store the selected reward or input name
  approval_teacher_id: "",
  image_url: "",
});

const uploadData = reactive({
  host: "",
  dir: "",
  key: "",
  policy: "",
  "x-oss-signature-version": "",
  "x-oss-credential": "",
  "x-oss-date": "",
  "x-oss-security-token": "",
  "x-oss-signature": "",
  success_action_status: "200",
});

const ossUploadParams = computed(() => {
  const params = {
    key: uploadData.key,
    policy: uploadData.policy,
    "x-oss-signature-version": uploadData["x-oss-signature-version"],
    "x-oss-credential": uploadData["x-oss-credential"],
    "x-oss-date": uploadData["x-oss-date"],
    "x-oss-signature": uploadData["x-oss-signature"],
    success_action_status: uploadData.success_action_status,
  };
  if (uploadData["x-oss-security-token"]) {
    params["x-oss-security-token"] = uploadData["x-oss-security-token"];
  }
  return params;
});

const rules = computed(() => {
  const commonRules = {
    approval_teacher_id: [
      { required: true, message: "请选择审核老师", trigger: "change" },
    ],
  };

  if (form.type === "existing") {
    return {
      ...commonRules,
      activity_id: [
        { required: true, message: "请选择活动", trigger: "change" },
      ],
      name: [{ required: true, message: "请选择荣誉奖项", trigger: "change" }],
    };
  } else {
    return {
      ...commonRules,
      activity_name: [
        { required: true, message: "请输入活动名称", trigger: "blur" },
      ],
      name: [{ required: true, message: "请输入荣誉奖项", trigger: "blur" }],
      image_url: [
        { required: true, message: "请上传奖项证明", trigger: "change" },
      ],
    };
  }
});

const availableRewards = computed(() => {
  if (form.type !== "existing") return [];
  const activity = activities.value.find((a) => a.id === form.activity_id);
  return activity ? activity.awards : [];
});

const handleActivityChange = () => {
  form.name = ""; // Reset reward when activity changes
};

// handleTypeChange removed as radio button is removed

const beforeUpload = async (file) => {
  try {
    const res = await studentAPI.getPostSign();
    if (res.status === 200) {
      const sig = res.data;
      uploadData.host = sig.host;
      uploadData.dir = sig.dir;
      uploadData.key = `${sig.dir}${Date.now()}_${file.name}`;
      uploadData.policy = sig.policy;
      uploadData["x-oss-signature-version"] = sig.x_oss_signature_version;
      uploadData["x-oss-credential"] = sig.x_oss_credential;
      uploadData["x-oss-date"] = sig.x_oss_date;
      uploadData["x-oss-security-token"] = sig.x_oss_security_token;
      uploadData["x-oss-signature"] = sig.x_oss_signature;
      uploadData.success_action_status = sig.success_action_status || "200";
      return true;
    } else {
      ElMessage.error("获取上传签名失败");
      return false;
    }
  } catch (error) {
    console.error("Upload signature error:", error);
    ElMessage.error("获取上传签名失败");
    return false;
  }
};

const handleUploadSuccess = (response, file) => {
  form.image_url = `${uploadData.host}/${uploadData.key}`;
  ElMessage.success("上传成功");
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

const loadData = async () => {
  loading.value = true;
  try {
    const [awardsRes, requestsRes, teachersRes, activitiesRes] =
      await Promise.all([
        studentAPI.getAwards(),
        studentAPI.getActivityRequests(),
        studentAPI.getAllTeachers(),
        studentAPI.getActivities(),
      ]);

    if (awardsRes.status === 200) {
      awards.value = awardsRes.data;
    }
    if (requestsRes.status === 200) {
      activityRequests.value = requestsRes.data;
    }
    if (teachersRes.status === 200) {
      teachers.value = teachersRes.data;
    }
    if (activitiesRes.status === 200) {
      activities.value = activitiesRes.data.list || activitiesRes.data;
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("加载数据失败");
  } finally {
    loading.value = false;
  }
};

const handleAdd = (type) => {
  form.id = null;
  form.type = type;
  form.activity_id = "";
  form.activity_name = "";
  form.name = "";
  form.award_name = "";
  form.approval_teacher_id = "";
  form.image_url = "";
  dialogVisible.value = true;
};

const handleEdit = (row, type) => {
  form.id = row.id;
  form.type = type;

  if (type === "existing") {
    form.activity_id = row.activity_id;
    form.activity_name = "";
  } else {
    form.activity_id = "";
    form.activity_name = row.activity_name;
    form.award_name = row.award_name;
  }
  form.name = row.name;
  form.approval_teacher_id = row.approval_teacher_id;
  form.image_url = row.image_url || "";
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        const payload = { ...form };
        // Clean up payload based on type
        if (form.type === "existing") {
          delete payload.activity_name;
          delete payload.image_url;
        } else {
          delete payload.activity_id;
        }

        let res;
        // Check if it's an update or create
        if (form.id) {
          // Update logic
          if (form.type === "existing") {
            res = await studentAPI.updateAward(form.id, payload);
          } else {
            res = await studentAPI.updateActivityRequest(form.id, payload);
          }
        } else {
          // Create logic
          if (form.type === "existing") {
            res = await studentAPI.submitAward(payload);
          } else {
            res = await studentAPI.submitActivityRequest(payload);
          }
        }

        if (res.status === 200) {
          ElMessage.success(form.id ? "修改成功" : "提交成功");
          dialogVisible.value = false;
          loadData();
        }
      } catch (error) {
        console.log("Submit error:", error);
        ElMessage.error("提交失败");
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.award-submission {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tab-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
