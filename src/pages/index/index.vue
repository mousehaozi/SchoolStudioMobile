<template>
  <view class="container">
    <!-- Global Background -->
    <view class="global-background"></view>

    <!-- Custom Header -->
    <view class="custom-header">
      <view class="header-content">
        <image src="/static/appLogo.png" class="home-icon" mode="aspectFit"></image>
        <text class="header-title">重工大劳模和工匠人才创新工作室</text>
      </view>
    </view>

    <!-- Loading State -->
    <view v-if="loading" class="loading-state">
      <u-loadmore status="loading" loading-text="正在加载中..." iconSize="18" fontSize="16" />
    </view>

    <!-- Main Content Area -->
    <view class="main-body" v-else>
      <!-- Banner Section -->
      <view class="banner-section">
        <swiper class="banner-swiper" circular indicator-dots autoplay interval="5000" duration="1000"
          indicator-color="rgba(255, 255, 255, 0.4)" indicator-active-color="#ffffff">
          <swiper-item v-for="(item, index) in bannerList" :key="index" @click="onBannerClick(item)">
            <image class="banner-image" :src="item.imageUrl || '/static/appLogo.png'" mode="aspectFill"></image>
          </swiper-item>
        </swiper>
      </view>

      <!-- Split Layout Area -->
      <view class="split-container" v-if="studioList.length > 0">
        <!-- Left: Studio List -->
        <view class="sidebar">
          <scroll-view scroll-y class="sidebar-scroll">
            <view class="sidebar-title">
              <image src="/static/img/index/home.webp" class="sidebar-title-icon" mode="widthFix"></image>
              <text class="sidebar-title-text">工作室</text>
            </view>
            <view v-for="studio in studioList" :key="studio.id" class="sidebar-item"
              :class="{ active: currentStudioId === studio.id }" @click="currentStudioId = studio.id">
              <image v-if="studio.iconUrl" :src="studio.iconUrl" class="studio-icon" mode="aspectFill">
              </image>
              <text class="studio-name">{{ studio.name }}</text>
            </view>
          </scroll-view>
        </view>

        <!-- Right: Tabs & Content -->
        <view class="content-main">
          <!-- Tab Bar -->
          <view class="tab-header">
            <view class="tab-item" :class="{ active: currentTab === 'intro' }" @click="currentTab = 'intro'">
              <view class="tab-icon-wrap">
                <image src="/static/img/index/WorkRoom.webp" class="tab-icon"></image>
              </view>
              <text>工作室介绍</text>
            </view>
            <view class="tab-item" :class="{ active: currentTab === 'dynamic' }" @click="currentTab = 'dynamic'">
              <view class="tab-icon-wrap">
                <image src="/static/img/index/WorkUpdates.webp" class="tab-icon"></image>
              </view>
              <text>工作动态</text>
            </view>
            <view class="tab-item" :class="{ active: currentTab === 'integraEdu' }" @click="currentTab = 'integraEdu'">
              <view class="tab-icon-wrap">
                <image src="/static/img/index/need.webp" class="tab-icon"></image>
              </view>
              <text>产教融合</text>
            </view>
          </view>

          <!-- Scrollable Component Area -->
          <view class="component-wrapper">
            <scroll-view scroll-y class="component-scroll" :scroll-top="scrollTop" @scroll="onScroll"
              @scrolltolower="handleScrollToLower" :show-scrollbar="false" enhanced :bounces="true">
              <!-- Placeholder for absolute tab-header -->
              <view class="tab-header-placeholder"></view>
              <IntroComponent v-if="currentTab === 'intro'" :studioId="currentStudioId" ref="introRef" />
              <DynamicComponent v-if="currentTab === 'dynamic'" :studioId="currentStudioId" ref="dynamicRef" />
              <IntegraEduComponent v-if="currentTab === 'integraEdu'" :studioId="currentStudioId" ref="integraEduRef" />
              <!-- Bottom Spacer for better scroll experience -->
              <view class="scroll-bottom-spacer"></view>
            </scroll-view>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view class="empty-state-section" v-else>
        <view class="card empty-card">
          <image src="/static/img/index/home.webp" class="empty-icon" mode="widthFix"></image>
          <text class="empty-text">暂无工作室</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getStudioBanners, getStudios } from "@/api/index.js";
import IntroComponent from "../intro/intro.vue";
import DynamicComponent from "../dynamic/dynamic.vue";
import IntegraEduComponent from "../integraEdu/integraEdu.vue";

const loading = ref(true);
const bannerList = ref([]);
const studioList = ref([]);
const currentStudioId = ref(null);
const currentTab = ref("dynamic"); // Default to dynamic

const dynamicRef = ref(null);
const integraEduRef = ref(null);

const scrollTop = ref(0);
const oldScrollTop = ref(0);

const onScroll = (e) => {
  oldScrollTop.value = e.detail.scrollTop;
};

const resetScroll = () => {
  // Reset scroll to top
  scrollTop.value = oldScrollTop.value;
  nextTick(() => {
    scrollTop.value = 0;
  });
};

watch([currentTab, currentStudioId], () => {
  resetScroll();
});

const handleScrollToLower = () => {
  if (currentTab.value === "dynamic" && dynamicRef.value) {
    dynamicRef.value.loadMore();
  } else if (currentTab.value === "integraEdu" && integraEduRef.value) {
    integraEduRef.value.loadMore();
  }
};

