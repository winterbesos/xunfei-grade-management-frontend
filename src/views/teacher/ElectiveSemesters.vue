<template>
  <div class="elective-semesters">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>选修科目管理 - 可评分学期</span>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="semesters"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column
          prop="semester_name"
          label="学期名称"
          min-width="150"
        />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEnterSemester(row)"
            >
              进入管理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

       <el-empty
        v-if="!loading && semesters.length === 0"
        description="暂无可评分的学期"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import { ElMessage } from "element-plus";

const router = useRouter();
const loading = ref(false);
const semesters = ref([]);

const loadSemesters = async () => {
  loading.value = true;
  try {
    const response = await teacherAPI.getAvailableSemesters();
    if (response.status === 200) {
      semesters.value = response.data;
    }
  } catch (error) {
    ElMessage.error("加载学期列表失败");
  } finally {
    loading.value = false;
  }
};

const handleEnterSemester = (row) => {
  router.push({
    name: "TeacherElectiveSubjectList",
    params: { semesterId: row.semester_id },
    query: { semesterName: row.semester_name }
  });
};

onMounted(() => {
  loadSemesters();
});
</script>

<style scoped>
.elective-semesters {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>