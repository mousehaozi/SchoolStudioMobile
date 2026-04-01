<template>
  <view class="login-container">
    <view class="global-background"></view>

    <view class="login-content">
      <!-- Logo & Title -->
      <view class="logo-section">
        <view class="logo-wrapper">
          <image src="/static/appLogo.png" mode="aspectFit" class="logo"></image>
        </view>
        <text class="app-name">重庆工业职业技术大学</text>
        <text class="app-slogan">劳模工匠创新工作室</text>
      </view>

      <!-- Action Section -->
      <view class="action-section">
        <button class="wechat-btn" @click="handleWechatLogin" :disabled="loading">
          <template v-if="!loading">
            <u-icon name="weixin-fill" color="#fff" size="24" class="wechat-icon"></u-icon>
            <text>微信一键登录</text>
          </template>
          <template v-else>
            <view class="btn-loader"></view>
            <text>正在登录...</text>
          </template>
        </button>

        <view class="agreement-row">
          <checkbox-group @change="onAgreementChange">
            <checkbox value="agreed" :checked="agreed" color="#3B82F6" style="transform:scale(0.7)" />
          </checkbox-group>
          <text class="agreement-text">
            我已阅读并同意 <text class="link">《用户协议》</text> 和 <text class="link">《隐私政策》</text>
          </text>
        </view>
      </view>
    </view>

    <!-- Footer -->
    <view class="login-footer">
      <text>© 2026 重庆工业职业技术大学 创新工作室</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { wechatLogin } from '@/api/index.js';

const APPID = 'wx98f0f599c532a7fe';
const agreed = ref(false);
const loading = ref(false);

// 手动解析 URL 中的 code 参数（处理微信回调位置不固定的问题）
const getUrlCode = () => {
  const url = window.location.search || window.location.hash;
  const match = url.match(/[?&]code=([^&|^#/]+)/);
  return match ? match[1] : null;
};

const onAgreementChange = (e) => {
  agreed.value = e.detail.value.length > 0;
};

const handleWechatLogin = () => {
  if (!agreed.value) {
    uni.showToast({
      title: '请先阅读并同意用户协议',
      icon: 'none'
    });
    return;
  }

  // 如果 URL 中已经有 code 了，直接尝试登录
  const existingCode = getUrlCode();
  if (existingCode) {
    performLogin(existingCode);
    return;
  }

  // #ifdef H5
  const ua = navigator.userAgent.toLowerCase();
  const isWechat = /micromessenger/i.test(ua);
  if (isWechat) {
    // 动态获取当前页面的完整 URL 作为回调地址（忽略 query 参数，避免循环授权嵌套）
    const localUrl = window.location.origin + window.location.pathname;
    const encodeUrl = encodeURIComponent(localUrl);
    const scope = 'snsapi_userinfo';
    const state = Math.random().toString(36).substring(2, 15);

    // 采用最稳健的 URL 拼接，避免编译干扰
    let authUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    authUrl += '?appid=' + APPID;
    authUrl += '&redirect_uri=' + encodeUrl;
    authUrl += '&response_type=code';
    authUrl += '&scope=' + scope;
    authUrl += '&state=' + state;
    authUrl += '#wechat_redirect';

    console.log('正在跳转微信授权...', authUrl);
    window.location.href = authUrl;
  } else {
    uni.showToast({
      title: '请在微信客户端打开',
      icon: 'none'
    });
  }
  // #endif

  // #ifdef MP-WEIXIN
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      await performLogin(loginRes.code);
    },
    fail: () => {
      uni.showToast({ title: '获取code失败', icon: 'none' });
    }
  });
  // #endif
};

const performLogin = async (code) => {
  if (loading.value) return;
  loading.value = true;
  try {
    console.log('正在向后端提交 Code:', code);
    const res = await wechatLogin(code);
    console.log('--- 登录接口返回原始数据 ---', res);

    if (res && (res.code === 0 || res.code === 200)) {
      // 检查 res.data 下所有的 key，确认字段名
      console.log('【调试】res.data 所有的键:', Object.keys(res.data));

      const { token } = res.data;
      // 尝试匹配不同的用户信息字段名：userInfo, user, 或者直接使用 res.data
      const userInfo = res.data.userInfo || res.data.user || res.data;

      console.log('【最终确认】Token:', token);
      console.log('【最终确认】用户信息对象:', userInfo);

      if (userInfo) {
        console.log('>>> 昵称检测:', userInfo.nickname || userInfo.nickName || userInfo.userName || '未找到');
        console.log('>>> 头像检测:', userInfo.avatar || userInfo.headimgurl || userInfo.avatarUrl || '未找到');
      }

      uni.setStorageSync('token', token);
      uni.setStorageSync('userInfo', userInfo);
      uni.showToast({ title: '登录成功', icon: 'success' });

      // 登录成功后重定向到首页，清除 URL 里的 code。
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/index/index' });
      }, 1500);
    } else {
      uni.showToast({ title: res.message || '登录异常', icon: 'none' });
    }
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    loading.value = false;
  }
};

onLoad((options) => {
  // 1. 优先尝试从 options 中直接获取 code (Uni-app 路由解析)
  // 2. 注入手动解析做兜底 (防止微信重定向位置导致的解析失效)
  const code = options.code || getUrlCode();
  if (code) {
    // 【新增逻辑】既然跳回来带了 code，说明用户之前肯定点击并同意了，直接勾选上
    agreed.value = true;

    if (!window._isLoggingIn) {
      window._isLoggingIn = true;
      console.log('检测到微信回调 Code:', code);
      performLogin(code);

      // 3秒后释放锁，防止极端情况下页面没跳转也点不了按钮
      setTimeout(() => { window._isLoggingIn = false; }, 3000);
    }
  }
});
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 8vh 40rpx 60rpx;
  position: relative;
  background-color: #fff;
  overflow: hidden;
  box-sizing: border-box;
}

.global-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 70% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 10% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 40%);
  z-index: 0;
}

.login-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;
  animation: fadeInDown 0.8s ease-out;
}

.logo-wrapper {
  width: 124rpx;
  height: 124rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.logo {
  width: 124rpx;
  height: 124rpx;
}

.app-name {
  font-size: 38rpx;
  font-weight: 600;
  color: #111827;
  letter-spacing: 1rpx;
  margin-bottom: 12rpx;
  text-align: center;
}

.app-slogan {
  font-size: 26rpx;
  color: #64748B;
  letter-spacing: 6rpx;
  font-weight: 400;
  opacity: 0.9;
}

.action-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.wechat-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #07C160, #06AD56);
  color: #fff;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  box-shadow: 0 10rpx 20rpx rgba(7, 193, 96, 0.2);
  margin-bottom: 40rpx;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  &[disabled] {
    opacity: 0.7;
    background: #ccc;
    box-shadow: none;
  }
}

.wechat-icon {
  width: 44rpx;
  height: 44rpx;
  margin-right: 16rpx;
}

.agreement-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.agreement-text {
  font-size: 24rpx;
  color: #6B7280;
}

.link {
  color: #3B82F6;
}

.login-footer {
  font-size: 24rpx;
  color: #9CA3AF;
  z-index: 1;
  opacity: 0.8;
  letter-spacing: 1rpx;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-40rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-loader {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 16rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
