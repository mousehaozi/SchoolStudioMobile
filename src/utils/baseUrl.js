/**
 * 获取API基础地址
 */
export function baseUrl() {
	return "/api"; // 加上前缀以触发 Vite 代理
}

/**
 * 获取图片基础地址
 */
export function imgBaseUrl() {
	return "/api";
}

/**
 * 获取 WebSocket 基础地址
 */
export function wsBaseUrl() {
	// #ifdef H5
	return location.origin.replace(/^http/, 'ws') + "/api/ws";
	// #endif
	// #ifndef H5
	return "ws://112.124.23.138:8080/api/v1/ws";
	// #endif
}