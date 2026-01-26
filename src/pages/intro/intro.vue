<template>
  <view class="container">
    <view class="global-background"></view>
    <view class="status-bar-placeholder"></view>
    <!-- Loading State -->
    <view v-if="loading" class="loading-state">
      <u-loadmore status="loading" loading-text="正在加载中..." iconSize="18" fontSize="16" />
    </view>
    <view class="content-wrapper" v-else>
      <!-- Header Title -->
      <view class="header-section">
        <view class="title-wrapper">
          <view class="deco-dot"></view>
          <text class="page-title">{{ profile.title || '工作室介绍' }}</text>
          <view class="deco-dot"></view>
        </view>
        <text class="subtitle">Innovation & Transformation</text>
      </view>
      <!-- Main Intro Text -->
      <view class="card intro-card">
        <view class="card-header">
          <view class="title-line"></view>
          <text class="card-title">简介</text>
        </view>
        <view class="intro-paragraph">
          <rich-text :nodes="profile.contentHtml" v-if="profile.contentHtml"></rich-text>
          <text v-else>暂无简介</text>
        </view>
      </view>

      <!-- Info Sections -->
      <view class="card info-card">
        <view class="info-item">
          <view class="label-row">
            <u-icon name="account-fill" color="#3B82F6" size="18"></u-icon>
            <text class="info-label">工作室领衔人</text>
          </view>
          <text class="info-content highlight">{{ profile.leaderName || '暂无' }}</text>
          <text class="info-desc">{{ profile.leaderIntro || '暂无' }}</text>
        </view>

        <view class="divider"></view>

        <view class="info-item">
          <view class="label-row">
            <u-icon name="grid-fill" color="#3B82F6" size="18"></u-icon>
            <text class="info-label">组织架构</text>
          </view>
          <view class="tag-group">
            <view class="tag" v-for="(item, index) in profile.orgStructureParsed" :key="index">
              {{ item }}
            </view>
            <view class="tag" v-if="!profile.orgStructureParsed || profile.orgStructureParsed.length === 0">
              暂无
            </view>
          </view>
        </view>

        <view class="divider"></view>

        <view class="info-item">
          <view class="label-row">
            <u-icon name="checkmark-circle-fill" color="#3B82F6" size="18"></u-icon>
            <text class="info-label">核心职能</text>
          </view>
          <text class="info-content">{{ profile.coreFunctions || '暂无' }}</text>
        </view>
      </view>

      <!-- Contact Grid -->
      <view class="contact-section">
        <text class="section-header" v-if="profile.contactUsParsed.length != 0">联系我们</text>
        <view class="contact-grid">
          <view class="contact-box" v-for="(item, index) in profile.contactUsParsed" :key="index"
            @click="makeCall(item.phone)">
            <view class="contact-info">
              <text class="contact-name">{{ item.name }}</text>
              <text class="contact-role">{{ item.distraction || '业务联系人' }}</text>
            </view>
            <view class="call-btn">
              <u-icon name="phone-fill" color="#fff" size="14"></u-icon>
            </view>
          </view>
        </view>
      </view>

      <!-- Follow Us Section -->
      <view class="card section-card follow-section">
        <view class="section-header">
          <text class="section-title">友情链接</text>
        </view>
        <a class="studio-link-card"
          href="https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzIxNTE0MjMzNw==#wechat_redirect"
          style="text-decoration: none;">
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
      </view>

    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getStudioProfile } from "@/api/intro.js";

const profile = ref({
  title: "",
  contentHtml: "",
  coverUrl: "",
  leaderName: "",
  leaderIntro: "",
  orgStructureParsed: [],
  coreFunctions: "",
  contactUsParsed: [],
});
const loading = ref(true);

const processRichText = (html) => {
  if (!html) return "";
  // 为图片添加宽度 100% 的样式，防止溢出
  return html.replace(/<img/gi, '<img style="max-width:100%;height:auto;display:block;"');
};

