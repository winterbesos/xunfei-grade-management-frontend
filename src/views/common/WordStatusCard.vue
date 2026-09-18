<template>
  <div class="word-status-card" v-loading="loading">
    <div class="toolbar">
      <el-button type="primary" :disabled="!blob" @click="handleDownload">下载 Word</el-button>
    </div>
    <el-empty v-if="error" :description="error" />
    <div ref="containerRef" class="docx-container" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { renderAsync } from "docx-preview";
import { adminAPI } from "@/api/admin";

const props = defineProps({
  studentId: { type: String, required: true },
});

const containerRef = ref(null);
const loading = ref(false);
const error = ref("");
const blob = ref(null);
const fileName = ref("学籍卡.docx");

const load = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await adminAPI.getStudentStatusCardDocx(props.studentId);
    blob.value = res.data;
    const disposition = res.headers?.["content-disposition"] || "";
    const match = disposition.match(/filename\*?=(?:UTF-8'')?(.+)/i);
    if (match) fileName.value = decodeURIComponent(match[1]);
    await renderAsync(res.data, containerRef.value, null, {
      className: "docx",
      inWrapper: true,
      ignoreLastRenderedPageBreak: true,
    });
  } catch {
    error.value = "学籍卡生成失败";
  } finally {
    loading.value = false;
  }
};

const handleDownload = () => {
  if (!blob.value) return;
  const url = URL.createObjectURL(blob.value);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.value;
  a.click();
  URL.revokeObjectURL(url);
};

onMounted(load);
</script>

<style scoped>
.word-status-card {
  width: 100%;
  min-height: 300px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.docx-container {
  max-height: 75vh;
  overflow: auto;
}

.docx-container :deep(.docx-wrapper) {
  padding: 16px;
  background: #f0f2f5;
}
</style>
