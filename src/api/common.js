import { baseUrl } from "@/utils/baseUrl.js";

/**
 * 上传图片
 * @param {string} filePath 文件临时路径
 */
export const uploadImage = (filePath) => {
    return new Promise((resolve, reject) => {
        // const token = "eyJhbGciOiJIUzI1NiJ9.waeuF32umRFuxxAHc31ernao5OlLIHc-VCp19xKgQOU";
        const token = uni.getStorageSync("token");
        let uploadUrl = baseUrl() + '/files/image';

        uni.uploadFile({
            url: uploadUrl,
            filePath: filePath,
            name: 'file',
            header: {
                'Authorization': token ? `Bearer ${token}` : ''
            },
            success: (res) => {
                const data = JSON.parse(res.data);
                if (data.code === 200 || data.code === 0) {
                    resolve(data);
                } else {
                    uni.showToast({ title: data.message || '上传失败', icon: 'none' });
                    reject(data);
                }
            },
            fail: (err) => {
                uni.showToast({ title: '网络错误', icon: 'none' });
                reject(err);
            }
        });
    });
};
