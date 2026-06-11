import { imgBaseUrl } from "@/utils/baseUrl.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FILE_BASE_URL = imgBaseUrl();

const request = (options) => {
	// Special handling for SSE/Chunked requests is removed as per user request to revert to standard request
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync("token");
		const header = {
			...options.header
		};
		if (token) {
			header["Authorization"] = `Bearer ${token}`;
		}

		uni.request({
			url: BASE_URL + options.url,
			method: options.method || "GET",
			data: options.data || {},
			header,
			success: (res) => {
				const dataCode = res.data ? res.data.code : null;
				// Handle 401 or 403 (Unauthorized/Forbidden)
				if (res.statusCode === 401 || res.statusCode === 403 || dataCode === 401 || dataCode === 403) {
					uni.removeStorageSync("token");
					uni.showToast({
						title: "请先登录",
						icon: "none",
					});
					setTimeout(() => {
						uni.reLaunch({
							url: "/pages/login/login",
						});
					}, 800);
					reject(res.data);
					return;
				}

				if (res.statusCode === 200) {
					if (res.data.code === 200 || res.data.code === 0 || typeof res.data === 'string') {
						resolve(res.data);
					} else {
						uni.showToast({
							title: res.data.message || res.data.msg || "请求失败",
							icon: "none",
						});
						reject(res.data);
					}
				} else {
					uni.showToast({
						title: `网络错误 ${res.statusCode}`,
						icon: "none",
					});
					reject(res);
				}
			},
			fail: (err) => {
				uni.showToast({
					title: "请求失败，请检查网络",
					icon: "none",
				});
				reject(err);
			},
		});
	});
};

export default request;
export { FILE_BASE_URL };
