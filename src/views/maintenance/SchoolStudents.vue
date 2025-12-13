<template>
  <div class="school-students">
    <div class="page-header" v-if="!props.embedded">
      <el-page-header @back="goBack">
        <template #content>
          <span class="text-large font-600 mr-3"> 学校学生列表 </span>
        </template>
      </el-page-header>
    </div>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>学生列表</span>
          <div class="header-actions">
            <el-input
              v-model="queryParams.keyword"
              placeholder="搜索学生姓名或ID"
              style="width: 200px; margin-right: 15px"
              clearable
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="queryParams.has_short_id_filter"
              placeholder="短ID筛选"
              clearable
              style="width: 120px; margin-right: 15px"
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="有短ID" value="true" />
              <el-option label="无短ID" value="false" />
            </el-select>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="studentList"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column
          prop="user_id"
          label="学生ID"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="user_name" label="姓名" width="150" />
        <el-table-column label="所属班级" min-width="150">
          <template #default="{ row }">
            <span>{{ row.year_name }}{{ row.class_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="短ID" width="120">
          <template #default="{ row }">
            <span>{{ row.short_id || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button
              v-if="!row.short_id"
              link
              type="primary"
              size="small"
              @click="handleBindShortId(row)"
            >
              绑定短ID
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 (If backend supports pagination, otherwise client-side or just list) -->
      <!-- The provided API signature doesn't show pagination params (page, limit), only query params. 
           However, list[StudentResponse] might be large. 
           If the API returns a simple list, we might need client-side pagination or just show all.
           I'll assume no pagination for now based on the signature provided by the user. 
      -->
      <div class="pagination" v-if="total > 0">
        <span class="total-count">共 {{ total }} 条记录</span>
      </div>
    </el-card>

    <!-- 绑定短ID弹窗 -->
    <el-dialog
      v-model="bindDialogVisible"
      title="绑定短ID"
      width="400px"
      @close="resetBindForm"
    >
      <el-form
        :model="bindForm"
        :rules="bindRules"
        ref="bindFormRef"
        label-width="80px"
      >
        <el-form-item label="学生姓名">
          <el-input v-model="currentStudentName" disabled />
        </el-form-item>
        <el-form-item label="短ID" prop="short_id">
          <el-input v-model="bindForm.short_id" placeholder="请输入短ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bindDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitBindShortId"
            :loading="binding"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { maintenanceAPI } from "@/api/maintenance";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";

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
const studentList = ref([]);
const total = ref(0);

const queryParams = reactive({
  keyword: "",
  has_short_id_filter: "", // '' for all, 'true' for has, 'false' for no
});

// 绑定短ID相关
const bindDialogVisible = ref(false);
const binding = ref(false);
const bindFormRef = ref(null);
const currentStudentId = ref("");
const currentStudentName = ref("");
const bindForm = reactive({
  short_id: "",
});
const bindRules = {
  short_id: [{ required: true, message: "请输入短ID", trigger: "blur" }],
};

const goBack = () => {
  router.back();
};

const fetchStudents = async () => {
  loading.value = true;
  try {
    const apiParams = {
      keyword: queryParams.keyword || undefined,
    };

    if (queryParams.has_short_id_filter !== "") {
      apiParams.has_short_id = queryParams.has_short_id_filter === "true";
    }

    const res = await maintenanceAPI.getSchoolStudents(
      currentSchoolId.value,
      apiParams,
    );
    if (res.status === 200) {
      // The user said response_model=list[StudentResponse]
      const data = res.data;
      if (Array.isArray(data)) {
        studentList.value = data;
        total.value = data.length;
      } else {
        // Fallback in case it's wrapped
        studentList.value = data.students || data.items || [];
        total.value = studentList.value.length;
      }
    }
  } catch (error) {
    console.error("Failed to fetch students:", error);
    ElMessage.error("获取学生列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  fetchStudents();
};

const handleBindShortId = (row) => {
  currentStudentId.value = row.user_id;
  currentStudentName.value = row.user_name;
  bindForm.short_id = "";
  bindDialogVisible.value = true;
};

const submitBindShortId = async () => {
  if (!bindFormRef.value) return;
  await bindFormRef.value.validate(async (valid) => {
    if (valid) {
      binding.value = true;
      try {
        const response = await maintenanceAPI.bindStudentShortId(
          currentSchoolId.value,
          currentStudentId.value,
          bindForm.short_id,
        );
        if (response.status === 200 || response.status === 201) {
          ElMessage.success("绑定成功");
          bindDialogVisible.value = false;
          fetchStudents(); // 刷新列表
        } else {
          ElMessage.error(response.message || "绑定失败");
        }
      } catch (error) {
        ElMessage.error("绑定失败");
      } finally {
        binding.value = false;
      }
    }
  });
};

const resetBindForm = () => {
  if (bindFormRef.value) {
    bindFormRef.value.resetFields();
  }
  bindForm.short_id = "";
  currentStudentId.value = "";
  currentStudentName.value = "";
};

onMounted(() => {
  if (currentSchoolId.value) {
    fetchStudents();
  } else {
    ElMessage.error("缺少学校ID参数");
  }
});
</script>

<style scoped>
.school-students {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  color: #606266;
}

.text-gray {
  color: #909399;
}
</style>
