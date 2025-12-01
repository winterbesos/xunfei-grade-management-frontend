<template>
  <div class="grade-trend-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学生成绩历史趋势</span>
          <!-- 暂时只针对当前登录用户或传入的studentId，如果是教师查看，可能需要传入ID -->
        </div>
      </template>

      <!-- 过滤条件 -->
      <div class="filter-container">
        <span class="label">科目筛选：</span>
        <el-select
          v-model="selectedSubject"
          placeholder="全部科目"
          clearable
          style="width: 200px"
          @change="updateChart"
        >
          <el-option
            v-for="subject in subjects"
            :key="subject"
            :label="subject"
            :value="subject"
          />
        </el-select>
      </div>

      <!-- 图表容器 -->
      <div ref="chartRef" class="chart-container"></div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import * as echarts from "echarts";
import { studentAPI } from "@/api/student";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";
import { transformGradeTrendData } from "@/utils/gradeTrendTransformer";

const route = useRoute();
const authStore = useAuthStore();
const chartRef = ref(null);
let myChart = null;

const subjects = ref([]);
const selectedSubject = ref("");
const trendData = ref({
  semesters: [],
  subjects: [],
  series: [],
});

const loadData = async () => {
  try {
    // 优先从路由参数获取 studentId (针对教师/管理员查看)，否则使用当前登录用户ID
    const studentId = route.query.studentId || authStore.userInfo.id;
    if (!studentId) {
      ElMessage.warning("未找到学生信息");
      return;
    }

    const res = await studentAPI.getGradeTrend(studentId);
    if (res.status === 200) {
      // 转换后端返回的 list 数据为图表所需格式
      const transformedData = transformGradeTrendData(res.data);
      trendData.value = transformedData;
      subjects.value = transformedData.subjects;
      initChart();
    }
  } catch (error) {
    console.error("Failed to load grade trend:", error);
    ElMessage.error("加载成绩趋势失败");
  }
};

const initChart = () => {
  if (!chartRef.value) return;
  
  // Dispose existing instance if any
  if (myChart) {
    myChart.dispose();
  }

  myChart = echarts.init(chartRef.value);
  updateChart();

  window.addEventListener("resize", handleResize);
};

const handleResize = () => {
  myChart && myChart.resize();
};

const updateChart = () => {
  if (!myChart || !trendData.value.semesters) return;

  const { semesters, series } = trendData.value;
  
  // Filter series based on selection
  const filteredSeries = selectedSubject.value
    ? series.filter((s) => s.name === selectedSubject.value)
    : series;

  const option = {
    title: {
      text: "成绩趋势图",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: filteredSeries.map((s) => s.name),
      bottom: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: semesters,
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100, // Assuming 100 is max score
    },
    series: filteredSeries.map((item) => ({
      name: item.name,
      type: "line",
      data: item.data,
      smooth: true,
      markPoint: {
        data: [
          { type: "max", name: "Max" },
          { type: "min", name: "Min" },
        ],
      },
    })),
  };

  myChart.setOption(option, true); // true = not merge, clear others
};

onMounted(() => {
  loadData();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped>
.grade-trend-container {
  padding: 20px;
}
.card-header {
  font-weight: bold;
}
.filter-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
.label {
  margin-right: 10px;
  font-size: 14px;
}
.chart-container {
  width: 100%;
  height: 500px;
}
</style>
