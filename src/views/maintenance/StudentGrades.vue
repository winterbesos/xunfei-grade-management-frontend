<template>
  <div class="student-grades">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button :icon="ArrowLeft" circle @click="goBack" />
            <span class="header-title">学生成绩详情</span>
          </div>
        </div>
      </template>

      <div v-if="bySemester.length === 0 && !loading" class="empty-tip">
        <el-empty description="该学生暂无成绩数据" />
      </div>

      <div v-for="group in bySemester" :key="group.semester_id" class="semester-block">
        <el-divider content-position="left">
          <span class="semester-title">
            {{ group.semester_name }}
          </span>
        </el-divider>
        <el-table :data="group.items" stripe border>
          <el-table-column prop="subject_name" label="科目" min-width="120" />
          <el-table-column prop="usual_score" label="平时分" width="90" />
          <el-table-column prop="midterm_score" label="期中" width="90" />
          <el-table-column prop="finalterm_score" label="期末" width="90" />
          <el-table-column prop="score" label="综合" width="90" />
          <el-table-column prop="grade_level" label="等级" width="80" />
          <el-table-column prop="gpa" label="GPA" width="80" />
          <el-table-column prop="credits" label="学分" width="80" />
          <el-table-column prop="teacher_name" label="录入教师" min-width="100">
            <template #default="{ row }">{{ row.teacher_name || "-" }}</template>
          </el-table-column>
          <el-table-column prop="remarks" label="备注" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">{{ row.remarks || "-" }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { maintenanceAPI } from "@/api/maintenance";

const route = useRoute();
const router = useRouter();
const studentId = route.params.studentId;

const loading = ref(false);
const grades = ref([]);

const bySemester = computed(() => {
  const groups = new Map();
  for (const g of grades.value) {
    const key = g.semester_id || g.term_id || "unknown";
    if (!groups.has(key)) {
      groups.set(key, {
        semester_id: key,
        semester_name: g.semester_name || g.term_name || "未命名学期",
        items: [],
      });
    }
    groups.get(key).items.push(g);
  }
  return [...groups.values()];
});

const goBack = () => router.back();

const fetchGrades = async () => {
  loading.value = true;
  try {
    const res = await maintenanceAPI.getStudentAllGrades(studentId);
    grades.value = res.data || [];
  } catch (e) {
    // 错误提示由拦截器处理
  } finally {
    loading.value = false;
  }
};

onMounted(fetchGrades);
</script>

<style scoped>
.student-grades {
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
  gap: 8px;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
}

.semester-block {
  margin-bottom: 20px;
}

.semester-title {
  font-weight: 600;
  font-size: 15px;
}

.empty-tip {
  padding: 32px 0;
}
</style>
