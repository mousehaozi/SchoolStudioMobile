<template>
  <view class="container">
    <!-- Global Background -->
    <view class="global-background"></view>

    <!-- Topic Tabs (Removed sliding effect) -->
    <view class="topic-tabs-container">
      <view 
        v-for="(topic, index) in topicList" 
        :key="index"
        class="topic-tab"
        :class="{ active: currentTopicId === topic }"
        @click="switchTopic(topic)"
      >
        <text class="topic-text">{{ topic.name }}</text>
      </view>
    </view>


    <!-- Article List -->
    <scroll-view class="article-list" scroll-y @scrolltolower="loadMore">
      <view 
        v-for="(item, index) in articleList" 
        :key="index"
        class="article-card"
        @click="goToDetail(item)"
      >
        <view class="article-title-row">
          <view class="icon-wrap">
             <u-icon name="checkmark-circle" color="#3b82f6" size="22"></u-icon>
          </view>
          <text class="article-title">{{ item.title }}</text>
        </view>
        
        <view class="article-info-row">
          <text class="article-org">{{ item.publisher || '重庆工业职业技术大学' }}</text>
          <view class="article-views">
            <u-icon name="eye" size="14" color="#999"></u-icon>
            <text class="view-count">{{ item.viewCount || 0 }}次浏览</text>
          </view>
        </view>
        
        <view class="article-tags">
          <text 
            v-for="(tag, tIndex) in getTags(item.tags)" 
            :key="tIndex"
            class="tag"
          >{{ tag }}</text>
        </view>
        
        <view class="article-desc">
          <rich-text :nodes="processRichText(item.contentHtml)"></rich-text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import uIcon from "uview-plus/components/u-icon/u-icon.vue";
import { getIeArticle } from "@/api/integraEdu.js";
import {getIeTopic} from "@/api/index.js";
import { formatImageUrl } from "@/utils/formatImageUrl.js";

const currentTopicId = ref('');
const currentTopicName = ref('');
const topicList = ref([]);
const articleList = ref([]);
const total = ref(0);
const page = ref(1);
const size = ref(10);
const loading = ref(false);
const noMore = ref(false);

onLoad((options) => {
  if (options.id) {
    currentTopicId.value = options.id;
    currentTopicName.value = options.name || '';
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
  }
};

const switchTopic = (topic) => {
  if (currentTopicId.value === topic) return;
  currentTopicId.value = topic;
  currentTopicName.value = topic;
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fbff;
}

.global-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 300rpx;
  background: linear-gradient(180deg, #e0efff 0%, rgba(248, 251, 255, 0) 100%);
  pointer-events: none;
  z-index: 0;
}

.topic-tabs-container {
  display: flex;
  flex-wrap: wrap; /* 允许换行，不滑动 */
  padding: 20rpx 28rpx;
  position: relative;
  z-index: 10;
}

.topic-tab {
  display: flex;
  align-items: center;
  padding: 10rpx 24rpx;
  margin-bottom: 20rpx;
  position: relative;
  
  .topic-text {
    font-size: 28rpx;
    color: #666;
    transition: all 0.3s;
  }
  
  &.active {
    background: rgba(59, 130, 246, 0.1);
    border-radius: 40rpx;
    
    .topic-text {
      color: #000;
      font-weight: 500;
    }
  }
}


.article-list {
  flex: 1;
  padding: 0 30rpx 30rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.article-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);
  
  .article-title-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20rpx;
    
    .icon-wrap {
      margin-right: 20rpx;
      margin-top: 4rpx;
    }
    
    .article-title {
      flex: 1;
      font-size: 34rpx;
      font-weight: bold;
      color: #333;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  .article-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    .article-org {
      font-size: 28rpx;
      color: #999;
    }

    .article-views {
      display: flex;
      align-items: center;
      gap: 6rpx;

      .view-count {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 24rpx;
    
    .tag {
      background-color: #e6f7ff;
      color: #1890ff;
      font-size: 24rpx;
      padding: 6rpx 20rpx;
      border-radius: 10rpx;
    }
  }
  
  .article-desc {
    font-size: 30rpx;
    color: #666;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
    padding: 0 20rpx 0 0; /* Align with title text */
    text-indent: 2em; /* 首行缩进两个字符 */
    text-align: justify;

    /* 强制内部元素不加粗、不换行且字体统一 */
    :deep(*) {
      display: inline !important;
      font-weight: normal !important;
      font-size: 30rpx !important;
      background: none !important;
      margin: 0 !important;
      padding: 0 !important;
      text-indent: 0 !important; /* 防止子元素重复缩进 */
    }
  }
}
</style>
