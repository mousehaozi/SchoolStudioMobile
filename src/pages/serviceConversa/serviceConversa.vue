<template>
  <view class="chat-container">
    <!-- Top Status Bar -->
    <view class="status-bar">
      <!-- History Button -->
      <view class="history-btn" @click="toggleHistory">
        <u-icon name="list-dot" color="#3b82f6" size="24"></u-icon>
        <text>历史</text>
      </view>

      <view class="conn-status">
        <text class="dot" :class="statusClass"></text>
        <text class="status-text">{{ statusText }}</text>
      </view>
      <button 
        class="end-btn" 
        :class="{ 'btn-closed': isSessionClosed }" 
        :disabled="isSessionClosed"
        @click="handleEndSession"
      >
        {{ isSessionClosed ? '已结束' : '结束会话' }}
      </button>
    </view>

    <!-- Chat Messages Content -->
    <scroll-view 
      class="message-scroll" 
      scroll-y 
      :scroll-top="scrollTop" 
      scroll-with-animation
    >
      <view class="message-inner">
        <!-- Welcome Card -->
        <view class="welcome-card" v-if="messages.length === 0">
          <view class="welcome-logo-wrap">
             <image src="/static/appLogo.png" class="welcome-logo"></image>
          </view>
          <text class="welcome-title">欢迎使用 IntegraEdu 客服</text>
          <text class="welcome-subtitle">我们竭诚为您提供最优质的咨询服务</text>
        </view>

        <!-- Message List -->
        <view 
          v-for="(msg, index) in messages" 
          :key="index"
          class="message-row"
          :class="msg.role === 'user' ? 'user-row' : 'bot-row'"
        >
          <view class="avatar">
            <image :src="msg.role === 'user' ? userAvatar : botAvatar" mode="aspectFill"></image>
          </view>
          <view class="msg-content">
            <!-- Text Content -->
            <view v-if="msg.msgType === 'TEXT' || !msg.msgType" class="bubble">
              <text>{{ msg.content }}</text>
            </view>
            <!-- Image Content -->
            <view v-else-if="msg.msgType === 'IMAGE'" class="image-bubble" @click="previewImage(msg.content)">
              <image :src="formatUrl(msg.content)" mode="widthFix" class="chat-img"></image>
            </view>
            <!-- Read Status -->
            <view v-if="msg.role === 'user' && index === lastUserMsgIndex" class="read-status" :class="{ 'is-read': msg.readStatus === 1 }">
              {{ msg.readStatus === 1 ? '已读' : '未读' }}
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Unavailable Placeholder (Optional, shown in image) -->
    <view class="unavailable-toast" v-if="isUnavailable">
      <text>服务暂时不可用</text>
    </view>

    <!-- History Sessions Popup -->
    <view class="history-overlay" v-if="showHistory" @click="toggleHistory">
      <view class="history-panel" @click.stop>
        <view class="history-header">历史会话</view>
        <scroll-view class="history-list" scroll-y>
          <view 
            v-for="(session, index) in sessionList" 
            :key="index"
            class="session-item"
            :class="{ active: currentSessionId === session.id }"
            @click="selectSession(session)"
          >
            <view class="session-info">
              <text class="session-id">会话 #{{ session.id }}</text>
              <text class="session-status" :class="'status-' + session.status">
                {{ session.status === 2 ? '已关闭' : '服务中' }}
              </text>
            </view>
            <text class="session-time">{{ formatDate(session.createdAt) }}</text>
          </view>
          <view v-if="sessionList.length === 0" class="empty-history">暂无历史记录</view>
        </scroll-view>
      </view>
    </view>

    <!-- Bottom Input Area -->
    <view class="input-area" :class="{ 'is-disabled': isSessionClosed }">
      <view class="input-bar">
        <u-icon 
          name="photo" 
          :color="isSessionClosed ? '#ccc' : '#999'" 
          size="24" 
          class="icon-img" 
          @click="chooseImage"
        ></u-icon>
        <input 
          class="main-input" 
          v-model="inputValue" 
          :placeholder="isSessionClosed ? '当前会话已关闭' : '请输入您想咨询的问题...'" 
          :disabled="isSessionClosed"
          confirm-type="send"
          @confirm="sendMessage"
        />
        <view class="send-btn" :class="{ active: inputValue && !isSessionClosed }" @click="sendMessage">
          <u-icon name="arrow-upward" color="#fff" size="20"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import uIcon from "uview-plus/components/u-icon/u-icon.vue";
