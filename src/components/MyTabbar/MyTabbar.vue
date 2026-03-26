<template>
  <view class="bottom-nav">
    <view class="nav-item" :class="{ active: activePath === '/pages/index/index' }" @click="goToPage('/pages/index/index')">
      <u-icon :name="activePath === '/pages/index/index' ? 'home-fill' : 'home'" size="24" :color="activePath === '/pages/index/index' ? '#3b82f6' : '#666'"></u-icon>
      <text>首页</text>
    </view>
    <view class="nav-item" :class="{ active: activePath === '/pages/integraEdu/integraEdu' }" @click="goToPage('/pages/integraEdu/integraEdu')">
      <u-icon :name="activePath === '/pages/integraEdu/integraEdu' ? 'integral-fill' : 'integral'" size="24" :color="activePath === '/pages/integraEdu/integraEdu' ? '#3b82f6' : '#666'"></u-icon>
      <text>产教融合</text>
    </view>
    <view class="nav-item" :class="{ active: activePath === '/pages/serviceConversa/serviceConversa' }" @click="goToPage('/pages/serviceConversa/serviceConversa')">
      <u-icon :name="activePath === '/pages/serviceConversa/serviceConversa' ? 'chat-fill' : 'chat'" size="24" :color="activePath === '/pages/serviceConversa/serviceConversa' ? '#3b82f6' : '#666'"></u-icon>
      <text>问题咨询</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  activePath: {
    type: String,
    required: true
  }
});

const goToPage = (url) => {
  if (props.activePath === url) return;
  
  // Use reLaunch to handle main pages if they are meant to be tabs
  uni.reLaunch({
    url
  });
};
</script>

<style lang="scss" scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 110rpx;
  display: flex;
  background: #fff;
  border-top: 1rpx solid #eee;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: content-box;
  z-index: 1000;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  font-size: 22rpx;
  color: #999;

  &.active {
    color: #3b82f6;
    font-weight: bold;
  }
}
</style>
