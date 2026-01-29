<template>
  <view class="container">
    <view class="global-background"></view>
    <view class="status-bar-placeholder"></view>
    <!-- Loading State -->
    <view v-if="loading" class="loading-state">
      <u-loadmore status="loading" loading-text="正在加载中..." iconSize="18" fontSize="16" />
    </view>
    <view class="content-wrapper" v-else>
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
          <text class="info-content highlight">{{
            profile.leaderName || "暂无"
          }}</text>
          <text class="info-desc">{{ profile.leaderIntro || "暂无" }}</text>
        </view>

        <view class="divider"></view>

        <!-- Contact Us (Moved here) -->
        <view class="info-item">
          <view class="label-row space-between">
            <view class="label-left">
              <u-icon name="phone-fill" color="#3B82F6" size="18"></u-icon>
              <text class="info-label">联系我们</text>
            </view>
            <view class="follow-btn mini" v-if="profile.wechatUrl" @click="goToWechat(profile.wechatUrl)">
              <text>关注</text>
            </view>
          </view>
          <view class="contact-grid-modern" v-if="profile.contactUsParsed && profile.contactUsParsed.length > 0">
            <view class="contact-card-mini" v-for="(item, index) in profile.contactUsParsed" :key="index"
              @click="makeCall(item.phone)">
              <view class="contact-main-info">
                <text class="name">{{ item.name }}</text>
                <text class="role">{{ item.distraction || "业务联系人" }}</text>
              </view>
              <u-icon name="phone-fill" color="#3B82F6" size="16"></u-icon>
            </view>
          </view>
          <text class="info-content" v-else>暂无联系方式</text>
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
            <view class="tag" v-if="
              !profile.orgStructureParsed ||
              profile.orgStructureParsed.length === 0
            ">
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
          <text class="info-content">{{
            profile.coreFunctions || "暂无"
          }}</text>
        </view>
      </view>

      <!-- Mock Gallery Sections -->
      <view class="gallery-section">
        <view class="card gallery-card" v-for="(item, index) in galleryList" :key="item.id" @click="goToDetail(item)">
          <view class="card-header">
            <view class="title-line"></view>
            <text class="card-title">{{ item.title }}</text>
          </view>

          <view class="gallery-content">
            <view class="gallery-image-wrapper">
              <image class="gallery-image" :src="item.coverUrl" mode="aspectFill" lazy-load></image>
              <view class="image-overlay">
                <text class="overlay-tag">专题展示</text>
              </view>
            </view>
            <view class="gallery-info">
              <text class="gallery-desc">{{ item.summary }}</text>
              <view class="gallery-footer">
                <text class="date">{{ formatDate(item.createdAt, 'YYYY-MM-DD') }}</text>
                <view class="more-link">
                  <text>查看更多</text>
                  <u-icon name="arrow-right" size="12" color="#3B82F6"></u-icon>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { getStudioProfileById, getStudioIntroArticles } from "@/api/index.js";
import { formatDate } from "@/utils/formatDate.js";

const props = defineProps({
  studioId: [String, Number],
});

const profile = ref({
  title: "",
  contentHtml: "",
  coverUrl: "",
  leaderName: "",
  leaderIntro: "",
  orgStructureParsed: [],
  coreFunctions: "",
  contactUsParsed: [],
  wechatUrl: "",
});
const loading = ref(true);

const galleryList = ref([]);

const processRichText = (html) => {
  if (!html) return "";
  // 为图片添加宽度 100% 的样式，防止溢出
  return html.replace(
    /<img/gi,
    '<img style="max-width:100%;height:auto;display:block;"',
  );
};

const fetchProfile = async () => {
  loading.value = true;
  try {
    let res;
    if (props.studioId) {
      res = await getStudioProfileById(props.studioId);
    } else {
    }

    if (res.code === 0 || res.code === 200) {
      let data = res.data || {};
      // Handle the case where data might be an array (as per schema) or object (as per example)
      if (Array.isArray(data)) {
        data = data.length > 0 ? data[0] : {};
      }

      if (data.contentHtml) {
        data.contentHtml = processRichText(data.contentHtml);
      }

      // Initialize with default empty arrays to prevent template errors
      data.orgStructureParsed = data.orgStructureParsed || [];
      data.contactUsParsed = data.contactUsParsed || [];

      // Parse JSON strings
      try {
        if (data.orgStructure && typeof data.orgStructure === "string") {
          data.orgStructureParsed = JSON.parse(data.orgStructure);
        } else if (Array.isArray(data.orgStructure)) {
          data.orgStructureParsed = data.orgStructure;
        }

        let contactInfo = null;
        if (data.contactUs && typeof data.contactUs === "string") {
          contactInfo = JSON.parse(data.contactUs);
        } else {
          contactInfo = data.contactUs;
        }

        if (contactInfo) {
          if (Array.isArray(contactInfo)) {
            data.contactUsParsed = contactInfo;
            // Search inside the array for a wechatUrl
            const foundWechat = contactInfo.find((c) => c.wechatUrl)?.wechatUrl;
            if (foundWechat) {
              data.wechatUrl = foundWechat;
            }
          } else if (typeof contactInfo === "object") {
            // If contactUs is an object, it might contain contacts array and wechatUrl
            data.contactUsParsed = contactInfo.contacts || [];
            data.wechatUrl = contactInfo.wechatUrl || data.wechatUrl || "";
            // Also check inside contacts array if present
            if (Array.isArray(contactInfo.contacts)) {
              const foundWechat = contactInfo.contacts.find(
                (c) => c.wechatUrl,
              )?.wechatUrl;
              if (foundWechat) data.wechatUrl = foundWechat;
            }
          }
        }
      } catch (e) {
        console.error("Parse JSON failed:", e);
      }

      // Merge with default profile structure
      profile.value = {
        title: "",
        contentHtml: "",
        coverUrl: "",
        leaderName: "",
        leaderIntro: "",
        orgStructureParsed: [],
        coreFunctions: "",
        contactUsParsed: [],
        wechatUrl: "",
        ...data,
      };
    }
  } finally {
    loading.value = false;
  }
};

