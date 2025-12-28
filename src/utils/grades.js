export function formatReportGrade(grade, type) {
  if (grade === null || grade === undefined) {
    return "";
  }

  if (type === "1") {
    return grade;
  }

  if (type === "2") {
    if (grade >= 90) return "优秀";
    if (grade >= 80) return "良好";
    if (grade >= 70) return "中等";
    if (grade >= 60) return "及格";
    return "不及格";
  }

  if (type === "3") {
    if (grade >= 60) return "及格";
    return "不及格";
  }

  return grade;
}

export function formatProofGrade(grade, type) {
  if (grade === null || grade === undefined) {
    return "—";
  }

  if (type === "1") {
    return grade;
  }

  if (type === "2") {
    if (grade >= 90) return "优";
    if (grade >= 80) return "良";
    if (grade >= 70) return "中";
    if (grade >= 60) return "及格";
    return "差";
  }

  if (type === "3") {
    if (grade >= 60) return "及格";
    return "不及格";
  }

  return grade;
}
