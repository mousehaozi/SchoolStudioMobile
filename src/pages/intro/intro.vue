<template>
  <view class="container">
    <view class="global-background"></view>

    <!-- Custom Navigation Section -->
    <view class="fixed-top-box">
      <view class="custom-navbar">
        <view class="navbar-left" @click="goBack">
          <u-icon name="arrow-left" size="20" color="#1e293b"></u-icon>
        </view>
        <text class="navbar-title">{{ currentName || '工作室详情' }}</text>
        <view class="navbar-right"></view>
      </view>

      <view class="tabs-subnav">
        <u-tabs :list="tabList" :current="currentTab" @change="handleTabChange" :scrollable="false" lineColor="#3b82f6"
          lineWidth="30" activeStyle="{ color: '#3b82f6', fontWeight: 'bold' }"
          inactiveStyle="{ color: '#64748b' }"></u-tabs>
      </view>
    </view>

    <view class="nav-placeholder"></view>

    <!-- Loading State -->
    <view v-if="loading" class="loading-state">
      <u-loadmore status="loading" loading-text="正在加载中..." iconSize="18" fontSize="16" />
    </view>

    <!-- Tab Content -->
    <template v-else>
      <!-- Intro Tab (Tab 0) -->
      <view class="content-wrapper" v-if="currentTab === 0">
        <!-- Studio Profile Header -->
        <view class="card profile-header-card" v-if="profile.title || currentLevel">
          <view class="profile-main-info">
            <view class="title-row">
              <text class="studio-name-big">{{ profile.title || currentName || '创新工作室' }}</text>
            </view>
            <view class="badges-row">
              <view v-if="internalStudioLevel !== null" class="level-label"
                :class="internalStudioLevel === 0 ? 'national' : 'provincial'">
                <u-icon :name="internalStudioLevel === 0 ? 'star-fill' : 'integral-fill'" color="#ffffff"
                  size="14"></u-icon>
                <text class="level-text">{{ internalStudioLevel === 0 ? '国家级工作室' : '省级工作室' }}</text>
              </view>
              <view class="status-badge" v-if="profile.leaderName">
                <text>{{ profile.leaderName }} 领衔</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Main Intro Text -->
        <view class="card intro-card">
          <view class="card-header">
            <view class="title-line"></view>
            <text class="card-title">简介</text>
          </view>
          <view class="intro-paragraph">
            <u-parse :content="profile.contentHtml" v-if="profile.contentHtml"></u-parse>
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
            <text class="info-content highlight">{{ profile.leaderName || "暂无" }}</text>
            <text class="info-desc">{{ profile.leaderIntro || "暂无" }}</text>
          </view>

          <view class="divider"></view>

          <!-- Contact Us -->
          <view class="info-item">
            <view class="label-row space-between">
              <view class="label-left">
                <u-icon name="phone-fill" color="#3B82F6" size="18"></u-icon>
                <text class="info-label">联系我们</text>
              </view>
            </view>
            <view class="contact-grid-modern" v-if="profile.contactUsParsed && profile.contactUsParsed.length > 0">
              <view class="contact-card-mini" v-for="(item, index) in profile.contactUsParsed" :key="index"
                @click="makeCall(item.phone)">
                <view class="contact-main-info">
                  <view class="name-row">
                    <text class="name">{{ item.name }}</text>
                    <view v-if="item.wechatUrl" class="follow-btn-inline" @click.stop="goToWechat(item.wechatUrl)">
                      <u-icon name="plus" color="#ffffff" size="10"></u-icon>
                      <text>关注</text>
                    </view>
                  </view>
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
            <text class="info-content">{{ profile.coreFunctions || "暂无" }}</text>
          </view>
        </view>

        <!-- Mock Gallery Sections -->
        <view class="gallery-section">
          <view class="card gallery-card" v-for="(item, index) in galleryList" :key="item.id"
            @click="goToArticleDetail(item)">
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

      <!-- IntegraEdu Tab (Tab 1) -->
      <view class="content-wrapper" v-if="currentTab === 1">
        <StudioIntegraEdu :studioId="currentId" />
      </view>

      <!-- Question Tab (Tab 2) -->
      <view class="content-wrapper" v-if="currentTab === 2">
        <StudioQuestion :studioId="currentId" />
      </view>

      <!-- Dynamics Tab (Tab 3) -->
      <view class="content-wrapper dynamics-tab" v-if="currentTab === 3">
        <view class="dynamics-list" v-if="studioNewsList.length > 0">
          <view class="dynamic-item" v-for="news in studioNewsList" :key="news.id" @click="goToNewsDetail(news)">
            <view class="dynamic-image-wrap">
              <image :src="news.coverUrl || '/static/appLogo.png'" class="dynamic-image" mode="aspectFill"></image>
            </view>
            <view class="dynamic-content">
              <text class="dynamic-title">{{ news.title }}</text>
              <view class="dynamic-meta-row">
                <u-icon name="clock" size="12" color="#999"></u-icon>
                <text class="meta-text">{{ formatDate(news.publishedAt, 'YYYY-MM-DD HH:mm') }}</text>
              </view>
              <view class="dynamic-bottom-row">
                <view class="tags">
                  <text v-for="(tag, tIdx) in getTags(news.tags)" :key="tIdx" class="tag">{{ tag }}</text>
                </view>
                <view class="views">
                  <u-icon name="eye" size="14" color="#999"></u-icon>
                  <text class="view-count">{{ news.viewCount || 0 }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="nomore-box">
            <text>没有更多了...</text>
          </view>
        </view>
        <view class="empty-state" v-else>
          <text>暂无动态内容</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getStudioProfileById, getStudioIntroArticles, getStudioNews } from "@/api/index.js";
