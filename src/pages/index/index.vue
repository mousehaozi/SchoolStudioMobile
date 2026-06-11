<template>
  <view class="container">
    <!-- Global Background -->
    <view class="global-background"></view>

    <!-- Custom Header -->
    <view class="custom-header">
      <view class="header-left">
        <image src="/static/appLogo.png" class="logo-icon" mode="aspectFit"></image>
        <text class="header-title">{{ appTitle }}</text>
      </view>
    </view>

    <!-- Main Content Area -->
    <scroll-view scroll-y class="main-scroll" :show-scrollbar="false" enhanced :bounces="true" :scroll-top="scrollTop"
      scroll-with-animation @scroll="handleScroll">
      <!-- Banner Section (Full Width) -->
      <view class="banner-section full-width">
        <swiper class="banner-swiper" circular indicator-dots autoplay interval="5000" duration="1000"
          indicator-color="rgba(255, 255, 255, 0.4)" indicator-active-color="#ffffff">
          <swiper-item v-for="(item, index) in bannerList" :key="index" @click="onBannerClick(item)">
            <image class="banner-image" :src="getResourceUrl(item.imageUrl) || '/static/appLogo.png'" mode="aspectFill"></image>
          </swiper-item>
        </swiper>
      </view>

      <!-- Intro Section with Background -->
      <view class="intro-section">
        <!-- Filter Section (Moved below banner) -->
        <view class="filter-bar">
          <view class="filter-item" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
            <text>全部工作室</text>
          </view>
          <view class="filter-item" :class="{ active: activeFilter === '国家级' }" @click="activeFilter = '国家级'">
            <view class="dot national"></view>
            <text>国家级</text>
          </view>
          <view class="filter-item" :class="{ active: activeFilter === '省级' }" @click="activeFilter = '省级'">
            <view class="dot provincial"></view>
            <text>省级</text>
          </view>
        </view>

        <!-- List Title Section -->
        <view class="list-title-header">
          <view class="left">
            <text class="title">创新工作室展示</text>
            <text class="subtitle">探索国家级、省级劳模工匠创新工作室的卓越成果</text>
          </view>
        </view>

        <view class="list-stats-bar">
          <view class="stats-left">
            <view class="pulse-dot"></view>
            <text class="count-text">为您找到 <text class="highlight">{{ filteredStudioList.length }}</text> 个工作室</text>
          </view>
          <view class="filter-indicator" v-if="activeFilter !== 'all'">
            <text>{{ activeFilter }}</text>
          </view>
        </view>
      </view>

      <!-- Studio List -->
      <view class="studio-list" v-if="filteredStudioList.length > 0">
        <view v-for="studio in filteredStudioList" :key="studio.id" class="studio-card" @click="goToDetail(studio)">
          <view class="card-image-wrap">
            <image :src="getResourceUrl(studio.iconUrl) || '/static/appLogo.png'" class="card-image" mode="aspectFill"></image>
            <view class="level-tag" :class="studio.level === '国家级' ? 'national' : 'provincial'">
              <u-icon v-if="studio.level === '国家级'" name="star-fill" color="#ffffff" size="10"></u-icon>
              <u-icon v-else name="integral-fill" color="#ffffff" size="10"></u-icon>
              <text>{{ studio.level }}</text>
            </view>
          </view>
          <view class="card-content">
            <view class="title-row">
              <text class="studio-name">{{ studio.name }}</text>
              <view class="enter-btn">
                <u-icon name="arrow-right" size="14" color="#3b82f6"></u-icon>
              </view>
            </view>
            <view class="info-row">
              <u-icon name="account" size="14" color="#666"></u-icon>
              <text class="label">领衔人：</text>
              <text class="value">{{ studio.leaderName || '暂未设置' }}</text>
            </view>
            <view class="info-row" v-if="studio.organizationName">
              <u-icon name="home" size="14" color="#666"></u-icon>
              <text class="value">{{ studio.organizationName }}</text>
            </view>
            <text class="intro-text">{{ studio.simpleIntro || '专注于技术创新，研发出多项国家级专利，推动行业技术进步。' }}</text>

            <!-- News Preview Section -->
            <view class="news-preview" v-if="studio.latestNews && studio.latestNews.length > 0">
              <view class="news-preview-item" v-for="news in studio.latestNews" :key="news.id"
                @click.stop="goToNewsDetail(news, studio)">
                <view class="dot"></view>
                <text class="news-preview-title">{{ news.title }}</text>
                <text class="news-preview-date">{{ formatDate(news.publishedAt, 'MM-DD') }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view class="empty-state" v-else>
        <image src="/static/img/index/home.webp" class="empty-icon" mode="widthFix"></image>
        <text class="empty-text">该分类下暂无工作室</text>
      </view>

      <!-- Bottom Spacer -->
      <view class="bottom-spacer"></view>
    </scroll-view>

    <!-- Bottom Navigation -->
    <MyTabbar activePath="/pages/index/index" />

    <!-- Back to Top Button -->
    <view class="back-top" :class="{ 'show': showBackTop }" @click="backToTop">
      <u-icon name="arrow-upward" color="#3b82f6" size="24"></u-icon>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { getStudioBanners, getStudios, getSystemConfigs } from "@/api/index.js";
import { formatDate } from "@/utils/formatDate.js";
import { initWechatShare } from "@/utils/weixinShare.js";
import { getResourceUrl } from "@/utils/baseUrl.js";

const loading = ref(true);
const bannerList = ref([]);
const studioList = ref([]);
const activeFilter = ref("all");
const appTitle = ref("重庆工业职业技术大学劳模工匠创新工作室");
const scrollTop = ref(0);
const oldScrollTop = ref(0);
const showBackTop = ref(false);

const getHomeShareData = () => {
  return {
    title: appTitle.value || "重庆工业职业技术大学劳模工匠创新工作室",
    desc: "探索国家级、省级劳模工匠创新工作室的卓越成果",
    imgUrl: getResourceUrl(bannerList.value[0]?.imageUrl) || "/static/share_thumb.png",
  };
};

const setupHomeShare = async () => {
  try {
    await initWechatShare(getHomeShareData());
  } catch (error) {
    console.error("Failed to init home WeChat share:", error);
  }
};

const filteredStudioList = computed(() => {
  if (activeFilter.value === "all") return studioList.value;
  return studioList.value.filter(s => s.level === activeFilter.value);
});

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

const fetchSystemConfigs = async () => {
  try {
    const res = await getSystemConfigs();
    if (res.code === 0 || res.code === 200) {
      const titleConfig = res.data.find(item => item.key === 'title');
      if (titleConfig && titleConfig.value) {
        appTitle.value = titleConfig.value;
        uni.setNavigationBarTitle({
          title: titleConfig.value,
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch system configs:", error);
  }
};

const fetchStudiosData = async () => {
  try {
    const res = await getStudios();
    if (res.code === 0 || res.code === 200) {
      const data = res.data.map((item) => ({
        ...item,
        level: item.studioLevel === 0 ? "国家级" : item.studioLevel === 1 ? "省级" : ""
      })).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      studioList.value = data;
    }
  } catch (error) {
    console.error("Failed to fetch studios:", error);
  }
};

onLoad(() => {
  uni.setNavigationBarTitle({
    title: "重庆工业职业技术大学劳模工匠创新工作室",
  });

  Promise.all([fetchBanners(), fetchStudiosData(), fetchSystemConfigs()]).finally(() => {
    loading.value = false;
    setupHomeShare();
  });
});

onShow(() => {
  setupHomeShare();
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

const handleScroll = (e) => {
  oldScrollTop.value = e.detail.scrollTop;
  if (e.detail.scrollTop > 400) {
    showBackTop.value = true;
  } else {
    showBackTop.value = false;
  }
};

const backToTop = () => {
  // 解决 scrollTop 设值为 0 不触发视图更新的问题
  scrollTop.value = oldScrollTop.value;
  nextTick(() => {
    scrollTop.value = 0;
  });
};

const goToNewsDetail = (news, studio) => {
  uni.navigateTo({
    url: `/pages/intro/intro?id=${studio.id}&name=${encodeURIComponent(studio.name)}&level=${encodeURIComponent(studio.level)}&studioLevel=${studio.studioLevel}&tab=1`
  });
};

const goToDetail = (studio) => {
  uni.navigateTo({
    url: `/pages/intro/intro?id=${studio.id}&name=${encodeURIComponent(studio.name)}&level=${encodeURIComponent(studio.level)}&studioLevel=${studio.studioLevel}`
  });
};

// goToPage is now handled by MyTabbar component
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
  background-color: transparent;
  overflow: hidden;
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
  z-index: -1;
  /* Place it behind everything */
  pointer-events: none;
}

/* Header */
.custom-header {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 100;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  padding-top: var(--status-bar-height);
  box-sizing: content-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.logo-icon {
  width: 44rpx;
  height: 44rpx;
}

.header-title {
  font-family: "DingTalk JinBuTi", sans-serif;
  font-size: 30rpx;
  font-weight: bold;
  color: #1a1a1a;
  letter-spacing: 1rpx;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.menu-icon {
  margin-left: 10rpx;
}

/* Scroll View */
.main-scroll {
  flex: 1;
  height: 0;
}

/* Intro Section Group */
.intro-section {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.7) 100%);
  backdrop-filter: blur(20px);
  margin-bottom: 20rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.03);
  position: relative;
  z-index: 10;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  padding: 30rpx 30rpx 10rpx;
  gap: 20rpx;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 28rpx;
  background: rgba(255, 255, 255, 0.5);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  border-radius: 100rpx;
  font-size: 26rpx;
  color: #555;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.02);

  &.active {
    background: #3b82f6;
    color: #fff;
    border-color: #3b82f6;
    box-shadow: 0 8rpx 16rpx rgba(59, 130, 246, 0.4);
    transform: translateY(-2rpx);
  }
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;

  &.national {
    background: #ffcc00;
  }

  &.provincial {
    background: #52c41a;
  }
}

/* Banner */
.banner-section {
  padding: 0;
  width: 100%;
}

.banner-swiper {
  height: 400rpx;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* Titles */
.list-title-header {
  padding: 30rpx 30rpx 10rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #111;
    font-family: "DingTalk JinBuTi", sans-serif;
    letter-spacing: 1rpx;
  }

  .subtitle {
    font-size: 26rpx;
    color: #7a7a7a;
    margin-top: 12rpx;
    display: block;
    line-height: 1.4;
  }
}

.list-stats-bar {
  margin: 10rpx 30rpx 20rpx;
  padding: 16rpx 24rpx;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1rpx solid rgba(59, 130, 246, 0.1);

  .stats-left {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .pulse-dot {
    width: 10rpx;
    height: 10rpx;
    background: #3b82f6;
    border-radius: 50%;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #3b82f6;
      animation: pulse 2s infinite;
    }
  }

  .count-text {
    font-size: 24rpx;
    color: #555;

    .highlight {
      color: #3b82f6;
      font-weight: bold;
      margin: 0 4rpx;
    }
  }

  .filter-indicator {
    display: flex;
    align-items: center;
    padding: 6rpx 20rpx;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 100rpx;
    font-size: 22rpx;
    color: #3b82f6;
    font-weight: 500;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  100% {
    transform: scale(3);
    opacity: 0;
  }
}

/* Studio Cards */
.studio-list {
  padding: 0 30rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.studio-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8rpx);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  animation: slideUp 0.5s ease-out both;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-image-wrap {
  position: relative;
  height: 340rpx;
  width: 100%;
}

.card-image {
  width: 100%;
  height: 100%;
}

.level-tag {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 16rpx;
  border-radius: 10rpx;
  font-size: 22rpx;
  font-weight: bold;
  color: #fff;
  backdrop-filter: blur(4px);

  &.national {
    background: rgba(255, 122, 0, 0.85);
  }

  &.provincial {
    background: rgba(0, 122, 255, 0.85);
  }
}

.card-content {
  padding: 24rpx;

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;

    .studio-name {
      flex: 1;
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      line-height: 1.4;
      padding-right: 20rpx;
    }

    .enter-btn {
      width: 44rpx;
      height: 44rpx;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-bottom: 8rpx;

    .label {
      font-size: 24rpx;
      color: #999;
    }

    .value {
      font-size: 26rpx;
      color: #666;
    }
  }

  .intro-text {
    font-size: 26rpx;
    color: #888;
    line-height: 1.6;
    margin-top: 16rpx;
    margin-bottom: 24rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .news-preview {
    background: #f8fbff;
    border-radius: 12rpx;
    padding: 16rpx 20rpx;
    border: 1rpx solid rgba(59, 130, 246, 0.05);

    .news-preview-item {
      display: flex;
      align-items: center;
      padding: 10rpx 0;
      gap: 12rpx;

      &:not(:last-child) {
        border-bottom: 1rpx dashed rgba(0, 0, 0, 0.04);
      }

      &:active {
        opacity: 0.6;
      }

      .dot {
        width: 8rpx;
        height: 8rpx;
        background: #3b82f6;
        border-radius: 50%;
        opacity: 0.6;
      }

      .news-preview-title {
        flex: 1;
        font-size: 24rpx;
        color: #444;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .news-preview-date {
        font-size: 22rpx;
        color: #999;
        margin-left: 20rpx;
      }
    }
  }
}


.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .empty-icon {
    width: 200rpx;
    opacity: 0.3;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.bottom-spacer {
  height: 150rpx;
}

/* Back Top Button */
.back-top {
  position: fixed;
  right: 40rpx;
  bottom: 180rpx;
  width: 88rpx;
  height: 88rpx;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(59, 130, 246, 0.1);
  z-index: 1000;
  opacity: 0;
  transform: scale(0.5);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(10px);

  &.show {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  &:active {
    background-color: #f0f7ff;
    transform: scale(0.9);
  }
}
</style>
