<template>
  <div class="elective-subject-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="goBack">
              <el-icon><ArrowLeft /></el-icon> 返回
            </el-button>
            <span style="margin-left: 10px"
              >选修科目列表 - {{ semesterName }}</span
            >
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="electiveSubjects"
        stripe
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="name" label="科目名称" min-width="150" />
        <!-- 暂时没有 is_scoring 字段，假设都可以查看/打分 -->
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleViewStudents(row)"
            >
              进入录入
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && electiveSubjects.length === 0"
        description="该学期暂无选修科目"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const electiveSubjects = ref([]);
const semesterName = ref(route.query.semesterName || "");

const loadElectiveSubjects = async () => {
  loading.value = true;
  try {
    const response = await teacherAPI.getElectiveSubjects({
      semester_id: route.params.semesterId,
    });
    if (response.status === 200) {
      electiveSubjects.value = response.data;
    }
  } catch (error) {
    ElMessage.error("加载选修科目列表失败");
  } finally {
    loading.value = false;
  }
};

const handleViewStudents = (row) => {
  router.push({
    name: "TeacherElectiveGradeEntry",
    params: {
      semesterId: route.params.semesterId,
      electiveSubjectId: row.id, // Assuming row.id is the elective subject ID
    },
    query: {
      subjectName: row.name,
      semesterName: semesterName.value,
    },
  });
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadElectiveSubjects();
});
</script>

<style scoped>
.elective-subject-list {
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
}
</style>