const fetchProfile = async () => {
  try {
    const res = await getStudioProfile();
    if (res.code === 0 || res.code === 200) {
      const data = res.data || {};
      if (data.contentHtml) {
        data.contentHtml = processRichText(data.contentHtml);
      }

      // Parse JSON strings
      try {
        if (data.orgStructure) {
          data.orgStructureParsed = JSON.parse(data.orgStructure);
        }
        if (data.contactUs) {
          data.contactUsParsed = JSON.parse(data.contactUs);
        }
      } catch (e) {
        console.error("Parse JSON failed:", e);
      }
      profile.value = data;
    }
  } finally {
    loading.value = false;
  }
};

onLoad(() => {
  fetchProfile();
});

const makeCall = (phoneNumber) => {
  uni.makePhoneCall({
    phoneNumber: phoneNumber
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
  padding: 2rpx 30rpx 30rpx;
  padding-bottom: 60rpx;
  position: relative;
  /* Ensure z-index works */
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

/* Header */
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 28rpx 0 40rpx;
  position: relative;
  z-index: 1;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.page-title {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 48rpx;
  color: #1F2937;
  letter-spacing: 2rpx;
}

.deco-dot {
  width: 12rpx;
  height: 12rpx;
  background-color: #3B82F6;
  border-radius: 50%;
  opacity: 0.8;
}

.subtitle {
  font-size: 20rpx;
  color: #9CA3AF;
  margin-top: 10rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
}

.content-wrapper {
  animation: fadeIn 0.6s ease-out;
  position: relative;
  z-index: 1;
}

/* Common Card Styles */
.card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.card-header {
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
}

.title-line {
  width: 6rpx;
  height: 24rpx;
  background: linear-gradient(to bottom, #4facfe, #00f2fe);
  margin-right: 12rpx;
  border-radius: 4rpx;

}

.card-title {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 32rpx;
  color: #1F2937;
}

.intro-paragraph {
  color: #4B5563;
  line-height: 1.8;
  font-size: 28rpx;
  text-align: justify;
}

/* Image */
.image-section {
  margin-top: 24rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  /* Optional: slight shadow for the image itself */
}

.diagram-image {
  width: 100%;
  display: block;
}

/* Info List Card */
.info-card {
  padding-top: 40rpx;
  padding-bottom: 40rpx;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.info-label {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 30rpx;
  color: #374151;
}

.info-content {
  color: #4B5563;
  font-size: 28rpx;
  line-height: 1.6;
  padding-left: 48rpx;
}

.highlight {
  font-weight: 600;
  color: #111827;
  font-size: 32rpx;
}

.info-desc {
  font-size: 24rpx;
  color: #6B7280;
  padding-left: 48rpx;
  margin-top: 4rpx;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding-left: 48rpx;
}

.tag {
  background-color: #EBF5FF;
  color: #3B82F6;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 100rpx;
  font-weight: 500;
}

.divider {
  height: 2rpx;
  background-color: #F3F4F6;
  margin: 30rpx 0;
}

/* Contact Section */
.section-header {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 34rpx;
  color: #1F2937;
  margin-bottom: 16rpx;
  margin-left: 10rpx;
  display: block;
}

.contact-grid {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.contact-box {
  flex: 1;
  background: #ffffff;
  padding: 24rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
}

.contact-box:active {
  transform: scale(0.98);
  background-color: #F9FAFB;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 4rpx;
}

.contact-role {
  font-size: 22rpx;
  color: #9CA3AF;
}

.call-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #60A5FA, #3B82F6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 320rpx;
  gap: 20rpx;

  .loading-text {
    font-size: 28rpx;
    color: #9CA3AF;
  }
}

/* Studio Link Card Styles from Index */
.studio-link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx 0;
  text-decoration: none;
  color: inherit;
}

.studio-link-card:active {
  opacity: 0.7;
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

/* Section Card Margin */
.follow-section {
  margin: 40rpx 0 20rpx;
}

.section-title {
  font-family: 'DingTalk JinBuTi', sans-serif;
  font-size: 34rpx;
  font-weight: bold;
  font-style: italic;
  position: relative;
  padding-left: 20rpx;
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
  background: linear-gradient(to bottom, #4facfe, #00f2fe);
  border-radius: 4rpx;
}
</style>