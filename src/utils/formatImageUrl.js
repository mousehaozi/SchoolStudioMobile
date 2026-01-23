/**
 * 格式化图片地址
 * @param {string} url 原始地址
 * @returns {string} 完整地址
 */
export const formatImageUrl = (url) => {
    if (!url) return "/static/appLogo.png";
    return url;
};
