<template>
	<view class="container">
		<!-- Global Background -->
		<view class="global-background"></view>

		<!-- Loading State -->
		<view v-if="loading" class="loading-state">
			<u-loadmore status="loading" loading-text="正在加载中..." iconSize="18" fontSize="16" />
		</view>

		<view class="content-card" v-else>
			<!-- Title Section -->
			<view class="header-section">
				<text class="main-title">{{ detailData.title || "加载中..." }}</text>

				<view class="meta-info">
					<view class="meta-item">
						<text class="meta-label">发布：</text>
						<text class="meta-value">{{ detailData.author || "暂无" }}</text>
					</view>
					<view class="meta-divider"></view>
					<view class="meta-item">
						<u-icon name="clock" size="14" color="#9CA3AF"></u-icon>
						<text class="meta-value">{{
							formatDate(detailData.publishedAt) || "---"
						}}</text>
					</view>
				</view>

				<view class="article-views">
					<u-icon name="eye" size="12" color="#999"></u-icon>
					<text class="view-count">{{ detailData.viewCount || 0 }}次浏览</text>
				</view>

				<!-- Tags Section -->
				<view class="tags-section">
					<view class="tag blue-tag" v-for="(tag, index) in getTags(detailData.tags)" :key="index">
						{{ tag }}
					</view>
				</view>

				<view class="giveLike" @click="giveLikeFun">
					<u-icon :name="detailData.liked ? 'thumb-up-fill' : 'thumb-up'" color="#2979ff" size="24"></u-icon>
					<text style="margin-left: 6rpx;">{{ detailData.likeCount }}人点赞</text>
				</view>

				<view class="card-divider header-divider"></view>
			</view>

			<view class="card-divider"></view>

			<!-- Content Section -->
			<view class="article-body">
				<!-- #ifdef H5 -->
				<div v-html="processRichText(detailData.contentHtml)" v-if="detailData.contentHtml"></div>
				<!-- #endif -->
				<!-- #ifndef H5 -->
				<rich-text :nodes="processRichText(detailData.contentHtml)" v-if="detailData.contentHtml"></rich-text>
				<!-- #endif -->
			</view>

			<!-- Footer Info -->
			<view class="footer-section">
				<view class="share-box">
					<text class="share-title">分享至</text>
					<view class="share-icons">
						<view class="share-icon-btn" @click="handleShare">
							<u-icon name="weixin-fill" size="24" color="#07C160"></u-icon>
						</view>
						<view class="share-icon-btn" @click="handleShare">
							<u-icon name="moments" size="24" color="#07C160"></u-icon>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="share-guide" v-if="showGuide" @click="showGuide = false">
			<view class="guide-content">
				<view class="guide-arrow">⤴</view>
				<text class="guide-text">点击右上角更多按钮</text>
				<text class="guide-text">分享给好友或朋友圈</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import uIcon from "uview-plus/components/u-icon/u-icon.vue";
import { formatDate } from "@/utils/formatDate.js";
import { getStudioNewsDetail, studioNewsLike } from "@/api/index.js";

const detailData = ref({});
const loading = ref(true);
const shareImage = ref(window.location.origin + "/static/appLogo.png");

// 提取富文本中的第一张图片
const extractFirstImg = (html) => {
	const defaultLogo = window.location.origin + "/static/appLogo.png";
	if (!html) return defaultLogo;
	const imgReg = /<img.*?(?:>|\/>)/gi;
	const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
	const arr = html.match(imgReg);
	if (arr && arr.length > 0) {
		const src = arr[0].match(srcReg);
		if (src && src[1]) {
			let url = src[1];
			// 如果是相对路径，补全域名
			if (url.startsWith("/")) {
				return window.location.origin + url;
			}
			return url;
		}
	}
	return defaultLogo;
};

// 点赞
const giveLikeFun = async () => {
	console.log(detailData.value.id, "点赞");
	const res = await studioNewsLike(detailData.value.id);
	if (res.code == 0) {
		await fetchDetail(studioId.value, articleId.value);

		if (detailData.value.liked) {
			uni.showToast({
				title: "点赞成功",
				icon: "success",
			});
		} else {
			uni.showToast({
				title: "取消点赞",
				icon: "success",
			});
		}
	}
};