import socket from "@/utils/ws.js";
import { wsBaseUrl, imgBaseUrl } from "@/utils/baseUrl.js";
import { 
  ensureSession, 
  getSessionList, 
  getSessionMessages, 
  sendChatMessage, 
  markSessionRead, 
  closeSession 
} from "@/api/serviceConversa.js";
import { uploadImage } from "@/api/common.js";
import { getUserProfile } from "@/api/index.js";
import { formatImageUrl } from "@/utils/formatImageUrl.js";
import { formatDate } from "@/utils/formatDate.js";

const inputValue = ref('');
const messages = ref([]);
const scrollTop = ref(0);
const status = ref('connecting'); // connecting, connected, closed
const isUnavailable = ref(false);

const currentSessionId = ref(null);
const currentSessionStatus = ref(0); // 0: 暂未接待, 1: 接待中, 2: 会话关闭
const showHistory = ref(false);
const sessionList = ref([]);
const page = ref(1);
const size = ref(20);

const isSessionClosed = computed(() => currentSessionStatus.value === 2);

const userAvatar = ref('/static/appLogo.png'); 
const botAvatar = ref('/static/appLogo.png');  

const statusText = computed(() => {
  if (status.value === 'connecting') return '正在连接中...';
  if (status.value === 'connected') return '已成功连接';
  return '连接已关闭';
});

const statusClass = computed(() => status.value);

const lastUserMsgIndex = computed(() => {
  for (let i = messages.value.length - 1; i >= 0; i--) {
    if (messages.value[i].role === 'user') {
      return i;
    }
  }
  return -1;
});

onLoad(() => {
  initChat();
});

onUnmounted(() => {
  socket.close();
});

const initChat = async () => {
  uni.showLoading({ title: '加载中...' });
  try {
    // 1. Ensure current session
    const res = await ensureSession();
    if (res.code === 200 || res.code === 0) {
      currentSessionId.value = res.data.id;
      currentSessionStatus.value = res.data.status;
      
      // Fetch user profile for avatar
      try {
        const profileRes = await getUserProfile();
        if (profileRes.code === 200 || profileRes.code === 0) {
          if (profileRes.data.wechatAvatar) {
            userAvatar.value = formatImageUrl(profileRes.data.wechatAvatar);
          }
        }
      } catch (e) {
        console.error("Fetch profile failed", e);
      }

      // 2. Load previous messages
      await fetchMessages(currentSessionId.value);
      // 3. Connect Socket
      initSocket();
      // 4. Mark Read
      markSessionRead(currentSessionId.value);
    }
  } catch (err) {
    console.error("Init chat failed", err);
    isUnavailable.value = true;
  } finally {
    uni.hideLoading();
  }
};

const initSocket = () => {
  const token = uni.getStorageSync('token');
  const url = token ? `${wsBaseUrl()}?token=${token}` : wsBaseUrl();
  socket.connect(url);
  
  socket.onStatusChange((s) => {
    status.value = s;
  });

  socket.onMessage((data) => {
    // Only add if it's for current session or a general notification
    if (data.sessionId && data.sessionId !== currentSessionId.value) return;
    
    // Map incoming message to our format
    if (data.content) {
      // Use senderRole: USER is本人, ADMIN is对方
      const isBot = data.senderRole === 'ADMIN';
      messages.value.push({
        role: isBot ? 'bot' : 'user',
        content: data.content,
        msgType: data.msgType || 'TEXT',
        readStatus: data.readStatus || 0
      });
      scrollToBottom();
      // Auto mark read if we are in this session
      if (isBot) {
        markSessionRead(currentSessionId.value);
      }
    }
  });
};

