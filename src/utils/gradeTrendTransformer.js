export function transformGradeTrendData(dataList) {
  if (!Array.isArray(dataList) || dataList.length === 0) {
    return { semesters: [], subjects: [], series: [] };
  }

  // 1. 按照 createTime 排序，确保后续处理是按时间顺序的
  // 兼容 createTime, create_time, created_at 等属性名
  const sortedDataList = [...dataList].sort((a, b) => {
    const timeA = new Date(
      a.createTime || a.create_time || a.created_at || 0,
    ).getTime();
    const timeB = new Date(
      b.createTime || b.create_time || b.created_at || 0,
    ).getTime();
    return timeA - timeB;
  });

  // 2. 提取学期和科目
  // 使用 Map 保持插入顺序，这样学期就是按时间顺序排列的
  const semesterMap = new Map();
  const subjectSet = new Set();

  // 用于快速查找成绩: `${semester_id}_${subject_name}` -> score
  const scoreMap = new Map();
  const dataMap = new Map();

  sortedDataList.forEach((item) => {
    if (!semesterMap.has(item.exam_id)) {
      semesterMap.set(item.exam_id, item.exam_name);
    }
    subjectSet.add(item.subject_name);

    // 解析分数为数字
    const scoreVal = parseFloat(item.score);
    // 只有有效数字才存入，或者保留 null
    if (!isNaN(scoreVal)) {
      scoreMap.set(`${item.exam_id}_${item.subject_name}`, scoreVal);
      dataMap.set(`${item.exam_id}_${item.subject_name}`, item);
    }
  });

  // 学期列表，保持时间顺序
  const sortedSemesterIds = Array.from(semesterMap.keys());
  const semesters = sortedSemesterIds.map((id) => semesterMap.get(id));

  // 3. 生成 Subjects 列表
  const subjects = Array.from(subjectSet);

  // 4. 构建 Series (用于图表展示)
  const series = subjects.map((subject) => {
    const data = sortedSemesterIds.map((semId) => {
      const key = `${semId}_${subject}`;
      return scoreMap.has(key) ? scoreMap.get(key) : null;
    });

    return {
      name: subject,
      data: data,
    };
  });

  // 5. 构建 datas (包含原始 item 对象的列表)
  // 这里的数据也会按照学期（即 createTime）的顺序排列
  const datas = subjects.map((subject) => {
    const data = sortedSemesterIds.map((semId) => {
      const key = `${semId}_${subject}`;
      return dataMap.has(key) ? dataMap.get(key) : null;
    });

    return {
      name: subject,
      data: data,
    };
  });

  return {
    semesters,
    subjects,
    series,
    datas,
  };
}