const getTags = (tagsStr) => {
	if (!tagsStr) return [];
	// Some APIs might return an array already, handle both
	if (Array.isArray(tagsStr)) return tagsStr;
	return tagsStr.split(",");
};

const processRichText = (html) => {
	if (!html) return "";
<<<<<<< HEAD
	return html
		.replace(
			/<img/gi,
			'<img style="max-width:100%;height:auto;display:block;"'
		)
		.replace(
			/<video/gi,
			'<video style="width:100%;height:auto;display:block;"'
		);
=======
	const baseUrl = 'http://192.168.0.121:8080';
	let content = html;

	// 1. 处理图片自适应，并补全路径
	content = content.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, (match, src) => {
		let fullSrc = src.startsWith('/api') ? baseUrl + src : src;
		return `<img src="${fullSrc}" style="max-width:100%;height:auto;display:block;margin:10px 0;" />`;
	});

	// 2. 匹配并重写视频标签 (支持跨行匹配，并补全路径)
	const videoRegex = /<video[^>]*>[\s\S]*?<source[^>]*src=["']([^"']*)["'][^>]*>[\s\S]*?<\/video>/gi;
	content = content.replace(videoRegex, (match, src) => {
		let fullSrc = src.startsWith('/api') ? baseUrl + src : src;
		return `<video src="${fullSrc}" controls="controls" style="width:100%;height:auto;margin:10px 0;display:block;" poster=""></video>`;
	});

	// 3. 处理没有 source 标签但本身有 video src 的情况
	content = content.replace(/<video[^>]*src=["']([^"']*)["'][^>]*>/gi, (match, src) => {
		let fullSrc = src.startsWith('/api') ? baseUrl + src : src;
		return `<video src="${fullSrc}" controls="controls" style="width:100%;height:auto;margin:10px 0;display:block;" poster=""></video>`;
	});

	return content;
>>>>>>> origin/dev
};

const articleId = ref("");
const studioId = ref("");
const showGuide = ref(false);

const handleShare = () => {
	showGuide.value = true;
};

onLoad((options) => {
	if (options.data) {
		articleId.value = options.data;
		studioId.value = options.studioId || "";
		fetchDetail(studioId.value, options.data);
	}
});

const fetchDetail = async (sId, id) => {
	uni.showLoading({
		title: "加载中...",
	});
	try {
		const res = await getStudioNewsDetail(sId, id);
		if (res.code === 200 || res.code === 0) {
			detailData.value = res.data;
			// 更新分享图片
			shareImage.value = extractFirstImg(res.data.contentHtml);
			// H5环境下动态修改标题，确保微信分享抓取的标题正确
			if (res.data.title) {
				document.title = res.data.title;
			}
		}
	} catch (err) {
		console.error("Fetch news detail failed", err);
		uni.showToast({
			title: "获取详情失败",
			icon: "none",
		});
	} finally {
		uni.hideLoading();
		loading.value = false;
	}
};
</script>

<style lang="scss" scoped>
@font-face {
	font-family: "DingTalk JinBuTi";
	src: url("/static/font/钉钉进步体0111/DingTalk JinBuTi.ttf");
}

.container {
	min-height: 100vh;
	/* background-color: #F5F7FA; */
	padding: 30rpx;
	position: relative;
}

/* Global Background */
.global-background {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-image: url("/static/img/bgImg.png");
	background-size: cover;
	background-repeat: no-repeat;
	opacity: 0.4;
	z-index: 0;
	pointer-events: none;
}

