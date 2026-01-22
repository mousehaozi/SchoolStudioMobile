<template>
	<view class="container">
		<!-- Global Background -->
		<view class="global-background"></view>

		<!-- Search Bar -->
		<view class="search-section">
			<view class="search-wrapper">
				<u-icon name="search" color="#9CA3AF" size="18" class="search-icon-manual"></u-icon>
				<u-search placeholder="请输入搜索内容" v-model="keyword" :show-action="false" shape="round" bg-color="#fff"
					:search-icon="false"></u-search>
			</view>
		</view>

		<!-- News List -->
		<view class="news-list" v-if="dynamics.length > 0">
			<view class="news-item" v-for="(item, index) in dynamics" :key="index" @click="goToDetail(item)">
				<view class="news-image-wrap">
					<image :src="formatImageUrl(item.coverUrl)" class="news-image" mode="aspectFill"></image>
				</view>
				<view class="news-content">
					<view class="title-wrap">
						<text class="news-title">{{ item.title }}</text>
					</view>

					<view class="news-location" v-if="item.location">
						<u-icon name="map-fill" color="#3B82F6" size="14"></u-icon>
						<text class="location-text">{{ item.location }}</text>
					</view>

					<view class="tabs">
						<view class="news-meta">
							<view class="news-tags">
								<text class="tag blue-tag" v-for="(tag, tIndex) in getTags(item.tags)"
									:key="tIndex">{{ tag }}</text>
							</view>
						</view>
						
						<view class="article-views">
							<u-icon name="eye" size="12" color="#999"></u-icon>
							<text class="view-count">{{ item.viewCount || 0 }}次浏览</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- Loading / No More Data -->
		<view class="no-more">
			<text class="no-more-text">{{ noMore ? '没有更多了' : '正在加载中...' }}</text>
			<view class="no-more-line" v-if="noMore"></view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch
	} from 'vue';
	import {
		onShow,
		onReachBottom
	} from '@dcloudio/uni-app';
	import {
		getStudioNews
	} from "@/api/index.js";
	import {
		formatImageUrl
	} from "@/utils/formatImageUrl.js";
	import {
		formatDate
	} from "@/utils/formatDate.js";

	const keyword = ref('');
	const dynamics = ref([]);
	const page = ref(1);
	const size = ref(10);
	const noMore = ref(false);
	const isLoading = ref(false);

	onShow(() => {
		refreshData();
	});

	onReachBottom(() => {
		if (!noMore.value && !isLoading.value) {
			page.value++;
			fetchNews();
		}
	});

	watch(keyword, () => {
		refreshData();
	});

	const refreshData = () => {
		page.value = 1;
		noMore.value = false;
		dynamics.value = [];
		fetchNews();
	};

	const fetchNews = async () => {
		if (isLoading.value) return;
		isLoading.value = true;
		try {
			const res = await getStudioNews({
				page: page.value,
				size: size.value,
				keyword: keyword.value
			});
			if (res.code === 200 || res.code === 0) {
				const records = res.data.records || [];
				if (records.length < size.value) {
					noMore.value = true;
				}
				dynamics.value = [...dynamics.value, ...records];
			}
		} catch (err) {
			console.error("Fetch news failed:", err);
		} finally {
			isLoading.value = false;
		}
	};

	const getTags = (tagsStr) => {
		if (!tagsStr) return [];
		return tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t !== '');
	};

	const goToDetail = (item) => {
		uni.navigateTo({
			url: `/pages/dynamic/compontes/dynamicDetail/dynamicDetail?data=${item.id}`
		});
	};
</script>

<style lang="scss" scoped>
	@font-face {
		font-family: 'DingTalk JinBuTi';
		src: url('/static/font/钉钉进步体0111/DingTalk JinBuTi.ttf');
	}

	.container {
		min-height: 100vh;
		/* background-color: #F5F7FA; Removed to show background image */
		padding: 30rpx;
		padding-bottom: 60rpx;
		position: relative;
	}

	/* Global Background */
	.global-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: url('/static/img/bgImg.png');
		background-size: cover;
		background-repeat: no-repeat;
		opacity: 0.4;
		z-index: 0;
		pointer-events: none;
	}

	/* Content needs z-index to sit above bg */
	.search-section,
	.news-list,
	.no-more {
		position: relative;
		z-index: 1;
	}

	.news-list {
		padding: 30rpx;
		background-color: #fff;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	/* Search Section */
	.search-section {
		margin-bottom: 30rpx;
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon-manual {
		position: absolute;
		left: 30rpx;
		z-index: 10;
	}

	:deep(.u-search) {
		flex: 1;
	}

	:deep(.u-search__content__input) {
		padding-left: 36rpx !important;
	}

	/* News List Styles */
	.news-item {
		display: flex;
		margin-bottom: 30rpx;
		border-radius: 20rpx;
		overflow: hidden;
		background-color: #fff;
		border: 1rpx solid rgba(0, 0, 0, 0.05);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
		animation: fadeIn 0.6s ease-out;
		padding: 20rpx;
	}

	.news-item:last-child {
		margin-bottom: 0;
	}

	.news-image-wrap {
		position: relative;
		width: 200rpx;
		height: 200rpx;
		flex-shrink: 0;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #f3f4f6;

		.news-image {
			width: 100%;
			height: 100%;
		}

		.date-badge {
			position: absolute;
			top: 0;
			left: 0;
			background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
			color: #fff;
			padding: 6rpx 10rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			border-bottom-right-radius: 12rpx;
			box-shadow: 2rpx 2rpx 8rpx rgba(0, 0, 0, 0.2);

			.day {
				font-size: 24rpx;
				font-weight: bold;
				line-height: 1;
			}

			.month {
				font-size: 16rpx;
				transform: scale(0.8);
				margin-top: 2rpx;
			}
		}
	}

	.news-content {
		flex: 1;
		padding-left: 24rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.news-title {
		font-family: 'DingTalk JinBuTi', sans-serif;
		font-size: 30rpx;
		font-weight: bold;
		color: #1F2937;
		line-height: 1.4;
		margin-bottom: 12rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	.news-location {
		display: flex;
		align-items: center;
		margin-bottom: 10rpx;

		.location-text {
			font-size: 24rpx;
			color: #6B7280;
			margin-left: 8rpx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 320rpx;
		}
	}
	
	.tabs{
		display: flex;
		justify-content: space-between;
	}

	.news-meta {
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	.article-views {
		display: flex;
		align-items: center;
		gap: 6rpx;

		.view-count {
			font-size: 22rpx;
			color: #999;
			margin-top: -6rpx;
		}
	}

	.news-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8rpx;
	}

	.tag {
		font-size: 20rpx;
		padding: 2rpx 12rpx;
		border-radius: 6rpx;
		display: inline-block;
		background-color: #F3F4F6;
		color: #4B5563;
		transition: all 0.3s;
	}

	.blue-tag {
		background-color: #EFF6FF;
		color: #3B82F6;
		border: 1rpx solid rgba(59, 130, 246, 0.1);
	}

	/* No More Data Footer */
	.no-more {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60rpx 0;
	}

	.no-more-text {
		font-size: 24rpx;
		color: #9CA3AF;
		padding: 0 20rpx;
		background-color: transparent;
		z-index: 1;
	}

	.no-more-line {
		position: absolute;
		height: 1rpx;
		background-color: #E5E7EB;
		width: 200rpx;
		z-index: 0;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10rpx);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>