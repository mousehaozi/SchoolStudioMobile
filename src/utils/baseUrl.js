const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "/api";
const RESOURCE_BASE_URL = import.meta.env.VITE_RESOURCE_BASE_URL || "/api";

const ABSOLUTE_URL_RE = /^(?:https?:)?\/\//i;
const SPECIAL_URL_RE = /^(?:data:|blob:|file:|wxfile:|uniapp:)/i;

const joinUrl = (base, path = "") => {
	const normalizedBase = String(base || "").replace(/\/+$/, "");
	const normalizedPath = String(path || "").replace(/^\/+/, "");
	return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase;
};

/**
 * 获取 API 基础地址
 */
export function baseUrl() {
	return API_BASE_URL;
}

/**
 * 获取图片基础地址，保留旧名称兼容现有调用
 */
export function imgBaseUrl() {
	return RESOURCE_BASE_URL;
}

/**
 * 获取 WebSocket 地址
 */
export function wsBaseUrl(path = "/ws") {
	const url = joinUrl(WS_BASE_URL, path);
	if (/^wss?:\/\//i.test(url)) return url;
	if (/^https?:\/\//i.test(url)) return url.replace(/^http/i, "ws");

	// #ifdef H5
	const protocol = location.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${location.host}${url.startsWith("/") ? url : `/${url}`}`;
	// #endif

	// #ifndef H5
	return url;
	// #endif
}

/**
 * 补全图片、文件等资源地址，仅用于前端展示
 */
export function getResourceUrl(url) {
	if (!url || typeof url !== "string") return url;
	if (SPECIAL_URL_RE.test(url)) return url;

	let normalizedUrl = url;
	if (ABSOLUTE_URL_RE.test(url)) {
		const fileUrlMatch = url.match(
			/^(?:https?:)?\/\/[^/]+(\/(?:api\/v1\/files|files)\/[^?#]*)([?#].*)?$/i
		);
		if (!fileUrlMatch) return url;
		normalizedUrl = `${fileUrlMatch[1]}${fileUrlMatch[2] || ""}`;
	}

	const filePathMatch = normalizedUrl.match(
		/(?:^|\/)((?:api\/v1\/files|files)\/[^?#]*)([?#].*)?$/i
	);
	if (filePathMatch) {
		normalizedUrl = `/${filePathMatch[1]}${filePathMatch[2] || ""}`;
	}

	if (url.startsWith("/static/")) return url;

	const base = RESOURCE_BASE_URL.replace(/\/+$/, "");
	const path = normalizedUrl.startsWith("/") ? normalizedUrl : `/${normalizedUrl}`;
	const baseMatch = base.match(/^(https?:\/\/[^/]+)(\/.*)?$/i);
	const baseOrigin = baseMatch ? baseMatch[1] : "";
	const basePath = baseMatch ? (baseMatch[2] || "") : base;

	if (basePath !== "/api" && basePath.endsWith("/api") && /^\/api(?:\/|$)/.test(path)) {
		return `${baseOrigin}${basePath}${path.slice(4)}`;
	}

	if (/^\/api(?:\/|$)/.test(basePath) && /^\/api(?:\/|$)/.test(path)) {
		return `${baseOrigin}${path}`;
	}

	return `${base}${path}`;
}

/**
 * 微信图片使用 HTTPS，避免在 HTTPS 页面上被浏览器拦截
 */
export function getNewsImageUrl(url) {
	const resourceUrl = getResourceUrl(url);
	return typeof resourceUrl === "string"
		? resourceUrl.replace(/^http:\/\/([^/]*\.(?:qpic|qlogo)\.cn)(?=\/|$)/i, "https://$1")
		: resourceUrl;
}

/**
 * 补全富文本中的图片、视频和 source 资源地址
 */
export function getResourceHtml(html) {
	if (!html || typeof html !== "string") return html;

	return html.replace(
		/<(?:img|video|source)\b[^>]*\bsrc=(["'])(.*?)\1[^>]*>/gi,
		(match, quote, src) => match.replace(src, getResourceUrl(src))
	);
}
