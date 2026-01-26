<template>
  <view class="container">
    <!-- Global Background -->
    <view class="global-background"></view>

    <!-- Custom Header -->
    <view class="custom-header" style="padding-top: 12rpx">
      <view class="header-content">
        <view class="header-left">
          <image
            src="/static/img/index/home.webp"
            class="home-icon"
            mode="widthFix"
          ></image>
        </view>
        <text class="header-title">重工车辆工程学院成果转化创新工作室</text>
        <view class="header-right-spacer"></view>
      </view>
    </view>

    <!-- Scrollable Content Area -->
    <view class="main-content">
      <!-- Banner -->
      <view class="banner-wrapper">
        <swiper class="banner-swiper" circular indicator-dots autoplay>
          <swiper-item v-for="(item, index) in bannerList" :key="index">
            <image
              class="banner-image"
              :src="item.imageUrl || '/static/appLogo.png'"
              mode="aspectFill"
            ></image>
          </swiper-item>
        </swiper>
      </view>

      <!-- Studio Business Card -->
      <a class="card studio-card" href="https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzIxNTE0MjMzNw==#wechat_redirect" style="text-decoration: none;">
        <view class="studio-info">
          <image src="/static/img/index/lilei.jpg" class="studio-logo"></image>
          <view class="studio-text">
            <text class="studio-name">李雷工作室</text>
            <text class="studio-desc">汽车技术交流学习和专业课程建设</text>
          </view>
        </view>
        <view class="follow-btn">
          <text>关注</text>
        </view>
      </a>

      <!-- Nav Card -->
      <view class="card nav-card">
        <!-- Main Navigation Grid -->
        <view class="nav-grid">
          <view class="nav-item" @click="navigateTo('/pages/intro/intro')">
            <view class="icon-wrapper">
              <image
                src="/static/img/index/WorkRoom.webp"
                class="nav-icon"
              ></image>
            </view>
            <text>工作室介绍</text>
          </view>
          <view class="nav-item" @click="navigateTo('/pages/dynamic/dynamic')">
            <view class="icon-wrapper">
              <image
                src="/static/img/index/WorkUpdates.webp"
                class="nav-icon"
              ></image>
            </view>
            <text>工作动态</text>
          </view>
          <view class="nav-item" @click="togglePopup">
            <view class="icon-wrapper">
              <image src="/static/img/index/need.webp" class="nav-icon"></image>
            </view>
            <text>产教融合</text>
          </view>
          <view
            class="nav-item"
            @click="navigateTo('/pages/serviceConversa/serviceConversa')"
          >
            <view class="icon-wrapper">
              <image
                src="/static/img/index/FeeBack.webp"
                class="nav-icon"
              ></image>
            </view>
            <text>问题咨询</text>
          </view>
        </view>
      </view>

      <!-- Tech Transfer Section -->
      <!-- <view class="card section-card">
        <view class="section-header">
          <text class="section-title">成果转化</text>
          <text class="more-link">更多</text>
        </view>
        <view class="tech-list">
          <view
            class="tech-item"
            v-for="(item, index) in techList"
            :key="index"
            @click="navigateTo('/pages/technologyTransfer/technologyTransfer')"
          >
            <view class="tech-info">
              <view class="tech-title-wrap">
                <view class="tech-status-dot" :class="index % 2 === 0 ? 'status-blue' : 'status-orange'"></view>
                <text class="tech-title">{{ item.title }}</text>
              </view>
              <view class="tech-tags">
                <text
                  class="tag"
                  :class="getTagClass(tag)"
                  v-for="(tag, tIndex) in item.tags"
                  :key="tIndex"
                  >{{ tag }}</text
                >
              </view>
            </view>
            <u-icon name="arrow-right" color="#D1D5DB" size="16"></u-icon>
          </view>
        </view>
      </view> -->

      <!-- Work Dynamics Section -->
      <view class="card section-card">
        <view class="section-header">
          <text class="section-title">工作动态</text>
          <!-- <text class="more-link" @click="navigateTo('/pages/dynamic/dynamic')"
            >更多</text
          > -->
        </view>
        <view class="news-list">
          <view
            class="news-item"
            v-for="(item, index) in newsList"
            :key="index"
            @click="navigateToDetail(item)"
          >
            <image
              :src="item.coverUrl || '/static/appLogo.png'"
              class="news-image"
              mode="aspectFill"
            ></image>
            <view class="news-content">
              <text class="news-title">{{ item.title }}</text>
              <view class="news-meta">
                <view class="news-tags">
                  <text
                    class="tag blue-tag"
                    v-for="(tag, tIndex) in getTags(item.tags)"
                    :key="tIndex"
                    >{{ tag }}</text
                  >
                </view>
                <view class="news-date-container">
                  <image
                    src="/static/img/index/calendar.svg"
                    class="calendar-icon"
                  ></image>
                  <text class="news-date">{{
                    formatDate(item.publishedAt)
                  }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Popup Menu (Overlay) -->
    <view class="popup-overlay" v-if="showPopup" @click="togglePopup">
      <view class="popup-content" @click.stop>
        <view class="popup-btn full-width">
          <text>“渝教工心”产教融合</text>
        </view>
        <view class="popup-grid">
          <view
            class="popup-item"
            v-for="(item, index) in topicList"
            :key="index"
            @click="handlePublish(item)"
          >
            <image
              :src="item.coverUrl || '/static/appLogo.png'"
              class="popup-icon"
            ></image>
            <text>{{ item.name || item }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import uIcon from "uview-plus/components/u-icon/u-icon.vue";
import { getStudioBanners, getStudioNews, getIeTopic } from "@/api/index.js";
import { formatDate } from "@/utils/formatDate.js";

const showPopup = ref(false);
const statusBarHeight = ref(20);
const bannerList = ref([]);
const newsList = ref([]);
const topicList = ref([]);

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

const fetchNews = async () => {
  try {
    const res = await getStudioNews({ page: "1", size: "4" });
    if (res.code === 0 || res.code === 200) {
      newsList.value = res.data.records;
    }
  } catch (error) {
    console.error("Failed to fetch news:", error);
  }
};

const fetchTopicList = async () => {
  try {
    const res = await getIeTopic();
    if (res.code === 0 || res.code === 200) {
      topicList.value =
        res.data.length > 0 ? res.data : ["需求发布", "成果发布", "知产发布"];
    }
  } catch (error) {
    console.error("Failed to fetch topics:", error);
  }
};

const getTags = (tagsStr) => {
  if (!tagsStr) return [];
  return tagsStr.split(",").slice(0, 2); // 取前两个
};

onLoad(() => {
  const sysInfo = uni.getSystemInfoSync();
  statusBarHeight.value = sysInfo.statusBarHeight || 20;
  fetchBanners();
  fetchNews();
  fetchTopicList();
});

const techList = ref([
  { title: "锂电池防火材料", tags: ["科技成果", "技术入股"] },
  {
    title: "一种Li1+/Mg2+分离膜的研发",
    tags: ["技术需求", "现有技术/产品改进"],
  },
  {
    title: "脉波交错层式结构在整流变压器绕制...",
    tags: ["技术需求", "新产品/技术研发"],
  },
  {
    title: "高性能玄武岩混杂复合材料与结构关...",
    tags: ["技术需求", "引进技术"],
  },
  {
    title: "青柠檬及橄榄油深加工产品开发",
    tags: ["技术需求", "现有技术/产品改进"],
  },
]);

const navigateToDetail = (item) => {
  uni.navigateTo({
    url: `/pages/dynamic/compontes/dynamicDetail/dynamicDetail?data=${item.id}`,
  });
};

const togglePopup = () => {
  showPopup.value = !showPopup.value;
};

const handlePublish = (item) => {
  showPopup.value = false;
  const idValue = typeof item === "object" ? item.id : item;
  const nameValue = typeof item === "object" ? item.name : item;
  uni.navigateTo({
    url: `/pages/integraEdu/integraEdu?id=${idValue}&name=${nameValue}`,
  });
};

const navigateTo = (url) => {
  uni.navigateTo({
    url: url,
  });
};

const openUrl = (url) => {
  // #ifdef H5
  window.location.href = url;
  // #endif
  // #ifndef H5
  uni.navigateTo({
    url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
  });
  // #endif
};

const getTagClass = (tag) => {
  return "orange-tag";
};
</script>

<style lang="scss" scoped>
@font-face {
  font-family: "DingTalk JinBuTi";
  src: url("/static/font/钉钉进步体0111/DingTalk JinBuTi.ttf");
}

.container {
  min-height: 100vh;
  box-sizing: border-box;
  /* Padding for safe areas if needed, but sticky header needs to be at top */
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

/* Custom Header */
.custom-header {
  position: relative;
  padding: 0 10px;
}

.header-content {
  height: 44px; /* Standard nav bar height */
  display: flex;
  align-items: center;
}

.header-left {
  width: 80rpx; /* Increased to accommodate larger icon */
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-icon {
  width: 64rpx; /* Slightly adjusted to fit better in the header height */
  height: auto;
}

.header-title {
  font-family:
    -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 30rpx;
  font-weight: 800; /* Extra bold for authority */
  color: #1a1a1a;
  letter-spacing: 2rpx;
}

.header-right-spacer {
  width: 60rpx;
}

/* Main Content Layout */
.main-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding: 10rpx 20rpx 40rpx;
}

/* Banner */
.banner-wrapper {
  width: 100%;
}

.banner-swiper {
  height: 320rpx;
  width: 100%;
  border-radius: 20rpx;
  overflow: hidden;

  :deep(.uni-swiper-dot) {
    width: 12rpx !important;
    height: 12rpx !important;
  }
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* Cards Common Style */
.card {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

/* Nav Card specific */
.nav-card {
  padding-bottom: 30rpx;
}

/* Action Button */
.action-section {
  padding: 0;
  margin-bottom: 30rpx;
}

.action-btn {
  background: linear-gradient(to right, #007aff, #00b4ff);
  color: white;
  padding: 16rpx 0 8rpx;
  width: 100%;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 122, 255, 0.3);
  box-sizing: border-box;
}

.action-text {
  font-size: 28rpx;
  font-weight: normal;
  font-family: "DingTalk JinBuTi", sans-serif;
}

.arrow-down {
  font-size: 20rpx;
  margin-top: 2rpx;
}

/* Nav Grid */
.nav-grid {
  display: flex;
  justify-content: space-around;
  padding: 10rpx 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  text {
    font-size: 26rpx;
    color: #333;
    font-family: "DingTalk JinBuTi", sans-serif;
  }
}

.studio-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx !important;
  margin-bottom: 10rpx;
  background-color: #fff !important;
  text-decoration: none;
  color: inherit;
}

.studio-card:active {
  background-color: #f9f9f9 !important;
}

.studio-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.studio-logo {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  border: 1rpx solid #f0f0f0;
}

.studio-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.studio-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 6rpx;
}

.studio-desc {
  font-size: 24rpx;
  color: #888;
}

.follow-btn {
  background-color: #07c160;
  color: white;
  padding: 10rpx 28rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 500;
  margin-left: 20rpx;
}

.icon-wrapper {
  width: 96rpx;
  height: 96rpx;
  background-color: #f8fbff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.nav-icon {
  width: 72rpx; /* Slightly smaller to fit background padding */
  height: 72rpx;
  position: relative;
  z-index: 2;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  /* Removed border-bottom per request "remove color in front of text" if that's interpreted as the line,
     or if it meant a marker. I'll keep it clean. */
}

.section-title {
  font-family: "DingTalk JinBuTi", sans-serif;
  font-size: 34rpx;
  font-weight: bold;
  font-style: italic;
  position: relative;
  padding-left: 20rpx; /* Space for the vertical line */
}

/* Vertical Gradient Line */
.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8rpx;
  height: 32rpx;
  background: linear-gradient(
    to bottom,
    #4facfe,
    #00f2fe
  ); /* Light Blue Gradient */
  border-radius: 4rpx;
}

.more-link {
  color: #999;
  font-size: 28rpx;
}

/* Tech List */
.tech-item {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tech-item:last-child {
  border-bottom: none;
}

.tech-info {
  flex: 1;
  margin-right: 20rpx;
}

.tech-title-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.tech-status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.status-blue {
  background-color: #3b82f6;
  box-shadow: 0 0 8rpx rgba(59, 130, 246, 0.4);
}

.status-orange {
  background-color: #f59e0b;
  box-shadow: 0 0 8rpx rgba(245, 158, 11, 0.4);
}

.tech-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding-left: 28rpx;
}

/* News List */
.news-item {
  display: flex; /* Changed to row for better card look inside list? Or keep as column? Previous was column. */
  /* User didn't specify changing news item layout, but said "overall layout uses flex elastic layout".
     I'll keep specific item layout similar but cleaner. */
  flex-direction: column;
  margin-bottom: 30rpx;
  border-radius: 10rpx;
  overflow: hidden;
  background-color: #fff;
  /* box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05); Already in a card, so maybe remove item shadow or keep it subtle? */
  border: 1rpx solid #eee; /* Light border since it's inside a white card */
}

.news-item:last-child {
  margin-bottom: 0;
}

.news-image {
  width: 100%;
  height: 300rpx;
  background-color: #eee;
}

.news-content {
  padding: 20rpx;
}

.news-title {
  font-size: 32rpx;
  display: block;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-tags {
  display: flex;
  gap: 12rpx;
}

.news-date-container {
  display: flex;
  align-items: center;
}

.calendar-icon {
  width: 28rpx;
  height: 28rpx;
  margin-right: 8rpx;
}

.news-date {
  color: #999;
  font-size: 26rpx;
}

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-content {
  background-color: white;
  width: 90%;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
}

.popup-btn {
  border: 2rpx solid #007aff;
  border-radius: 10rpx;
  padding: 15rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #007aff;
  font-weight: bold;
  margin-bottom: 30rpx;
  background-color: #fff;
}

.arrow-up {
  font-size: 24rpx;
  color: #007aff;
  margin-top: 5rpx;
}

.popup-grid {
  display: flex;
  justify-content: space-around;
}

.popup-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  text {
    color: #333;
    font-size: 28rpx;
  }
}

.popup-icon {
  width: 90rpx;
  height: 90rpx;
  margin-bottom: 10rpx;
  border-radius: 50%;
}

/* Tags */
.tag {
  font-size: 24rpx;
  padding: 6rpx 24rpx;
  border-radius: 30rpx;
  display: inline-block;
  margin-right: 0; /* Handled by gap */
}

.blue-tag {
  background-color: rgba(0, 122, 255, 0.08);
  color: #007aff;
  border: 1rpx solid #007aff;
}

.blue-outline-tag {
  background-color: #fff;
  border: 1px solid #007aff;
  color: #007aff;
}

.orange-tag {
  background-color: rgba(255, 149, 0, 0.08);
  color: #ff9500;
  border: 1rpx solid #ff9500;
}

.orange-outline-tag {
  color: #ffb400;
  border: 1px solid #ffb400;
  background-color: #fff;
}
</style>
