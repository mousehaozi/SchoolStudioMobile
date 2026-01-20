import dayjs from 'dayjs';

/**
 * 格式化时间
 * @param {string} dateStr 时间字符串
 * @param {string} format 格式化模板，默认 YYYY-MM-DD HH:mm:ss
 */
export const formatDate = (dateStr, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!dateStr) return "---";
    return dayjs(dateStr).format(format);
};
