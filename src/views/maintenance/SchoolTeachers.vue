<template>
  <div class="school-teachers">
    <div class="page-header" v-if="!props.embedded">
      <el-page-header @back="goBack">
        <template #content>
          <span class="text-large font-600 mr-3"> 学校教师列表 </span>
        </template>
      </el-page-header>
    </div>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>教师列表</span>
          <div class="header-actions">
            <el-input
              v-model="queryParams.keyword"
              placeholder="搜索教师姓名"
              style="width: 200px; margin-right: 10px"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="teacherList"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column
          prop="user_id"
          label="教师ID"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="name" label="姓名" width="150" />
        <el-table-column label="教授科目" min-width="200">
          <template #default="{ row }">
            <div v-if="row.subjects && row.subjects.length">
              <el-tag
                v-for="(subject, index) in row.subjects"
                :key="index"
                size="small"
                class="subject-tag"
                :type="index % 2 === 0 ? 'primary' : 'success'"
              >
                {{ subject.year_name }}-{{ subject.subject_name }}
              </el-tag>
            </div>
            <span v-else>无</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { maintenanceAPI } from "@/api/maintenance";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
  schoolId: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const router = useRouter();
const currentSchoolId = computed(() => props.schoolId || route.params.schoolId);

const loading = ref(false);
const teacherList = ref([]);
const total = ref(0);

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: "",
});

const goBack = () => {
  router.back();
};

const fetchTeachers = async () => {
  loading.value = true;
  try {
    const res = await maintenanceAPI.getSchoolTeachers(currentSchoolId.value, {
      page: queryParams.page,
      limit: queryParams.pageSize,
      keyword: queryParams.keyword,
    });
    if (res.status === 200) {
      // Assuming response structure
      const data = res.data;
      if (Array.isArray(data)) {
        teacherList.value = data;
        total.value = data.length;
      } else {
        teacherList.value = data.teachers || data.items || [];
        total.value = data.total || teacherList.value.length;
      }
    }
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    ElMessage.error("获取教师列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.page = 1;
  fetchTeachers();
};

const handleSizeChange = (val) => {
  queryParams.pageSize = val;
  fetchTeachers();
};

const handleCurrentChange = (val) => {
  queryParams.page = val;
  fetchTeachers();
};

onMounted(() => {
  if (currentSchoolId.value) {
    fetchTeachers();
  } else {
    ElMessage.error("缺少学校ID参数");
  }
});
</script>

<style scoped>
.school-teachers {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.subject-tag {
  margin-right: 5px; /* Add some space between tags */
  margin-bottom: 5px; /* If tags wrap to next line, add space */
}
</style>
