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
                        <u-icon name="clock" size="14" color="#9CA3AF"></u-icon>
                        <text class="meta-value">{{
                            formatDate(detailData.createdAt, 'YYYY-MM-DD HH:mm') || "---"
                            }}</text>
                    </view>
                </view>

                <view class="card-divider header-divider"></view>
            </view>

            <!-- Cover Image -->
            <view class="image-wrapper" v-if="detailData.coverUrl">
                <image class="article-image" :src="detailData.coverUrl" mode="widthFix"></image>
            </view>

            <!-- Content Section -->
            <view class="article-body">
                <rich-text :nodes="processRichText(detailData.contentHtml)"></rich-text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { formatDate } from "@/utils/formatDate.js";
import { getStudioIntroArticleDetail } from "@/api/index.js";

const detailData = ref({});
const loading = ref(true);

const processRichText = (html) => {
    if (!html) return "";
    return html.replace(
        /<img/gi,
        '<img style="max-width:100%;height:auto;display:block;"',
    );
};

const articleId = ref("");
const studioId = ref("");

onLoad((options) => {
    if (options.data) {
        try {
            const item = JSON.parse(decodeURIComponent(options.data));
            detailData.value = item;
            loading.value = false;
            // For H5, set page title
            if (item.title) {
                uni.setNavigationBarTitle({ title: item.title });
            }
        } catch (e) {
            console.error("Parse data failed:", e);
        }
    }

    // If we don't have data yet (or it failed), but we have an id, fetch it
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
    padding: 30rpx;
    position: relative;
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
    margin-bottom: 20rpx;
    display: block;
}

.meta-info {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.meta-value {
    font-size: 24rpx;
    color: #9ca3af;
}

.card-divider {
    height: 1rpx;
    background-color: #f3f4f6;
}

.header-divider {
    margin: 16rpx 0 0 0;
}

.article-body {
    padding: 0 40rpx 40rpx;
}

.image-wrapper {
    margin: 0 40rpx 40rpx;
    border-radius: 16rpx;
    overflow: hidden;
    background-color: #f3f4f6;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.article-image {
    width: 100%;
    display: block;
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

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 320rpx;
    gap: 20rpx;
}
</style>
