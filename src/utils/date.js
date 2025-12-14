import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const formatUtcToLocal = (date, fmt = "YYYY-MM-DD HH:mm:ss") =>
  date ? dayjs.utc(date).local().format(fmt) : "";

export const formatDate = (date, format = "YYYY-MM-DD HH:mm:ss") => {
  if (!date) return "";
  return dayjs.utc(date).local().format(format);
};

export const toISODate = (date) =>
  date ? dayjs(date).utc().toISOString() : null;
