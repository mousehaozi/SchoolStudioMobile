<template>
  <view class="container">
    <view class="global-background"></view>
    <view class="header">
      <view class="user-info">
        <image class="avatar" src="/static/appLogo.png" mode="aspectFill"></image>
        <view class="info-text">
          <text class="username">{{ userInfo.nickname || '未登录用户' }}</text>
          <text class="user-id">ID: {{ userInfo.id || '---' }}</text>
        </view>
      </view>
    </view>
    <view class="content">
      <view class="menu-list">
        <view class="menu-item">
          <u-icon name="setting" size="20" color="#666"></u-icon>
          <text class="menu-text">设置</text>
          <u-icon name="arrow-right" size="14" color="#999"></u-icon>
        </view>
        <view class="menu-item">
          <u-icon name="info-circle" size="20" color="#666"></u-icon>
          <text class="menu-text">关于我们</text>
          <u-icon name="arrow-right" size="14" color="#999"></u-icon>
        </view>
      </view>
    </view>
    
    <view class="bottom-spacer"></view>
    <MyTabbar activePath="/pages/mine/mine" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const userInfo = ref({});

onMounted(() => {
  const info = uni.getStorageSync('userInfo');
  if (info) {
    userInfo.value = info;
  }
});
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f7f8fa;
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
  opacity: 0.1;
  z-index: 0;
  pointer-events: none;
}

.header {
  padding: 100rpx 40rpx 60rpx;
  background-color: #fff;
  z-index: 1;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: #eee;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.user-id {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.content {
  padding: 30rpx;
  z-index: 1;
  position: relative;
}

.menu-list {
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f2f2f2;
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  margin-left: 20rpx;
}

.bottom-spacer {
  height: 120rpx;
}
</style>
