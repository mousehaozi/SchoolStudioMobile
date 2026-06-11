<template>
    <view class="container">
        <!-- Global Background -->
        <view class="global-background"></view>

        <!-- Loading State -->
        <view v-if="loading" class="loading-state">
            <u-loadmore status="loading" loading-text="正在加载中..." iconSize="18" fontSize="16" />
        </view>

        <view class="content-wrapper" v-else>
            <view class="content-card">
                <!-- Title Section -->
                <view class="header-section">
                    <text class="main-title">{{ detailData.title || "加载中..." }}</text>

                    <view class="meta-info">
                        <view class="meta-item">
                            <u-icon name="clock" size="14" color="#64748b"></u-icon>
                            <text class="meta-value">{{
                                formatDate(detailData.createdAt, 'YYYY-MM-DD HH:mm') || "---"
                                }}</text>
                        </view>
                        <!-- Optional: Add View Count if available in the future -->
                        <view class="meta-item" v-if="detailData.viewCount !== undefined">
                            <view class="meta-divider"></view>
                            <u-icon name="eye" size="14" color="#64748b"></u-icon>
                            <text class="meta-value">{{ detailData.viewCount || 0 }}次浏览</text>
                        </view>
                    </view>

                    <view class="action-divider"></view>
                </view>

                <!-- Cover Image -->
                <view class="image-wrapper" v-if="detailData.coverUrl">
                    <image class="article-image" :src="getResourceUrl(detailData.coverUrl)" mode="widthFix"></image>
                </view>

                <!-- Content Section -->
                <view class="article-body">
                    <u-parse :content="processRichText(detailData.contentHtml)"></u-parse>
                </view>

                <!-- Bottom Spacer -->
                <view class="safe-area-bottom"></view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { formatDate } from "@/utils/formatDate.js";
import { getStudioIntroArticleDetail } from "@/api/index.js";
import { getResourceHtml, getResourceUrl } from "@/utils/baseUrl.js";

const detailData = ref({});
const loading = ref(true);

const processRichText = (html) => {
    if (!html) return "";
    // Enhance images in rich text
    let content = getResourceHtml(html).replace(
        /<img/gi,
        '<img style="max-width:100%;height:auto;display:block;margin:24rpx 0;border-radius:16rpx;box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);"'
    );
    // Optional: Enhance paragraphs
    content = content.replace(
        /<p/gi,
        '<p style="margin-bottom:20rpx;line-height:1.8;color:#334155;font-size:30rpx;text-align:justify;"'
    );
    return content;
};

const articleId = ref("");
const studioId = ref("");

onLoad((options) => {
    if (options.data) {
        try {
            const item = JSON.parse(decodeURIComponent(options.data));
            detailData.value = item;
            loading.value = false;
            if (item.title) {
                uni.setNavigationBarTitle({ title: item.title });
            }
        } catch (e) {
            console.error("Parse data failed:", e);
        }
    }

    if (loading.value && (options.id || options.dataId)) {
        articleId.value = options.id || options.dataId;
        studioId.value = options.studioId || "";
        fetchDetail(studioId.value, articleId.value);
    }
});

const fetchDetail = async (sId, id) => {
    loading.value = true;
    try {
        const res = await getStudioIntroArticleDetail(sId, id);
        if (res.code === 200 || res.code === 0) {
            detailData.value = res.data;
            if (res.data.title) {
                uni.setNavigationBarTitle({ title: res.data.title });
            }
        }
    } catch (err) {
        console.error("Fetch intro article detail failed", err);
        uni.showToast({
            title: "获取详情失败",
            icon: "none",
        });
    } finally {
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
    position: relative;
    background-color: #f8fafc;
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
    opacity: 0.25;
    z-index: 0;
    pointer-events: none;
}

.content-wrapper {
    position: relative;
    z-index: 1;
    padding: 24rpx;
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.content-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow:
        0 10rpx 40rpx rgba(0, 0, 0, 0.04),
        0 2rpx 10rpx rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.5);
}

.header-section {
    padding: 48rpx 40rpx 32rpx;
}

.main-title {
    font-family: "DingTalk JinBuTi", sans-serif;
    font-size: 48rpx;
    font-weight: bold;
    color: #1e293b;
    line-height: 1.4;
    margin-bottom: 24rpx;
    display: block;
    letter-spacing: 1rpx;
}

.meta-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.meta-value {
    font-size: 24rpx;
    color: #64748b;
    font-weight: 500;
}

.meta-divider {
    width: 2rpx;
    height: 16rpx;
    background-color: #e2e8f0;
    margin: 0 20rpx;
}

.action-divider {
    height: 4rpx;
    background: linear-gradient(to right, #007aff, rgba(0, 122, 255, 0.1), transparent);
    width: 80rpx;
    margin-top: 32rpx;
    border-radius: 4rpx;
}

.image-wrapper {
    margin: 0 40rpx 40rpx;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
    border: 6rpx solid #ffffff;
}

.article-image {
    width: 100%;
    display: block;
}

.article-body {
    padding: 0 40rpx 60rpx;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.safe-area-bottom {
    height: constant(safe-area-inset-bottom);
    height: env(safe-area-inset-bottom);
    padding-bottom: 20rpx;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(40rpx);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 30vh;
    gap: 32rpx;
}
</style>
