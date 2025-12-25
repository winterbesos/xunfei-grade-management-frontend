<template>
  <div class="semester-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学期管理 - 系统维护</span>
        </div>
      </template>

      <!-- 统计信息 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :span="6">
          <el-statistic title="总学期数" :value="statistics.totalSemesters" />
        </el-col>
        <el-col :span="6">
          <el-statistic
            title="进行中学期"
            :value="statistics.activeSemesters"
          />
        </el-col>
        <el-col :span="6">
          <el-statistic
            title="未开始学期"
            :value="statistics.upcomingSemesters"
          />
        </el-col>
        <el-col :span="6">
          <el-statistic
            title="已结束学期"
            :value="statistics.finishedSemesters"
          />
        </el-col>
      </el-row>

      <!-- 学期列表 -->
      <el-table
        v-loading="loading"
        :data="semesters"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column
          prop="semester_id"
          label="学期ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column
          prop="semester_name"
          label="学期名称"
          min-width="150"
        />
        <el-table-column
          prop="school_id"
          label="学校ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="school_name" label="学校名称" min-width="120" />
        <el-table-column prop="begin_time" label="开始时间" width="200" />
        <el-table-column prop="end_time" label="结束时间" width="200" />
      </el-table>

      <el-empty
        v-if="!loading && semesters.length === 0"
        description="暂无学期数据"
      />
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="dialogVisible" title="学期详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="学期ID">{{
          currentSemester.id
        }}</el-descriptions-item>
        <el-descriptions-item label="学期名称">{{
          currentSemester.name
        }}</el-descriptions-item>
        <el-descriptions-item label="学校ID">{{
          currentSemester.schoolId
        }}</el-descriptions-item>
        <el-descriptions-item label="学校名称">{{
          currentSemester.schoolName
        }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentSemester.status)">
            {{ getStatusText(currentSemester.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          currentSemester.createdAt || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{
          currentSemester.remark || "-"
        }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { maintenanceAPI } from "@/api/maintenance";
import { formatDate } from "@/utils/date";

const loading = ref(false);
const semesters = ref([]);
const schools = ref([]);
const dialogVisible = ref(false);
const currentSemester = ref({});

// 统计信息
const statistics = computed(() => {
  const allSemesters = semesters.value;
  return {
    totalSemesters: allSemesters.length,
    activeSemesters: allSemesters.filter((s) => s.status === "active").length,
    upcomingSemesters: allSemesters.filter((s) => s.status === "upcoming")
      .length,
    finishedSemesters: allSemesters.filter((s) => s.status === "finished")
      .length,
  };
});

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    upcoming: "info",
    active: "success",
    finished: "warning",
  };
  return types[status] || "info";
};

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    upcoming: "未开始",
    active: "进行中",
    finished: "已结束",
  };
  return texts[status] || "未知";
};

// 加载学校列表
const loadSchools = async () => {
  try {
    const response = await maintenanceAPI.getSchools();
    if (response.status === 200) {
      schools.value = response.data.schools || response.data;
    }
  } catch (error) {
    ElMessage.error("加载学校列表失败");
  }
};

// 加载学期列表
const loadSemesters = async () => {
  loading.value = true;
  try {
    const response = await maintenanceAPI.getMaintenanceSemesters();
    if (response.status === 200) {
      semesters.value = response.data;

      // 处理学校名称显示
      semesters.value.forEach((semester) => {
        const school = schools.value.find((s) => s.id === semester.schoolId);
        if (school && !semester.schoolName) {
          semester.schoolName = school.schoolName || school.name;
        }
      });
    }
  } catch (error) {
    ElMessage.error("加载学期列表失败");
  } finally {
    loading.value = false;
  }
};

// 查询
const handleQuery = () => {
  loadSemesters();
};

// 重置查询条件
const handleReset = () => {
  queryForm.schoolId = null;
  queryForm.name = "";
  queryForm.status = null;
  handleQuery();
};

onMounted(async () => {
  await loadSchools();
  await loadSemesters();
});
</script>

<style scoped>
.semester-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