const fetchBanners = async () => {
  try {
    const res = await getStudioBanners();
    if (res.code === 0 || res.code === 200) {
      bannerList.value = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch banners:", error);
  }
};

const fetchStudiosData = async () => {
  try {
    const res = await getStudios();
    if (res.code === 0 || res.code === 200) {
      studioList.value = res.data;
      if (studioList.value.length > 0) {
        currentStudioId.value = studioList.value[0].id;
      }
    }
  } catch (error) {
    console.error("Failed to fetch studios:", error);
  }
};

onLoad(() => {
  // Set page title for H5
  uni.setNavigationBarTitle({
    title: "重工大劳模和工匠人才创新工作室",
  });

  Promise.all([fetchBanners(), fetchStudiosData()]).finally(() => {
    loading.value = false;
  });
});

const onBannerClick = (item) => {
  if (item && item.linkUrl) {
    // #ifdef H5
    window.location.href = item.linkUrl;
    // #endif
    // #ifndef H5
    uni.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(item.linkUrl)}`,
    });
    // #endif
  }
};
</script>

<style lang="scss" scoped>
@font-face {
  font-family: "DingTalk JinBuTi";
  src: url("/static/font/钉钉进步体0111/DingTalk JinBuTi.ttf");
}

.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
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

/* Header */
.custom-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.03);
}

.header-content {
  height: 88rpx;
  display: flex;
  align-items: center;
}

.home-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.header-title {
  font-family: "DingTalk JinBuTi", sans-serif;
  font-size: 32rpx;
  font-weight: bold;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
}

/* Main Body */
.main-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* Banner */
.banner-section {
  padding: 0;
}

.banner-swiper {
  height: 320rpx;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* Split Container */
.split-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

/* Sidebar */
.sidebar {
  width: 144rpx;
  border-right: 1rpx solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: width 0.3s ease;
  z-index: 2;
  padding-top: 10rpx;
}

.sidebar-scroll {
  height: 100%;
}

.sidebar-title {
  padding: 30rpx 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;

  .sidebar-title-icon {
    width: 60rpx;
    height: 60rpx !important;
    opacity: 0.6;
  }

  .sidebar-title-text {
    display: none; // Only icon for the list title when narrow
  }
}

.sidebar-item {
  padding: 24rpx 10rpx;
  margin: 20rpx 16rpx;
  border-radius: 24rpx;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;

  &.active {
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.9) 0%,
        rgba(240, 245, 255, 0.7) 100%);
    border: 1rpx solid rgba(255, 255, 255, 0.6);
    box-shadow:
      0 10rpx 30rpx rgba(0, 0, 0, 0.08),
      0 4rpx 12rpx rgba(0, 122, 255, 0.05),
      inset 0 0 0 1rpx rgba(255, 255, 255, 0.5);

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 25%;
      bottom: 25%;
      width: 6rpx;
      background: #007aff;
      border-radius: 0 6rpx 6rpx 0;
      box-shadow: 0 0 15rpx rgba(0, 122, 255, 0.4);
    }

    .studio-name {
      color: #007aff;
      font-weight: bold;
    }

    .studio-icon {
      box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.1);
    }
  }
}

.studio-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background-color: #f8fafc;
  transition: all 0.3s;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.studio-name {
  display: block; // Always visible
  font-size: 20rpx;
  line-height: 1.2;
  color: #666;
  text-align: center;
  word-break: break-all;
  transition: all 0.3s;
}

/* Main Right Content */
.content-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)),
    url("/static/img/bgImg.png");
  background-size: cover;
  background-position: center;
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
}

.tab-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 30rpx 10rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(15px);
  z-index: 100;
  box-sizing: border-box;
}

.tab-header-placeholder {
  height: 160rpx;
  flex-shrink: 0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s;

  text {
    font-size: 22rpx;
    color: #999;
  }

  &.active {
    text {
      color: #007aff;
      font-weight: bold;
    }

    .tab-icon-wrap {
      background: #eef7ff;
      transform: scale(1.1);
    }
  }
}

.tab-icon-wrap {
  width: 70rpx;
  height: 70rpx;
  border-radius: 16rpx;
  background: #f8fbff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.tab-icon {
  width: 50rpx;
  height: 50rpx;
}

/* Component Area */
.component-wrapper {
  flex: 1;
  height: 0;
  /* Force flex to calculate height for internal scrolling */
  overflow: hidden;
  background: transparent;
}

.component-scroll {
  height: 100%;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
    -webkit-appearance: none;
    background: transparent;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.scroll-bottom-spacer {
  height: 40rpx;
  width: 100%;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* Loading State */
.loading-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty State */
.empty-state-section {
  flex: 1;
  padding: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  border-radius: 30rpx;
}

.empty-icon {
  width: 120rpx;
  margin-bottom: 20rpx;
  filter: grayscale(1) opacity(0.2);
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  font-family: "DingTalk JinBuTi", sans-serif;
}

/* Deep component style overrides to make them fit in split layout */
:deep(.container) {
  min-height: auto !important;
  padding: 0 !important;
  /* Remove fixed padding here */
  background-color: transparent !important;
  background-image: none !important;
}

:deep(.global-background) {
  display: none !important;
}

:deep(.card),
:deep(.news-list),
:deep(.article-list),
:deep(.info-card),
:deep(.intro-card),
:deep(.contact-section) {
  background: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(5px) !important;
  padding: 20rpx !important;
  margin: 15rpx !important;
  border-radius: 20rpx !important;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03) !important;
}

:deep(.topic-tabs-container) {
  background: transparent !important;
  padding: 10rpx 20rpx !important;
}

:deep(.search-section) {
  padding: 10rpx !important;
  background: transparent !important;
}
</style>
