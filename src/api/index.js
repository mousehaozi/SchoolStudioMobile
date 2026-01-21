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
 * 获取工作动态 (仅已发布且启用)
 */
export const getStudioNews = (params) => {
    return request({
        url: "/studio-news",
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
