<template>
  <div class="class-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>班级管理</span>
          <div class="header-actions">
            <el-select
              v-model="gradeFilter"
              placeholder="筛选年级"
              clearable
              style="width: 150px; margin-right: 10px"
            >
              <el-option
                v-for="grade in gradeOptions"
                :key="grade"
                :label="grade"
                :value="grade"
              />
            </el-select>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredClassList"
        v-loading="loading"
        style="width: 100%"
      >
        <!--
        <el-table-column
          prop="class_id"
          label="班级ID"
          width="150"
          show-overflow-tooltip
        />
        -->
        <el-table-column prop="class_name" label="班级" />
        <el-table-column prop="year_name" label="年级" />
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
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { adminAPI } from "@/api/admin";
import { ElMessage } from "element-plus";

const router = useRouter();
const loading = ref(false);
const classList = ref([]);
const gradeFilter = ref("");
const gradeOptions = ref([]);

const queryParams = reactive({
  page: 1,
  pageSize: 100,
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

const fetchYears = async () => {
  try {
    const res = await adminAPI.getSchoolYears();
    if (res.status === 200) {
      gradeOptions.value = res.data.map((year) => year.year_name);
    }
  } catch (error) {
    console.error("Failed to fetch academic years:", error);
    ElMessage.error("获取学年列表失败");
  }
};

const filteredClassList = computed(() => {
  let list = classList.value;
  if (gradeFilter.value) {
    list = list.filter((item) => {
      const name = item.class_name || "";
      // 只要班级名称包含选中的年级关键词即可
      return name.includes(gradeFilter.value);
    });
  }
  // 按 year_code 降序和 class_name 升序排序
  return [...list].sort((a, b) => {
    const yearA = Number(a.year_code) || 0;
    const yearB = Number(b.year_code) || 0;
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    return (a.class_name || "").localeCompare(b.class_name || "", "zh-CN");
  });
});

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
  fetchYears();
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