const fetchMessages = async (sid) => {
  try {
    const res = await getSessionMessages(sid, { page: 1, size: 50 });
    if (res.code === 200 || res.code === 0) {
      const records = res.data.records || [];
      messages.value = records.map(m => ({
        // Use senderRole: USER is本人, ADMIN is对方
        role: m.senderRole === 'ADMIN' ? 'bot' : 'user',
        content: m.content,
        msgType: m.msgType,
        readStatus: m.readStatus
      })).reverse(); // Often needs reverse if backend gives desc order
      scrollToBottom();
    }
  } catch (err) {
    console.error("Fetch messages failed", err);
  }
};

const sendMessage = async () => {
  if (isSessionClosed.value) return;
  if (!inputValue.value.trim() || !currentSessionId.value) return;
  
  const content = inputValue.value;
  inputValue.value = '';

  try {
    const res = await sendChatMessage({
      sessionId: currentSessionId.value,
      msgType: 'TEXT',
      content: content
    });
    
    if (res.code === 200 || res.code === 0) {
       messages.value.push({ 
         role: 'user', 
         content, 
         msgType: 'TEXT',
         readStatus: res.data ? res.data.readStatus : 0
       });
       scrollToBottom();
    }
  } catch (err) {
    uni.showToast({ title: '发送失败', icon: 'none' });
  }
};

const chooseImage = () => {
  if (isSessionClosed.value) return;
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const tempPath = res.tempFilePaths[0];
      uni.showLoading({ title: '正在上传...' });
      try {
        const uploadRes = await uploadImage(tempPath);
        if (uploadRes.data && uploadRes.data.url) {
          const imageUrl = uploadRes.data.url;
          await sendChatMessage({
            sessionId: currentSessionId.value,
            msgType: 'IMAGE',
            content: imageUrl
          });
          messages.value.push({ 
            role: 'user', 
            content: imageUrl, 
            msgType: 'IMAGE',
            readStatus: 0 // Default to unread for new upload
          });
          scrollToBottom();
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        uni.hideLoading();
      }
    }
  });
};

const toggleHistory = async () => {
  showHistory.value = !showHistory.value;
  if (showHistory.value) {
    fetchSessions();
  }
};

const fetchSessions = async () => {
  try {
    const res = await getSessionList({ page: 1, size: 20 });
    if (res.code === 200 || res.code === 0) {
      sessionList.value = res.data.records || [];
    }
  } catch (err) {
    console.error("Fetch sessions failed", err);
  }
};

const selectSession = async (session) => {
  uni.showLoading({ title: '加载中...' });
  try {
    currentSessionId.value = session.id;
    currentSessionStatus.value = session.status;
    messages.value = [];
    await fetchMessages(session.id);
    showHistory.value = false;
    markSessionRead(session.id);
  } finally {
    uni.hideLoading();
  }
};

