<template>
  <div class="grade-trend-container">
    <!-- 过滤条件 -->
    <div class="filter-container">
      <span class="label">科目筛选：</span>
      <el-select
        v-model="selectedSubject"
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import * as echarts from "echarts";
import { studentAPI } from "@/api/student";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";
import { transformGradeTrendData } from "@/utils/gradeTrendTransformer";

const props = defineProps({
  studentId: {
    type: [String, Number],
    default: null,
  },
});

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
    // 优先从 prop 获取 studentId，否则使用当前登录用户ID
    const targetStudentId = props.studentId;

    var promise;
    if (!targetStudentId) {
      promise = studentAPI.getMyOriginGradeTrend();
    } else {
      promise = studentAPI.getOriginGradeTrend(targetStudentId);
    }

    const res = await promise;
    if (res.status === 200) {
      // 转换后端返回的 list 数据为图表所需格式
      const transformedData = transformGradeTrendData(res.data);
      trendData.value = transformedData;
      subjects.value = transformedData.subjects;
      selectedSubject.value =
        subjects.value.length > 0 ? subjects.value[0] : "";
      initChart();
    }
  } catch (error) {
    console.error("Failed to load grade trend:", error);
    ElMessage.error("加载成绩趋势失败");
  }
};

const initChart = async () => {
  await nextTick();
  if (!chartRef.value) return;

  // Dispose existing instance if any
  if (myChart) {
    myChart.dispose();
  }

  myChart = echarts.init(chartRef.value);
  updateChart();

  // 确保图表渲染
  myChart.resize();
};

const handleResize = () => {
  myChart && myChart.resize();
};

const computeMaxStandardScore = (subjectDatas) => {
  const items = subjectDatas.map((s) => s.data).flat();
  const standardScores = items.map((s) => parseInt(s.standard_score));
  return Math.max(...standardScores, 100);
};

const updateChart = () => {
  if (!myChart || !trendData.value.semesters) return;

  const { semesters, series, datas } = trendData.value;

  // Filter series based on selection
  const filteredSeries = selectedSubject.value
    ? series.filter((s) => s.name === selectedSubject.value)
    : series;

  const filteredDatas = selectedSubject.value
    ? datas.filter((s) => s.name === selectedSubject.value)
    : datas;

  const maxStandardScore = computeMaxStandardScore(filteredDatas);

  const option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: filteredSeries.map((s) => s.name),
      bottom: 0,
    },
    grid: {
      left: "6%",
      right: "6%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: semesters,
      axisLabel: {
        interval: 0,
        formatter: function (value) {
          return value.length > 10
            ? value.slice(0, 10) + "\n" + value.slice(10)
            : value;
        },
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: maxStandardScore,
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

  myChart.setOption(option, true);
};

// 监听 studentId 变化
watch(
  () => props.studentId,
  (newVal) => {
    if (newVal) {
      loadData();
    }
  },
);

onMounted(() => {
  loadData();
  window.addEventListener("resize", handleResize);
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
  width: 100%;
  padding: 10px;
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
  height: 400px; /* 稍微调小一点，适应弹窗 */
}
</style>
