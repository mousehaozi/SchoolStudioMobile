// 根据环境切换baseURL，二选一
// H5开发环境，因为配置了反向代理，所以直接用 /api 即可
// const BASE_URL = "/api";
// App/H5打包生产环境，必须写成服务器完整地址
// const BASE_URL = "http://107.174.50.174:5001";
import { baseUrl, imgBaseUrl } from "@/utils/baseUrl.js";

const BASE_URL = baseUrl();
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
				} else if (res.statusCode === 401 || res.statusCode === 403) {
					uni.showToast({
						title: "请先登录",
						icon: "none",
					});
					uni.navigateTo({
						url: "/pages/login/index",
					});
					reject(res);
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