import { formatDate } from "@/utils/formatDate.js";
import StudioIntegraEdu from "./compontes/StudioIntegraEdu.vue";
import StudioQuestion from "./compontes/StudioQuestion.vue";

const props = defineProps({
  studioId: [String, Number],
  level: String,
  studioName: String,
});

const internalStudioId = ref(null);
const internalLevel = ref("");
const internalStudioName = ref("");
const internalStudioLevel = ref(null);

onLoad((options) => {
  if (options.id) {
    internalStudioId.value = options.id;
    internalLevel.value = options.level ? decodeURIComponent(options.level) : "";
    internalStudioName.value = options.name ? decodeURIComponent(options.name) : "";
    internalStudioLevel.value = options.studioLevel !== undefined ? parseInt(options.studioLevel) : null;
    if (options.tab) {
      currentTab.value = parseInt(options.tab);
    }
  }
});

const tabList = ref([
  { name: '工作室介绍' },
  { name: '产教融合' },
  { name: '问题咨询' },
  { name: '工作动态' }
]);
const currentTab = ref(0);
const studioNewsList = ref([]);

const currentId = computed(() => props.studioId || internalStudioId.value);
const currentLevel = computed(() => props.level || internalLevel.value);
const currentName = computed(() => props.studioName || internalStudioName.value);

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
  return html
    .replace(
      /<img/gi,
      '<img style="max-width:100%;height:auto;display:block;"'
    )
    .replace(
      /<video/gi,
      '<video style="width:100%;height:auto;display:block;"'
    );
};

