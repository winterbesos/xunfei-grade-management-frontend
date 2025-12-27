export function transformGradeTrendData(dataList) {
  if (!Array.isArray(dataList) || dataList.length === 0) {
    return { semesters: [], subjects: [], series: [] };
  }

  // 1. 提取所有唯一的学期，并排序
  // 假设 semester_id 是可以排序的字符串/数字，或者列表已经是排好序的
  // 这里我们建立一个 Map: semester_id -> semester_name
  const semesterMap = new Map();
  const subjectSet = new Set();

  // 用于快速查找成绩: `${semester_id}_${subject_name}` -> score
  const scoreMap = new Map();
  const dataMap = new Map();

  dataList.forEach((item) => {
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

  // 生成排好序的 semester_id 列表 (假设 id 越大越新，或者字典序)
  // 如果后端返回的就是时间顺序，可以直接用 Array.from(semesterMap.keys())
  // 这里简单的按 id 排序
  const sortedSemesterIds = Array.from(semesterMap.keys()).sort();
  const semesters = sortedSemesterIds.map((id) => semesterMap.get(id));

  // 2. 生成 Subjects 列表
  const subjects = Array.from(subjectSet);

  // 3. 构建 Series
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

  // 4. 构建 datas
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
