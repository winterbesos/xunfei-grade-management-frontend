<template>
  <div class="character-comments-class-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button
              @click="$router.back()"
              :icon="ArrowLeft"
              circle
              style="margin-right: 10px"
            />
            <span>品格评语 - 班级列表</span>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="classes" stripe style="width: 100%">
        <el-table-column
          prop="class_id"
          label="班级ID"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="class_name" label="班级名称" min-width="150" />
        <el-table-column
          prop="student_count"
          label="学生数"
          width="120"
          align="center"
        />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              link
              @click="handleEvaluate(row)"
            >
              <el-icon><Edit /></el-icon>
              评价
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && classes.length === 0"
        description="暂无班级数据"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { teacherAPI } from "@/api/teacher";
import { ElMessage } from "element-plus";
import { Edit, ArrowLeft } from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const classes = ref([]);
const loading = ref(false);
const semesterId = route.params.semesterId;

const fetchClasses = async () => {
  if (!semesterId) return;
  loading.value = true;
  try {
    const response = await teacherAPI.getTeacherClasses();
    if (response.status === 200 && response.data) {
      classes.value = response.data.list || response.data; // Handle potential pagination wrapper
    }
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    ElMessage.error("获取班级列表失败");
  } finally {
    loading.value = false;
  }
};

const handleEvaluate = (row) => {
  router.push({
    name: "TeacherCharacterComments",
    params: {
      classId: row.class_id,
      semesterId: semesterId,
    },
  });
};

onMounted(() => {
  fetchClasses();
});
</script>

<style scoped>
.character-comments-class-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  font-weight: bold;
}
</style>
