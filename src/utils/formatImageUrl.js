import { imgBaseUrl } from "./baseUrl.js";

/**
 * 格式化图片地址
 * @param {string} url 原始地址
 * @returns {string} 完整地址
 */
export const formatImageUrl = (url) => {
    if (!url) return "/static/appLogo.png";
    if (url.startsWith("http")) return url;
    return imgBaseUrl() + url;
};
