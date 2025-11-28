<template>
  <div class="class-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>班级管理</span>
          <div class="header-actions">
            <el-input
              v-model="queryParams.keyword"
              placeholder="搜索班级名称"
              style="width: 200px; margin-right: 10px"
              @keyup.enter="handleSearch"
            />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </template>

      <el-table :data="classList" v-loading="loading" style="width: 100%">
        <el-table-column
          prop="class_id"
          label="班级ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="class_name" label="班级名称" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)"
              >查看</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { adminAPI } from "@/api/admin";
import { ElMessage } from "element-plus";

const router = useRouter();
const loading = ref(false);
const classList = ref([]);

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: "",
});

const fetchClasses = async () => {
  loading.value = true;
  try {
    const res = await adminAPI.getClasses(queryParams);
    if (res.status === 200) {
      classList.value = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    ElMessage.error("获取班级列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.page = 1;
  fetchClasses();
};

const handleView = (row) => {
  router.push({ name: "AdminClassDetail", params: { id: row.class_id } });
};

const handleSizeChange = (val) => {
  queryParams.pageSize = val;
  fetchClasses();
};

const handleCurrentChange = (val) => {
  queryParams.page = val;
  fetchClasses();
};

onMounted(() => {
  fetchClasses();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
