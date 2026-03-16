import dayjs from 'dayjs';

export const formatDate = (
  date: string | number | Date,
  format = 'YYYY-MM-DD',
) => {
  return dayjs(date).format(format);
};

export const getRelativeTime = (date: string | number | Date) => {
  return dayjs(date).fromNow();
};
