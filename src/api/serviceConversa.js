import request from "@/utils/http.js";

/**
 * 确保会话存在
 * @param {string|number} sessionId 可选
 */
export const ensureSession = (sessionId) => {
    return request({
        url: `/chat-session/ensure${sessionId ? '?sessionId=' + sessionId : ''}`,
        method: "POST"
    });
};

/**
 * 获取会话列表
 */
export const getSessionList = (params) => {
    return request({
        url: "/chat-session",
        method: "GET",
        data: params
    });
};

/**
 * 获取会话消息列表
 */
export const getSessionMessages = (sessionId, params) => {
    return request({
        url: `/chat-session/${sessionId}/messages`,
        method: "GET",
        data: params
    });
};

/**
 * 发送消息
 */
export const sendChatMessage = (data) => {
    return request({
        url: "/chat-message",
        method: "POST",
        data
    });
};

/**
 * 标记会话已读
 */
export const markSessionRead = (sessionId) => {
    return request({
        url: `/chat-session/${sessionId}/read`,
        method: "POST"
    });
};

/**
 * 关闭会话
 */
export const closeSession = (sessionId) => {
    return request({
        url: `/chat-session/${sessionId}/close`,
        method: "POST"
    });
};
