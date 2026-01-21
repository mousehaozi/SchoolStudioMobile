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
	return "http://192.168.0.121:8080";
}

/**
 * 获取 WebSocket 基础地址
 */
export function wsBaseUrl() {
	return "ws://192.168.0.121:8080/api/v1/ws";
}