const fetchIntroArticles = async () => {
  if (!props.studioId) return;
  try {
    const res = await getStudioIntroArticles(props.studioId);
    if (res.code === 0 || res.code === 200) {
      galleryList.value = res.data || [];
    }
  } catch (e) {
    console.error("Fetch intro articles failed:", e);
  }
};

watch(
  () => props.studioId,
  () => {
    fetchProfile();
    fetchIntroArticles();
  },
);

onMounted(() => {
  fetchProfile();
  fetchIntroArticles();
});

const goToDetail = (item) => {
  // We pass the whole object as a stringified parameter. 
  // Note: For very large HTML content, this might hit URL length limits in some browsers.
  // But for standard intro articles, it's usually fine.
  uni.navigateTo({
    url: `/pages/intro/compontes/introDetail/introDetail?data=${encodeURIComponent(JSON.stringify(item))}`
  });
};

const makeCall = (phoneNumber) => {
  uni.makePhoneCall({
    phoneNumber: phoneNumber,
  });
};

const goToWechat = (url) => {
  if (!url) return;
  // #ifdef H5
  window.location.href = url;
  // #endif
  // #ifndef H5
  uni.navigateTo({
    url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
  });
  // #endif
};
</script>

<style lang="scss" scoped>
@font-face {
  font-family: "DingTalk JinBuTi";
  src: url("/static/font/钉钉进步体0111/DingTalk JinBuTi.ttf");
}

.container {
  display: block;
  width: 100%;
  height: auto !important;
  min-height: min-content;
  padding: 10rpx 20rpx 300rpx !important;
  /* Extremely high padding for safety */
  position: relative;
  overflow: visible !important;
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
  font-family: "DingTalk JinBuTi", sans-serif;
  font-size: 48rpx;
  color: #1f2937;
  letter-spacing: 2rpx;
}

.deco-dot {
  width: 12rpx;
  height: 12rpx;
  background-color: #3b82f6;
  border-radius: 50%;
  opacity: 0.8;
}

.subtitle {
  font-size: 20rpx;
  color: #9ca3af;
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
  font-family: "DingTalk JinBuTi", sans-serif;
  font-size: 32rpx;
  color: #1f2937;
}

.intro-paragraph {
  color: #4b5563;
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

  &.space-between {
    justify-content: space-between;
    width: 100%;
  }

  .label-left {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
}

.info-label {
  font-family: "DingTalk JinBuTi", sans-serif;
  font-size: 30rpx;
  color: #374151;
}

.info-content {
  color: #4b5563;
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
  color: #6b7280;
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
  background-color: #ebf5ff;
  color: #3b82f6;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 100rpx;
  font-weight: 500;
}

.divider {
  height: 2rpx;
  background-color: #f3f4f6;
  margin: 30rpx 0;
}

/* Contact Section */
.section-header {
  font-family: "DingTalk JinBuTi", sans-serif;
  font-size: 34rpx;
  color: #1f2937;
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
  background-color: #f9fafb;
}

.contact-grid-modern {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-left: 48rpx;
}

.contact-card-mini {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 12rpx;
  transition: all 0.2s;

  .contact-main-info {
    display: flex;
    flex-direction: column;

    .name {
      font-size: 28rpx;
      font-weight: 600;
      color: #1f2937;
    }

    .role {
      font-size: 20rpx;
      color: #9ca3af;
    }
  }

  &:active {
    background: rgba(59, 130, 246, 0.1);
    transform: scale(0.98);
  }
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

/* Leader Row with Follow Button */
.leader-row-item {
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;

  .leader-main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.follow-btn.mini {
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  flex-shrink: 0;
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
  font-family: "DingTalk JinBuTi", sans-serif;
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

/* Gallery Section Styles */
.gallery-section {
  padding-bottom: 40rpx;
}

.gallery-card {
  overflow: hidden;
  border: 1rpx solid rgba(0, 0, 0, 0.02);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.99);
  }
}

.gallery-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.gallery-image-wrapper {
  position: relative;
  width: 100%;
  height: 320rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #f3f4f6;
}

.gallery-image {
  width: 100%;
  height: 100%;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  z-index: 2;
}

.overlay-tag {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 20rpx;
  padding: 4rpx 16rpx;
  border-radius: 100rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.gallery-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.gallery-desc {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}

.gallery-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
  padding-top: 10rpx;
  border-top: 1rpx solid #f3f4f6;
}

.date {
  font-size: 24rpx;
  color: #9ca3af;
}

.more-link {
  display: flex;
  align-items: center;
  gap: 4rpx;

  text {
    font-size: 24rpx;
    color: #3b82f6;
    font-weight: 500;
  }
}
</style>
