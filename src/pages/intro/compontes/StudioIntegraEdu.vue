<template>
  <view class="integra-container">
    <!-- Topic Tabs -->
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
      <!-- Article List -->
      <view class="article-list">
        <view v-for="(item, index) in articleList" :key="index" class="article-card" @click="goToDetail(item)">
          <text class="article-title">{{ item.title }}</text>
          <view class="article-main">
            <image v-if="item.coverUrl" :src="item.coverUrl" mode="aspectFill" class="article-cover"></image>
            <view class="article-content">
              <view class="article-desc">
                <u-parse :content="processRichText(item.contentHtml)"></u-parse>
              </view>
            </view>
          </view>
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
        <view class="no-more" v-if="articleList.length > 0">
          <u-loadmore :status="noMore ? 'nomore' : (loading ? 'loading' : 'loadmore')" iconSize="16" fontSize="12" color="#999" />
        </view>
        <view v-else class="empty-box">
          <text>暂无相关内容</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getIeArticle } from "@/api/integraEdu.js";
import { getIeTopic } from "@/api/index.js";
import { formatDate } from "@/utils/formatDate.js";

const props = defineProps({
  studioId: [String, Number]
});

const currentTopicId = ref('');
const topicList = ref([]);
const articleList = ref([]);
const page = ref(1);
const size = ref(10);
const loading = ref(false);
const noMore = ref(false);
const initialLoading = ref(true);
const currentTabIndex = ref(0);

onMounted(() => {
  fetchTopics();
});

const fetchTopics = async () => {
  try {
    const res = await getIeTopic();
    if (res.code === 0 || res.code === 200) {
      topicList.value = res.data;
      if (topicList.value.length > 0) {
        currentTopicId.value = topicList.value[0];
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
      topicId: typeof currentTopicId.value === 'object' ? currentTopicId.value.id : currentTopicId.value,
      studioId: props.studioId // 虽然API目前可能不处理，但保留以备后用
    });

    if (res.code === 0 || res.code === 200) {
      const records = res.data.records || [];
      if (isMore) {
        articleList.value = [...articleList.value, ...records];
      } else {
        articleList.value = records;
      }
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
  const topic = topicList.value[item.index];
  if (currentTopicId.value === topic) return;
  currentTopicId.value = topic;
  currentTabIndex.value = item.index;
  page.value = 1;
  noMore.value = false;
  articleList.value = [];
  fetchArticles();
};

const getTags = (tagsStr) => {
  if (!tagsStr) return [];
  return tagsStr.split(/[,，]/).map(t => t.trim()).filter(t => t !== '');
};

const goToDetail = (item) => {
  uni.navigateTo({
    url: `/pages/integraEdu/compontes/integraEduDetail/integraEduDetail?id=${item.id}`,
  });
};

const processRichText = (html) => {
  if (!html) return '暂无描述内容';
  let content = html.replace(/<img[^>]*>/gi, '');
  content = content.replace(/<\/p>|<\/div>|<br\s*\/?>/gi, ' ');
  content = content.replace(/font-weight:[^;]+;?/gi, '');
  content = content.replace(/font-size:[^;]+;?/gi, '');
  content = content.replace(/[\r\n]/g, ' ');
  return content;
};
</script>

<style lang="scss" scoped>
.integra-container {
  display: flex;
  flex-direction: column;
}

.tabs-container {
  width: 100%;
  background-color: #fff;
  z-index: 10;
  border-bottom: 1rpx solid #f0f0f0;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.article-list {
  padding: 0;
}

.article-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);

  .article-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #1a1a1a;
    line-height: 1.4;
    margin-bottom: 16rpx;
  }

  .article-main {
    display: flex;
    gap: 16rpx;
    margin-bottom: 16rpx;
  }

  .article-cover {
    width: 160rpx;
    height: 120rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
  }

  .article-content {
    flex: 1;
    min-width: 0;

    .article-desc {
      font-size: 24rpx;
      color: #666;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      overflow: hidden;
    }
  }

  .article-footer-new {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid #f5f5f5;

    .tags-area {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;

      .mini-tag {
        font-size: 20rpx;
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.08);
        padding: 2rpx 10rpx;
        border-radius: 4rpx;
      }
    }

    .meta-area {
      display: flex;
      gap: 16rpx;

      .meta-box {
        display: flex;
        align-items: center;
        gap: 4rpx;

        .value {
          font-size: 20rpx;
          color: #999;
        }
      }
    }
  }
}

.empty-box {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 26rpx;
}

.loading-state {
  padding: 40rpx 0;
}
</style>
