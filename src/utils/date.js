import dayjs from 'dayjs';

export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';
  const d = dayjs(date);
  return d.isValid() ? d.format(format) : date;
};
