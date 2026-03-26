<template>
	<view class="container">
		<!-- Global Background -->
		<view class="global-background"></view>

		<!-- Loading State -->
		<view v-if="loading" class="loading-state">
			<u-loadmore status="loading" loading-text="正在加载中..." iconSize="18" fontSize="16" />
		</view>

		<!-- Content Area -->
		<view class="content-wrapper" v-else>
			<!-- Combined Card -->
			<view class="card main-card">
				<text class="title">{{ detail.title || '加载中...' }}</text>
				<view class="meta-info">
					<view class="meta-item">
						<u-icon name="clock" size="14" color="#9CA3AF"></u-icon>
						<text class="meta-value">{{ formatDate(detail.publishedAt, 'YYYY-MM-DD HH:mm') }}</text>
					</view>
					<view class="meta-divider"></view>
					<view class="meta-item">
						<u-icon name="eye" size="14" color="#9CA3AF"></u-icon>
						<text class="meta-value">{{ detail.viewCount || 0 }}次浏览</text>
					</view>
				</view>

				<view class="giveLike" @click="giveLikeFun">
					<u-icon :name="detail.liked ? 'thumb-up-fill' : 'thumb-up'" color="#2979ff" size="24"></u-icon>
					<text style="margin-left: 6rpx;">{{ detail.likeCount }}人点赞</text>
				</view>

				<view class="tags">
					<text v-for="(tag, index) in getTags(detail.tags)" :key="index" class="tag">{{ tag }}</text>
				</view>

				<view class="card-divider"></view>

				<view class="rich-text-content">
					<!-- #ifdef H5 -->
					<view v-html="processRichText(detail.contentHtml)" v-if="detail.contentHtml"></view>
					<!-- #endif -->
					<!-- #ifndef H5 -->
					<rich-text :nodes="processRichText(detail.contentHtml)" v-if="detail.contentHtml"></rich-text>
					<!-- #endif -->
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import {
	ref
} from 'vue';
import {
	onLoad
} from '@dcloudio/uni-app';
import {
	getIeArticleDetail
} from "@/api/integraEdu.js";
import {
	formatDate
} from "@/utils/formatDate.js";
import uIcon from "uview-plus/components/u-icon/u-icon.vue";
import {
	articleLike
} from '@/api/index.js'

const detail = ref({});
const loading = ref(true);
const articleId = ref('');

onLoad((options) => {
	if (options.id) {
		articleId.value = options.id;
		fetchDetail();
	}
});

// 点赞
const giveLikeFun = async () => {
	const res = await articleLike(detail.value.id);
	if (res.code == 0) {
		close(res, 'res')
		await fetchDetail();

		if (detail.value.liked) {
			uni.showToast({
				title: "点赞成功",
				icon: "success"
			});
		} else {
			uni.showToast({
				title: "取消点赞",
				icon: "success"
			});
		}
	}
}

const fetchDetail = async () => {
	uni.showLoading({
		title: '加载中...'
	});
	try {
		const res = await getIeArticleDetail(articleId.value);
		if (res.code === 0 || res.code === 200) {
			detail.value = res.data;
		}
	} catch (err) {
		console.error("Failed to fetch article detail:", err);
	} finally {
		uni.hideLoading();
		loading.value = false;
	}
};

const getTags = (tagsStr) => {
	if (!tagsStr) return [];
	if (Array.isArray(tagsStr)) return tagsStr;
	return tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t !== '');
};

const processRichText = (html) => {
	if (!html) return '内容加载中...';
	const baseUrl = 'http://192.168.0.121:8080';
	let content = html;

	// 1. 处理图片自适应，并补全路径
	content = content.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, (match, src) => {
		let fullSrc = src.startsWith('/api') ? baseUrl + src : src;
		return `<img src="${fullSrc}" style="max-width:100%;height:auto;display:block;margin:20rpx 0;border-radius:12rpx;" />`;
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
};
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	position: relative;
	padding-bottom: 40rpx;
}

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

.content-wrapper {
	position: relative;
	z-index: 1;
	padding: 30rpx;
}

.card {
	background-color: rgba(255, 255, 255, 0.85);
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 30rpx rgba(0, 0, 0, 0.05);
}

.main-card {
	position: relative;

	.giveLike {
		position: absolute;
		top: 240rpx;
		right: 48rpx;
		display: flex;
		align-items: center;
		color: #999;
		font-size: 28rpx;
	}

	.title {
		font-size: 44rpx;
		font-weight: bold;
		color: #111827;
		line-height: 1.4;
		margin-bottom: 24rpx;
		display: block;
	}

	.meta-info {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.meta-value {
		font-size: 24rpx;
		color: #6B7280;
	}

	.meta-divider {
		width: 2rpx;
		height: 20rpx;
		background-color: #E5E7EB;
		margin: 0 24rpx;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 24rpx;

		.tag {
			background-color: #eff6ff;
			color: #3b82f6;
			font-size: 22rpx;
			padding: 6rpx 20rpx;
			border-radius: 28rpx;
			border: 1rpx solid #dbeafe;
		}
	}

	.card-divider {
		height: 1rpx;
		background-color: #f3f4f6;
		margin-bottom: 20rpx;
	}

	.rich-text-content {
		font-size: 30rpx;
		color: #374151;
		line-height: 1.8;
		text-align: justify;

		:deep(p) {
			margin-bottom: 24rpx;
		}
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