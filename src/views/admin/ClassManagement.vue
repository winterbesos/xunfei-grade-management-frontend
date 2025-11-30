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

      <el-table
        :data="filteredClassList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column
          prop="class_id"
          label="班级ID"
          width="150"
          show-overflow-tooltip
        />
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

const gradeOptions = computed(() => {
  const grades = new Set();
  classList.value.forEach((item) => {
    const name = item.class_name || "";
    // 尝试提取年级：支持 "高一"、"初二"、"2022级" 等格式
    // 简单提取前两个字作为年级，或者匹配特定模式
    let grade = "";
    if (name.includes("高一")) grade = "高一";
    else if (name.includes("高二")) grade = "高二";
    else if (name.includes("高三")) grade = "高三";
    else if (name.includes("初一")) grade = "初一";
    else if (name.includes("初二")) grade = "初二";
    else if (name.includes("初三")) grade = "初三";
    else {
      // 尝试匹配 "20xx级"
      const match = name.match(/(\d{4}级)/);
      if (match) {
        grade = match[1];
      } else {
        // 如果都匹配不到，取前两个字作为默认分组（如果有的话）
        grade = name.substring(0, 2);
      }
    }

    if (grade) {
      grades.add(grade);
    }
  });
  return Array.from(grades).sort();
});

const filteredClassList = computed(() => {
  if (!gradeFilter.value) return classList.value;
  return classList.value.filter((item) => {
    const name = item.class_name || "";
    // 只要班级名称包含选中的年级关键词即可
    return name.includes(gradeFilter.value);
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