const handleEndSession = async () => {
  if (!currentSessionId.value) return;
  
  uni.showModal({
    title: '提示',
    content: '确定结束本次会话吗？',
    confirmColor: '#f56c6c',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在处理...' });
        try {
          await closeSession(currentSessionId.value);
          await markSessionRead(currentSessionId.value);
          uni.showToast({ title: '会话已结束', icon: 'success' });
          initChat(); 
        } catch (err) {
          console.error("Close session failed", err);
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};

const scrollToBottom = () => {
  nextTick(() => {
    scrollTop.value += 9999;
  });
};

const formatUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return imgBaseUrl() + url;
};

const previewImage = (url) => {
  uni.previewImage({
    urls: [formatUrl(url)]
  });
};
</script>

<style lang="scss" scoped>
.chat-container {
  height: 92vh;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

/* Status Bar */
.status-bar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20rpx 40rpx;
  background-color: #fff;
  border-bottom: 2rpx solid #f0f0f0;
  z-index: 100;
  box-sizing: border-box;

  .history-btn {
    position: absolute;
    left: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    
    text {
      font-size: 20rpx;
      color: #3b82f6;
      margin-top: 4rpx;
    }
  }

  .conn-status {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    
    .dot {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      margin-right: 12rpx;
      background-color: #ccc;
      
      &.connected { background-color: #52c41a; }
      &.connecting { 
        background-color: #faad14;
        animation: blink 1s infinite;
      }
      &.closed { background-color: #ff4d4f; }
    }
    
    .status-text {
      font-size: 26rpx;
      color: #999;
    }
  }

  .end-btn {
    margin: 0;
    padding: 0 24rpx;
    height: 60rpx;
    line-height: 56rpx;
    font-size: 24rpx;
    color: #ff4d4f;
    background-color: transparent;
    border: 2rpx solid #ff4d4f;
    border-radius: 30rpx;
    position: relative;
    z-index: 2;
    
    &::after { border: none; }

    &.btn-closed {
      color: #999;
      border-color: #eee;
      background-color: #f5f5f5;
    }
  }
}

/* Scroll Area */
.message-scroll {
  flex: 1;
  overflow: hidden;
}

.message-inner {
  padding: 30rpx;
  padding-bottom: 140rpx; /* Leave space for fixed input area */
}

/* Welcome Card */
.welcome-card {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 40rpx 20rpx;
  margin-top: 4rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.02);

  .welcome-logo-wrap {
    width: 140rpx;
    height: 140rpx;
    background-color: #e6f1ff;
    border-radius: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 40rpx;
    
    .welcome-logo {
      width: 100rpx;
      height: 100rpx;
    }
  }

  .welcome-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .welcome-subtitle {
    font-size: 26rpx;
    color: #999;
  }
}

/* Unavailable Toast */
.unavailable-toast {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.65);
  padding: 30rpx 60rpx;
  border-radius: 12rpx;
  z-index: 100;
  
  text {
    color: #fff;
    font-size: 30rpx;
  }
}

/* Messages */
.message-row {
  display: flex;
  margin-bottom: 40rpx;
  
  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 20rpx;
    
    image { width: 100%; height: 100%; }
  }
  
  .msg-content {
    max-width: 70%;
    
    .bubble {
      display: inline-block;
      padding: 24rpx;
      border-radius: 0 24rpx 24rpx 24rpx;
      background-color: #fff;
      font-size: 28rpx;
      line-height: 1.5;
      color: #333;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
      word-break: break-all;
    }

    .image-bubble {
      background-color: #fff;
      padding: 10rpx;
      border-radius: 12rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
      
      .chat-img {
        max-width: 300rpx;
        display: block;
      }
    }
  }
  
  &.user-row {
    flex-direction: row-reverse;
    
    .avatar { margin-right: 0; margin-left: 20rpx; }
    
    .msg-content {
      .bubble {
        border-radius: 24rpx 0 24rpx 24rpx;
        background-color: #3b82f6;
        color: #fff;
      }

      .read-status {
        text-align: right;
        font-size: 20rpx;
        color: #999;
        margin-top: 8rpx;
        padding-right: 4rpx;

        &.is-read {
          color: #3b82f6;
        }
      }
    }
  }
}

/* Bottom Input */
.input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20rpx 30rpx 40rpx;
  background-color: #fff;
  border-top: 2rpx solid #f0f0f0;
  z-index: 999;
  box-sizing: border-box;
}

.input-bar {
  height: 100rpx;
  background-color: #f7f8fa;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  padding: 0 10rpx 0 30rpx;

  .icon-img {
    flex-shrink: 0;
  }

  .main-input {
    flex: 1;
    margin: 0 20rpx;
    font-size: 28rpx;
  }

  .send-btn {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background-color: #d1d5db;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s;
    
    &.active {
      background-color: #3b82f6;
    }
  }
}

/* History Overlay */
.history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.history-panel {
  width: 500rpx;
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease-out;

  .history-header {
    padding: 40rpx 30rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    border-bottom: 2rpx solid #f0f0f0;
  }

  .history-list {
    flex: 1;
    overflow: hidden;
  }

  .session-item {
    padding: 30rpx;
    border-bottom: 2rpx solid #f9f9f9;
    
    &.active {
      background-color: #f0f7ff;
    }

    .session-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10rpx;

      .session-id {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }

      .session-status {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 4rpx;
        
        &.status-2 { background-color: #f5f5f5; color: #999; }
        &.status-1 { background-color: #e6f7ff; color: #1890ff; }
        &.status-0 { background-color: #fff7e6; color: #faad14; }
      }
    }

    .session-time {
      font-size: 24rpx;
      color: #999;
    }
  }

  .empty-history {
    padding: 100rpx 0;
    text-align: center;
    color: #999;
    font-size: 26rpx;
  }
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
</style>
