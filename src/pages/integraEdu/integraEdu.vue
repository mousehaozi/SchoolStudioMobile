<template>
  <view class="container">
    <!-- Global Background -->
    <view class="global-background"></view>

    <!-- Topic Tabs (Using u-tabs for consistent style) -->
    <view class="tabs-container">
      <u-tabs :list="topicList" :current="currentTabIndex" @change="handleTabChange" :scrollable="true" lineColor="#3b82f6"
        lineWidth="30" activeStyle="{ color: '#3b82f6', fontWeight: 'bold' }"
        inactiveStyle="{ color: '#64748b' }"></u-tabs>
    </view>

    <!-- Loading State -->
    <view v-if="initialLoading" class="loading-state">
      <u-loadmore status="loading" loading-text="正在加载中..." iconSize="18" fontSize="16" />
    </view>

    <template v-else>
      <!-- Article List (Now standard view to use parent scroll) -->
      <view class="article-list">
        <view v-for="(item, index) in articleList" :key="index" class="article-card" @click="goToDetail(item)">
          <!-- Title Section -->
          <text class="article-title">{{ item.title }}</text>

          <!-- Middle Body Section -->
          <view class="article-main">
            <image v-if="item.coverUrl" :src="item.coverUrl" mode="aspectFill" class="article-cover"></image>
            <view class="article-content">
              <view class="article-desc">
                <u-parse :content="processRichText(item.contentHtml)"></u-parse>
              </view>
            </view>
          </view>

          <!-- Bottom Footer Row -->
          <view class="article-footer-new">
            <view class="tags-area">
              <text v-for="(tag, tIndex) in getTags(item.tags)" :key="tIndex" class="mini-tag">{{ tag }}</text>
            </view>
            <view class="meta-area">
              <view class="meta-box">
                <u-icon name="clock" size="12" color="#999"></u-icon>
                <text class="value">{{ formatDate(item.publishedAt, "YYYY-MM-DD") }}</text>
              </view>
              <view class="meta-box">
                <u-icon name="eye" size="12" color="#999"></u-icon>
                <text class="value">{{ item.viewCount || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="no-more">
          <u-loadmore :status="noMore ? 'nomore' : (loading ? 'loading' : 'loadmore')" :loading-text="'正在加载中...'"
            :nomore-text="'没有更多了...'" iconSize="16" fontSize="12" color="#999" />
        </view>
      </view>
      <view class="bottom-spacer"></view>
    </template>
    <MyTabbar activePath="/pages/integraEdu/integraEdu" />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import uIcon from "uview-plus/components/u-icon/u-icon.vue";
import { getIeArticle } from "@/api/integraEdu.js";
import { getIeTopic } from "@/api/index.js";
import { formatDate } from "@/utils/formatDate.js";

const currentTopicId = ref('');
const currentTopicName = ref('');
const topicList = ref([]);
const articleList = ref([]);
const total = ref(0);
const page = ref(1);
const size = ref(10);
const loading = ref(false);
const noMore = ref(false);
const initialLoading = ref(true);
const currentTabIndex = ref(0);

import { onMounted } from 'vue';

const props = defineProps({
  id: [String, Number],
  name: String,
  studioId: [String, Number]
});

import { watch } from 'vue';

watch(() => props.studioId, () => {
  fetchTopics();
});

onMounted(() => {
  if (props.id) {
    currentTopicId.value = props.id;
    currentTopicName.value = props.name || '';
  }
  fetchTopics();
});

const fetchTopics = async () => {
  try {
    const res = await getIeTopic();
    if (res.code === 0 || res.code === 200) {
      topicList.value = res.data;

      // 匹配从首页跳转过来的 ID
      if (currentTopicId.value) {
        const found = topicList.value.find(t =>
          (t.id && String(t.id) === String(currentTopicId.value)) ||
          (t.name === currentTopicId.value)
        );
        if (found) {
          currentTopicId.value = found;
          currentTopicName.value = found.name;
        }
      }

      // 如果没有匹配到或没有传参，默认选中第一个
      if ((!currentTopicId.value || typeof currentTopicId.value !== 'object') && topicList.value.length > 0) {
        currentTopicId.value = topicList.value[0];
        currentTopicName.value = topicList.value[0].name;
        currentTabIndex.value = 0;
      }

      fetchArticles();
    }
  } catch (err) {
    console.error(err);
  }
};

const fetchArticles = async (isMore = false) => {
  if (loading.value) return;
  loading.value = true;

  try {
    const res = await getIeArticle({
      page: page.value,
      size: size.value,
      topicId: typeof currentTopicId.value === 'object' ? currentTopicId.value.id : currentTopicId.value
    });

    if (res.code === 0 || res.code === 200) {
      const records = res.data.records || [];
      if (isMore) {
        articleList.value = [...articleList.value, ...records];
      } else {
        articleList.value = records;
      }
      total.value = res.data.total || 0;
      if (records.length < size.value) {
        noMore.value = true;
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
    initialLoading.value = false;
  }
};

const handleTabChange = (item) => {
  switchTopic(topicList.value[item.index], item.index);
};

const switchTopic = (topic, index) => {
  if (currentTopicId.value === topic) return;
  currentTopicId.value = topic;
  currentTopicName.value = topic.name;
  currentTabIndex.value = index;
  page.value = 1;
  noMore.value = false;
  articleList.value = [];
  fetchArticles();
};

const loadMore = () => {
  if (noMore.value || loading.value) return;
  page.value++;
  fetchArticles(true);
};

defineExpose({
  loadMore
});

const goBack = () => {
  uni.navigateBack();
};

const getTags = (tagsStr) => {
  if (!tagsStr) return [];
  // 同时支持英文逗号和中文逗号分隔，并去除空格
  return tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t !== '');
};

const goToDetail = (item) => {
  uni.navigateTo({
    url: `/pages/integraEdu/compontes/integraEduDetail/integraEduDetail?id=${item.id}`,
  });
};

const processRichText = (html) => {
  if (!html) return '暂无描述内容';
  // 移除图片标签
  let content = html.replace(/<img[^>]*>/gi, '');
  // 将常见的换行块级标签替换为空格
  content = content.replace(/<\/p>|<\/div>|<br\s*\/?>/gi, ' ');
  // 移除内联样式中的 font-weight 和 font-size
  content = content.replace(/font-weight:[^;]+;?/gi, '');
  content = content.replace(/font-size:[^;]+;?/gi, '');
  // 去除多余的换行符和回车符
  content = content.replace(/[\r\n]/g, ' ');
  return content;
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: #f8f9fb;
  min-height: 100vh;
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
  opacity: 0.3;
  filter: blur(15px);
  transform: scale(1.1);
  /* Prevents white edges from blur */
  pointer-events: none;
  z-index: 0;
}

.tabs-container {
  width: 100%;
  background-color: #fff;
  z-index: 10;
  border-bottom: 1rpx solid #f0f0f0;
}


.article-list {
  flex: 1;
  padding: 30rpx 30rpx 20rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.article-card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #ffffff 0%, #fdfdff 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
  border: 1rpx solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  .article-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1a1a1a;
    line-height: 1.4;
    margin-bottom: 20rpx;
    display: block;
  }

  /* Main Body Layout */
  .article-main {
    display: flex;
    gap: 20rpx;
    margin-bottom: 24rpx;
    align-items: flex-start;
  }

  .article-cover {
    width: 200rpx;
    height: 140rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
    background-color: #f7f8fa;
    display: block;
    object-fit: cover;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  }

  .article-content {
    flex: 1;
    min-width: 0;

    .article-desc {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      overflow: hidden;
      text-align: justify;

      :deep(*) {
        display: inline !important;
        font-weight: normal !important;
        font-size: 26rpx !important;
        color: #666 !important;
        background: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  }

  /* Footer Layout */
  .article-footer-new {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx solid rgba(0, 0, 0, 0.03);

    .tags-area {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      flex: 1;

      .mini-tag {
        font-size: 20rpx;
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.08);
        padding: 4rpx 16rpx;
        border-radius: 6rpx;
        font-weight: 500;
      }
    }

    .meta-area {
      display: flex;
      align-items: center;
      gap: 20rpx;
      margin-left: 20rpx;

      .meta-box {
        display: flex;
        align-items: center;
        gap: 6rpx;

        .value {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}

.no-more {
  text-align: center;

  text {
    font-size: 24rpx;
    color: #999;
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

.bottom-spacer {
  height: 150rpx;
}
</style>