const fetchProfile = async () => {
  loading.value = true;
  try {
    if (!currentId.value) return;
    const res = await getStudioProfileById(currentId.value);
    if (res.code === 0 || res.code === 200) {
      let data = res.data || {};
      if (Array.isArray(data)) data = data[0] || {};

      if (data.contentHtml) data.contentHtml = processRichText(data.contentHtml);
      data.orgStructureParsed = data.orgStructureParsed || [];
      data.contactUsParsed = data.contactUsParsed || [];

      try {
        if (data.orgStructure && typeof data.orgStructure === "string") {
          data.orgStructureParsed = JSON.parse(data.orgStructure);
        }
        if (data.contactUs && typeof data.contactUs === "string") {
          data.contactUsParsed = JSON.parse(data.contactUs);
        }
      } catch (e) { console.error(e); }

      profile.value = { ...profile.value, ...data };
    }
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  uni.navigateBack();
};

const fetchStudioNews = async () => {
  if (!currentId.value) return;
  try {
    const res = await getStudioNews(currentId.value, { page: 1, size: 20 });
    if (res.code === 0 || res.code === 200) {
      studioNewsList.value = res.data.records || [];
    }
  } catch (e) {
    console.error("Fetch studio news failed:", e);
  }
};

const fetchIntroArticles = async () => {
  if (!currentId.value) return;
  try {
    const res = await getStudioIntroArticles(currentId.value);
    if (res.code === 0 || res.code === 200) {
      galleryList.value = res.data || [];
    }
  } catch (e) {
    console.error("Fetch intro articles failed:", e);
  }
};

const handleTabChange = (item) => {
  currentTab.value = item.index;
  if (currentTab.value === 3 && studioNewsList.value.length === 0) {
    fetchStudioNews();
  }
};

const getTags = (tagsStr) => {
  if (!tagsStr) return [];
  return tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t !== '');
};

const goToNewsDetail = (news) => {
  uni.navigateTo({
    url: `/pages/dynamic/compontes/dynamicDetail/dynamicDetail?data=${news.id}&studioId=${currentId.value}`
  });
};

const goToArticleDetail = (item) => {
  uni.navigateTo({
    url: `/pages/intro/compontes/introDetail/introDetail?data=${encodeURIComponent(JSON.stringify(item))}`
  });
};

const makeCall = (phoneNumber) => {
  uni.makePhoneCall({ phoneNumber });
};

const goToWechat = (url) => {
  if (!url) return;
  // #ifdef H5
  window.location.href = url;
  // #endif
  // #ifndef H5
  uni.navigateTo({ url: `/pages/webview/webview?url=${encodeURIComponent(url)}` });
  // #endif
};

onMounted(() => {
  fetchProfile();
  fetchIntroArticles();
  if (currentTab.value === 3) fetchStudioNews();
});
</script>

<style lang="scss" scoped>
@font-face {
  font-family: "DingTalk JinBuTi";
  src: url("/static/font/钉钉进步体0111/DingTalk JinBuTi.ttf");
}

.container {
  min-height: 100vh;
  background: transparent;
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
  z-index: -1;
  pointer-events: none;
}

.fixed-top-box {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  z-index: 1001;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
  padding-top: var(--status-bar-height);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.custom-navbar {
  height: 80rpx;
  display: flex;
  background: transparent;
  align-items: center;
  justify-content: space-between;
  padding-left: 20rpx;
  padding-right: 20rpx;

  .navbar-left {
    width: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .navbar-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1e293b;
    flex: 1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .navbar-right {
    width: 60rpx;
  }
}

.tabs-subnav {
  height: 88rpx;
  display: flex;
  align-items: center;
}

.nav-placeholder {
  height: calc(168rpx + var(--status-bar-height));
}

.content-wrapper {
  padding: 32rpx 24rpx;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.4s ease-out;
}

.card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(255, 255, 255, 0.5);
}

.profile-header-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.7) 100%);
  border-left: 8rpx solid #3b82f6;

  .studio-name-big {
    font-family: "DingTalk JinBuTi", sans-serif;
    font-size: 38rpx;
    font-weight: bold;
    color: #1e293b;
  }

  .badges-row {
    display: flex;
    gap: 16rpx;
    margin-top: 20rpx;
    align-items: center;
  }

  .level-label {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 6rpx 20rpx;
    border-radius: 100rpx;
    color: #fff;
    font-size: 22rpx;
    font-weight: bold;
    width: fit-content;

    &.national {
      background: rgba(255, 122, 0, 0.85);
    }

    &.provincial {
      background: rgba(0, 122, 255, 0.85);
    }
  }

  .status-badge {
    background: #f1f5f9;
    color: #64748b;
    font-size: 22rpx;
    padding: 6rpx 20rpx;
    border-radius: 100rpx;
  }
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .title-line {
    width: 6rpx;
    height: 24rpx;
    background: #3b82f6;
    margin-right: 12rpx;
    border-radius: 4rpx;
  }

  .card-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #1f2937;
  }
}

