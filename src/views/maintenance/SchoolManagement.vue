<template>
  <div class="school-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>学校管理</h3>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加学校
          </el-button>
        </div>
      </template>

      <!-- 学校列表 -->
      <el-table :data="filteredSchools" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="学校名称" min-width="200" />
        <el-table-column
          prop="studentCount"
          label="学生数量"
          width="100"
          align="center"
        />
        <el-table-column
          prop="teacherCount"
          label="教师数量"
          width="100"
          align="center"
        />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === "active" ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            <span>{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewDetail(row)">
              详情
            </el-button>
            <!--
            <el-button
              size="small"
              :type="row.status === 'active' ? 'danger' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === "active" ? "禁用" : "启用" }}
            </el-button>
            -->

            <el-button size="small" :type="'success'" @click="syncSchool(row)">
              同步
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑学校对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑学校' : '添加学校'"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="schoolFormRef"
        :model="schoolForm"
        :rules="schoolRules"
        label-width="100px"
      >
        <el-form-item label="学校ID" prop="id">
          <el-input v-model="schoolForm.schoolId" placeholder="请输入学校ID">
            <template #append>
              <el-button :icon="Search" @click="loadUnregisteredSchool" />
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="学校ID" prop="id">
          <el-input
            v-model="schoolForm.schoolShortId"
            placeholder="请输入学校短ID"
          />
        </el-form-item>

        <el-form-item label="学校名称" prop="name">
          <el-input v-model="schoolName" disabled />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="schoolForm.status"
            active-value="active"
            inactive-value="inactive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitSchool"
            :loading="submitLoading"
          >
            {{ isEdit ? "更新" : "添加" }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
import { maintenanceAPI } from "@/api/maintenance";
import { formatDate } from "@/utils/date";

const router = useRouter();

// 数据
const loading = ref(false);
const searchKeyword = ref("");
const filterStatus = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const schools = ref([]);

// 表单相关
const showAddDialog = ref(false);
const isEdit = ref(false);
const submitLoading = ref(false);
const schoolFormRef = ref();

const schoolForm = ref({
  id: null,
  schoolId: null,
  schoolShortId: null,
  adminId: null,
  status: "active",
});

const unregisteredSchool = ref(null);

const schoolName = computed(() => unregisteredSchool.value?.school_name || "");

const schoolRules = {
  schoolId: [
    { required: true, message: "请输入学校ID", trigger: "blur" },
    { min: 1, message: "不为空", trigger: "blur" },
  ],
  adminId: [{ required: true, message: "请选择管理员", trigger: "change" }],
};

// 计算属性
const filteredSchools = computed(() => {
  let result = schools.value;

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      (school) =>
        school.name.toLowerCase().includes(keyword) ||
        school.adminName.toLowerCase().includes(keyword),
    );
  }

  if (filterStatus.value) {
    result = result.filter((school) => school.status === filterStatus.value);
  }

  total.value = result.length;
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return result.slice(start, end);
});

// 方法
const loadSchools = async () => {
  loading.value = true;
  try {
    const params = {
      keyword: searchKeyword.value,
      status: filterStatus.value,
      page: currentPage.value,
      limit: pageSize.value,
    };

    const response = await maintenanceAPI.getSchools(params);
    if (response.status === 200) {
      // 适配后端数据结构
      schools.value =
        response.data.schools?.map((school) => ({
          id: school.id,
          schoolId: school.school_id,
          name: school.school_name,
          adminName: school.admin_name || "未分配",
          status: school.is_enabled ? "active" : "inactive",
          createdAt: school.created_at,
          studentCount: school.student_count,
          teacherCount: school.teacher_count,
        })) || [];
      total.value = response.data.total || schools.value.length;
    } else {
      ElMessage.error("获取学校列表失败");
    }
  } catch (error) {
    ElMessage.error("获取学校列表失败");
    console.error("Error loading schools:", error);
  } finally {
    loading.value = false;
  }
};

const loadUnregisteredSchool = async () => {
  if (!schoolForm.value.schoolId) {
    ElMessage.warning("请输入学校ID");
    return;
  }
  try {
    const response = await maintenanceAPI.getUnregisteredSchool(
      schoolForm.value.schoolId,
    );
    if (response.status === 200) {
      unregisteredSchool.value = response.data;
    }
  } catch (error) {
    console.error("Error loading unregistered schools:", error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadSchools();
};

const resetSearch = () => {
  searchKeyword.value = "";
  filterStatus.value = "";
  currentPage.value = 1;
  loadSchools();
};

const viewDetail = (school) => {
  router.push({
    name: "maintenanceSchoolDetail",
    params: { schoolId: school.schoolId },
    state: { schoolData: JSON.stringify(school) },
  });
};

const editSchool = (school) => {
  isEdit.value = true;
  schoolForm.value = {
    id: school.id,
    schoolId: school.schoolId,
    schoolShortId: school.schoolShortId,
    name: school.name,
    code: school.code,
    adminId: school.adminId,
    status: school.status,
  };
  showAddDialog.value = true;
};

const toggleStatus = async (school) => {
  try {
    await ElMessageBox.confirm(
      `确定要${school.status === "active" ? "禁用" : "启用"}学校 "${school.name}" 吗？`,
      "确认操作",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    const newStatus = school.status === "active" ? "inactive" : "active";
    const response = await maintenanceAPI.updateSchool(school.schoolId, {
      school_id: school.schoolId,
      is_enabled: newStatus === "active",
    });

    if (response.status === 200) {
      school.status = newStatus;
      ElMessage.success("状态更新成功");
    } else {
      ElMessage.error("状态更新失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
    }
  }
};

const syncSchool = async (school) => {
  try {
    const response = await maintenanceAPI.syncSchoolData(school.schoolId);
    if (response.status === 200) {
      ElMessage.success("学校数据同步成功");
    } else {
      ElMessage.error("学校数据同步失败");
    }
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

const submitSchool = async () => {
  if (!schoolFormRef.value) return;

  await schoolFormRef.value.validate(async (valid) => {
    if (!valid) return;

    submitLoading.value = true;
    try {
      const schoolData = {
        school_id: schoolForm.value.schoolId,
        school_short_id: schoolForm.value.schoolShortId,
        is_enabled: schoolForm.value.status === "active",
      };

      let response;
      if (isEdit.value) {
        response = await maintenanceAPI.updateSchool(
          schoolForm.value.schoolId,
          schoolData,
        );
      } else {
        response = await maintenanceAPI.createSchool(schoolData);
      }

      if (response.status === 200) {
        ElMessage.success(isEdit.value ? "学校信息更新成功" : "学校添加成功");
        showAddDialog.value = false;
        resetForm();
        loadSchools();
      } else {
        ElMessage.error(isEdit.value ? "学校信息更新失败" : "学校添加失败");
      }
    } catch (error) {
      ElMessage.error("操作失败");
      console.error("Error submitting school:", error);
    } finally {
      submitLoading.value = false;
    }
  });
};

const resetForm = () => {
  schoolForm.value = {
    id: null,
    name: "",
    code: "",
    adminId: null,
    status: "active",
  };
  isEdit.value = false;
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  loadSchools();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadSchools();
};

onMounted(() => {
  loadSchools();
});
</script>

<style scoped>
.school-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.search-section {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.row {
  display: flex;
  align-items: center;
}
</style>
