<template>
  <div class="grade-search">
    <el-card>
      <template #header>
        <span class="header-title">成绩查询</span>
      </template>

      <div class="search-bar">
        <el-input
          v-model="keyword"
          placeholder="输入学生姓名或学号"
          clearable
          style="max-width: 360px"
          :prefix-icon="Search"
          @keyup.enter="onSearch"
          @clear="onClear"
        />
        <el-button type="primary" :loading="loading" @click="onSearch">搜索</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="students"
        stripe
        border
        style="margin-top: 16px"
        empty-text="输入姓名或学号开始搜索"
      >
        <el-table-column label="姓名" prop="user_name" min-width="120" />
        <el-table-column label="学号" prop="user_id" min-width="200" show-overflow-tooltip />
        <el-table-column label="班级" min-width="160">
          <template #default="{ row }">{{ row.class_info?.name || "-" }}</template>
        </el-table-column>
        <el-table-column label="学校" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">{{ row.school_info?.name || "-" }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goToDetail(row)">成绩详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="searched && total > 100" class="hint">
        匹配到 {{ total }} 人，仅显示前 100 条；请细化关键字。
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { maintenanceAPI } from "@/api/maintenance";

const router = useRouter();
const keyword = ref("");
const loading = ref(false);
const students = ref([]);
const total = ref(0);
const searched = ref(false);

const onSearch = async () => {
  const kw = keyword.value.trim();
  if (!kw) {
    ElMessage.warning("请输入姓名或学号");
    return;
  }
  loading.value = true;
  try {
    const res = await maintenanceAPI.getStudents({ name: kw, limit: 100 });
    const data = res.data || {};
    students.value = data.students || [];
    total.value = data.total || 0;
    searched.value = true;
  } catch (e) {
    // 错误提示由拦截器处理
  } finally {
    loading.value = false;
  }
};

const onClear = () => {
  students.value = [];
  total.value = 0;
  searched.value = false;
};

const goToDetail = (row) => {
  router.push({
    name: "maintenanceStudentGrades",
    params: { studentId: row.user_id },
  });
};
</script>

<style scoped>
.grade-search {
  padding: 20px;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
}

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.hint {
  margin-top: 12px;
  color: var(--el-color-warning);
  font-size: 13px;
}
</style>
