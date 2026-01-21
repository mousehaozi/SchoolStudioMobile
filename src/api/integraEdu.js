import request from "@/utils/http.js";

/**
 * 获取文章列表
 * @param {Object} params { page, size, topicId, keyword, tags }
 */
export const getIeArticle = (params) => {
    return request({
        url: "/ie-article",
        method: "GET",
        data: params
    });
};
/**
 * 文章详情
 */
export const getIeArticleDetail = (id) => {
    return request({
        url: `/ie-article/${id}`,
        method: "GET",
    });
};
