import request from "@/utils/http.js";

/**
 * 获取首页轮播图
 */
export const getStudioBanners = () => {
    return request({
        url: "/studio-banner",
        method: "GET",
    });
};

/**
 * 获取具体工作室下的工作动态 (仅已发布且启用)
 */
export const getStudioNews = (studioId, params) => {
    return request({
        url: `/studios/${studioId}/news`,
        method: "GET",
        data: params
    });
};

/**
 * 微信公众号登录
 */
export const wechatLogin = (code) => {
    return request({
        url: "/auth/login/wechat-oa",
        method: "POST",
        data: {
            code
        },
    });
};

/**
 * 获取个人信息
 */
export const getUserProfile = () => {
    return request({
        url: "/user/profile",
        method: "GET",
    });
};

/**
 * 获取主题列表
 */
export const getIeTopic = () => {
    return request({
        url: "/ie-topic",
        method: "GET",
    });
};
/**
 * 获取具体工作室下的工作动态详情
 */
export const getStudioNewsDetail = (studioId, id) => {
    return request({
        url: `/studios/${studioId}/news/${id}`,
        method: "GET",
    });
};

/**
 * 动态点赞
 */
export const studioNewsLike = (newsId) => {
    return request({
        url: `/studio-news-like/${newsId}/toggle`,
        method: "POST",
    });
};

/**
 * 文章点赞
 */
export const articleLike = (articleId) => {
    return request({
        url: `/ie-article-like/${articleId}/toggle`,
        method: "POST",
    });
};

/**
 * 获取工作室列表
 */
export const getStudios = () => {
    return request({
        url: "/studios",
        method: "GET",
    });
};

/**
 * 获取指定工作室简介
 */
export const getStudioIntro = (studioId, id) => {
    return request({
        url: `/studios/${studioId}/news/${id}`,
        method: "GET",
    });
};

/**
 * 获取指定工作室简介
 */
export const getStudioProfileById = (studioId) => {
    return request({
        url: `/studios/${studioId}/profile`,
        method: "GET",
    });
};

/**
 * 获取简介图文列表
 */
export const getStudioIntroArticles = (studioId) => {
    return request({
        url: `/studios/${studioId}/intro-articles`,
        method: "GET",
    });
};

/**
 * 获取简介图文详情
 */
export const getStudioIntroArticleDetail = (studioId, id) => {
    return request({
        url: `/studios/${studioId}/intro-articles/${id}`,
        method: "GET",
    });
};