.intro-paragraph {
  font-size: 28rpx;
  color: #4b5563;
  line-height: 1.6;
}

.info-item {
  margin-bottom: 30rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .label-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 12rpx;

    .info-label {
      font-size: 28rpx;
      font-weight: bold;
      color: #374151;
    }
  }

  .info-content {
    font-size: 28rpx;
    color: #4b5563;
    padding-left: 44rpx;

    &.highlight {
      font-weight: bold;
      color: #111827;
    }
  }

  .info-desc {
    font-size: 24rpx;
    color: #9ca3af;
    padding-left: 44rpx;
    margin-top: 4rpx;
  }
}

.divider {
  height: 1rpx;
  background: #f1f5f9;
  margin: 24rpx 0;
}

.contact-grid-modern {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-left: 44rpx;

  .contact-card-mini {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    padding: 16rpx 24rpx;
    border-radius: 12rpx;

    .name {
      font-size: 26rpx;
      font-weight: bold;
      color: #1f2937;
    }

    .role {
      font-size: 22rpx;
      color: #9ca3af;
    }
  }
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding-left: 44rpx;

  .tag {
    background: #eff6ff;
    color: #3b82f6;
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 100rpx;
  }
}

/* Gallery and Dynamics List Styles */
.gallery-card {
  padding: 0;
  overflow: hidden;

  .card-header {
    padding: 30rpx 30rpx 0;
  }

  .gallery-content {
    padding: 24rpx;
  }

  .gallery-image-wrapper {
    width: 100%;
    height: 300rpx;
    position: relative;
    border-radius: 16rpx;
    overflow: hidden;

    .gallery-image {
      width: 100%;
      height: 100%;
    }

    .image-overlay {
      position: absolute;
      top: 16rpx;
      left: 16rpx;
      background: rgba(0, 0, 0, 0.5);
      padding: 4rpx 12rpx;
      border-radius: 8rpx;

      .overlay-tag {
        color: #fff;
        font-size: 20rpx;
      }
    }
  }

  .gallery-info {
    margin-top: 16rpx;

    .gallery-desc {
      font-size: 26rpx;
      color: #64748b;
      line-height: 1.5;
    }

    .gallery-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 16rpx;

      .date {
        font-size: 22rpx;
        color: #94a3b8;
      }

      .more-link {
        display: flex;
        align-items: center;
        gap: 4rpx;
        color: #3b82f6;
        font-size: 22rpx;
      }
    }
  }
}

.dynamic-item {
  display: flex;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);

  .dynamic-image-wrap {
    width: 180rpx;
    height: 180rpx;
    border-radius: 16rpx;
    margin-right: 20rpx;
    flex-shrink: 0;

    .dynamic-image {
      width: 100%;
      height: 100%;
      border-radius: 16rpx;
    }
  }

  .dynamic-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .dynamic-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #1e293b;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      overflow: hidden;
    }

    .dynamic-meta-row {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 22rpx;
      color: #94a3b8;
    }

    .dynamic-bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .tags {
        display: flex;
        gap: 8rpx;

        .tag {
          font-size: 20rpx;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.08);
          padding: 2rpx 12rpx;
          border-radius: 6rpx;
        }
      }

      .views {
        display: flex;
        align-items: center;
        gap: 4rpx;
        font-size: 22rpx;
        color: #94a3b8;
      }
    }
  }
}

.empty-state,
.nomore-box {
  text-align: center;
  padding: 60rpx;
  color: #94a3b8;
  font-size: 26rpx;
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
  justify-content: center;
  padding-top: 200rpx;
}
</style>
