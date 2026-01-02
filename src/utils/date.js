import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const formatDate = (date, format = "YYYY-MM-DD HH:mm:ss") => {
  if (!date) return "";
  return dayjs.utc(date).local().format(format);
};

export const toISODate = (date) =>
  date ? dayjs(date).utc().toISOString() : null;
