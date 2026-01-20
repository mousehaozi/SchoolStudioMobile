import request from "@/utils/http.js";

/**
 * 获取启用的工作室简介
 */
export const getStudioProfile = () => {
    return request({
        url: "/studio-profile/current",
        method: "GET"
    });
};