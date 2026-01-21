<template>
  <view class="container">
    <!-- Global Background -->
    <view class="global-background"></view>

    <!-- Content Area -->
    <view class="content-wrapper">
      <!-- Title Card -->
      <view class="card title-card">
        <text class="title">{{ detail.title || '加载中...' }}</text>
        <text class="publisher">{{ detail.publisher || '重庆工业职业技术大学' }}</text>
        <view class="tags">
          <text v-for="(tag, index) in getTags(detail.tags)" :key="index" class="tag">{{ tag }}</text>
        </view>
      </view>

      <!-- Info Card (Introduction) -->
      <view class="card info-card">
        <view class="section-title">
          <image src="/static/img/index/WorkRoom.webp" class="title-icon"></image>
          <text>简介</text>
        </view>
        <view class="rich-text-content">
          <rich-text :nodes="processRichText(detail.contentHtml)"></rich-text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getIeArticleDetail } from "@/api/integraEdu.js";
import { imgBaseUrl } from "@/utils/baseUrl.js";

const detail = ref({});
const articleId = ref('');

onLoad((options) => {
  if (options.id) {
    articleId.value = options.id;
    fetchDetail();
  }
});

const fetchDetail = async () => {
  try {
    const res = await getIeArticleDetail(articleId.value);
    if (res.code === 0 || res.code === 200) {
      detail.value = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch article detail:", err);
  }
};

const getTags = (tagsStr) => {
  if (!tagsStr) return [];
  return tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t !== '');
};

const processRichText = (html) => {
  if (!html) return '内容加载中...';
  
  const base = imgBaseUrl();
  // 使用正则表达式匹配 img 标签的 src 属性
  // 逻辑参考 formatImageUrl: 如果不是 http 开头且不是以 /static 开头，则拼接 base
  return html.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, (match, src) => {
    let newSrc = src;
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      // 确保路径正确拼接
      const prefix = src.startsWith('/') ? '' : '/';
      newSrc = base + prefix + src;
    }
    return match.replace(src, newSrc);
  });
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
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.title-card {
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
    margin-bottom: 24rpx;
    display: block;
  }

  .publisher {
    font-size: 30rpx;
    color: #666;
    margin-bottom: 30rpx;
    display: block;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .tag {
      background-color: #e6f7ff;
      color: #1890ff;
      font-size: 24rpx;
      padding: 8rpx 24rpx;
      border-radius: 40rpx;
    }
  }
}

.info-card {
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    
    .title-icon {
      width: 48rpx;
      height: 48rpx;
      margin-right: 16rpx;
    }
    
    text {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .rich-text-content {
    font-size: 30rpx;
    color: #444;
    line-height: 1.8;
    text-align: justify;
    
    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 12rpx;
      margin: 20rpx 0;
    }
    
    :deep(p) {
      margin-bottom: 20rpx;
    }
  }
}
</style>