.content-card {
	position: relative;
	z-index: 1;
	background-color: rgba(255, 255, 255, 0.7);
	border-radius: 20rpx;
	padding: 40rpx 0;
	box-shadow: 0 4rpx 30rpx rgba(0, 0, 0, 0.05);
	animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.header-section {
	padding: 0 40rpx;
	margin-bottom: 28rpx;
	position: relative;
}

.main-title {
	font-family: "DingTalk JinBuTi", sans-serif;
	font-size: 44rpx;
	font-weight: bold;
	color: #111827;
	line-height: 1.4;
	margin-bottom: 12rpx;
	display: block;
}

.meta-info {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	margin-bottom: 16rpx;
	gap: 0;
}

.article-views {
	display: flex;
	align-items: center;
	gap: 6rpx;
	margin-bottom: 16rpx;

	.view-count {
		font-size: 22rpx;
		color: #999;
		margin-top: -6rpx;
	}
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.meta-label {
	font-size: 24rpx;
	color: #9ca3af;
}

.meta-value {
	font-size: 24rpx;
	color: #4b5563;
}

.meta-divider {
	width: 2rpx;
	height: 20rpx;
	background-color: #e5e7eb;
	margin: 0 20rpx;
}

.tags-section {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 32rpx;
}

.giveLike {
	position: absolute;
	bottom: 38rpx;
	right: 48rpx;
	display: flex;
	align-items: center;
	color: #999;
	font-size: 28rpx;
}

.tag {
	font-size: 22rpx;
	padding: 6rpx 20rpx;
	border-radius: 100rpx;
	font-weight: 500;
}

.blue-tag {
	background-color: #eff6ff;
	color: #3b82f6;
	border: 1rpx solid #dbeafe;
}

.card-divider {
	height: 1rpx;
	background-color: #f3f4f6;
}

.header-divider {
	margin: 16rpx 0 0 0;
}

.article-body {
	padding: 0 40rpx;
}

.paragraph {
	font-size: 30rpx;
	color: #374151;
	line-height: 1.8;
	margin-bottom: 32rpx;
	text-align: justify;
}

.lead {
	font-weight: 500;
	color: #111827;
	font-size: 32rpx;
}

.quote-block {
	background-color: #f9fafb;
	border-left: 8rpx solid #3b82f6;
	padding: 30rpx;
	margin: 40rpx 0;
	font-style: italic;
	color: #4b5563;
	font-size: 28rpx;
	border-radius: 0 12rpx 12rpx 0;
}

.image-wrapper {
	margin: 48rpx 0;
	border-radius: 16rpx;
	overflow: hidden;
	background-color: #f3f4f6;
}

.article-image {
	width: 100%;
	display: block;
}

.image-caption {
	display: block;
	text-align: center;
	font-size: 24rpx;
	color: #9ca3af;
	padding: 16rpx 0;
	background-color: #f9fafb;
}

.footer-section {
	margin-top: 60rpx;
	padding: 0 40rpx;
}

.info-shelf {
	background-color: #f8fafc;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 40rpx;
}

.shelf-item {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.icon-box {
	width: 80rpx;
	height: 80rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.shelf-content {
	display: flex;
	flex-direction: column;
}

.shelf-label {
	font-size: 22rpx;
	color: #9ca3af;
	margin-bottom: 4rpx;
}

.shelf-value {
	font-size: 26rpx;
	color: #1f2937;
	font-weight: 500;
}

.share-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 24rpx;
	padding-top: 20rpx;
}

.share-title {
	font-size: 24rpx;
	color: #9ca3af;
	position: relative;

	&::before,
	&::after {
		content: "";
		position: absolute;
		top: 50%;
		width: 60rpx;
		height: 1rpx;
		background-color: #e5e7eb;
	}

	&::before {
		left: -80rpx;
	}

	&::after {
		right: -80rpx;
	}
}

.share-icons {
	display: flex;
	gap: 40rpx;
}

.share-icon-btn {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	border: 1rpx solid #f3f4f6;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #ffffff;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.share-guide {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.85);
	z-index: 9999;
	display: flex;
	justify-content: flex-end;
	padding-right: 60rpx;
	padding-top: 40rpx;
}

.guide-content {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.guide-arrow {
	font-size: 100rpx;
	color: #fff;
	margin-bottom: 20rpx;
	animation: bounce 1s infinite alternate;
}

.guide-text {
	color: #fff;
	font-size: 34rpx;
	font-weight: 500;
	line-height: 1.6;
	text-align: right;
}

@keyframes bounce {
	from {
		transform: translateY(0);
	}

	to {
		transform: translateY(-20rpx);
	}
}

.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding-top: 320rpx;
	gap: 20rpx;
}
</style>
```
