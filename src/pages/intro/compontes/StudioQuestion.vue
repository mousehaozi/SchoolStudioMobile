<template>
  <view class="question-container">
    <view class="form-card">
      <view class="card-header">
        <view class="title-line"></view>
        <text class="card-title">填写咨询信息</text>
      </view>

      <view class="form-body">
        <view class="form-item border-btm">
          <view class="label-row">
            <u-icon name="chat-fill" color="#3B82F6" size="18"></u-icon>
            <text class="label">咨询内容</text>
          </view>
          <textarea 
            class="textarea" 
            placeholder="请详细描述您的问题或建议..." 
            placeholder-class="placeholder" 
            v-model="formData.content"
            :maxlength="500"
          />
          <text class="char-count">{{ formData.content.length }}/500</text>
        </view>
        
        <view class="form-item border-btm">
          <view class="label-row">
            <u-icon name="account-fill" color="#3B82F6" size="18"></u-icon>
            <text class="label">联系人</text>
          </view>
          <input 
            class="input-box" 
            type="text" 
            placeholder="请输入您的姓名" 
            placeholder-class="placeholder" 
            v-model="formData.person" 
          />
        </view>
        
        <view class="form-item">
          <view class="label-row">
            <u-icon name="phone-fill" color="#3B82F6" size="18"></u-icon>
            <text class="label">联系方式</text>
          </view>
          <input 
            class="input-box" 
            type="text" 
            placeholder="手机号码或电子邮箱" 
            placeholder-class="placeholder" 
            v-model="formData.contact" 
          />
        </view>
      </view>
    </view>

    <view class="submit-section">
      <button class="submit-btn" :class="{ 'disabled': !isFormValid }" @click="handleSubmit">
        <view class="btn-content">
          <u-icon name="checkmark-circle-fill" color="#fff" size="20"></u-icon>
          <text class="btn-text">立即提交</text>
        </view>
      </button>
      <text class="tips">我们将尽快处理并给您回复，感谢您的反馈！</text>
    </view>
  </view>
</template>

<script setup>
import { reactive, computed } from 'vue';

const props = defineProps({
  studioId: [String, Number]
});

const formData = reactive({
  content: '',
  person: '',
  contact: ''
});

const isFormValid = computed(() => {
  return formData.content.trim() && formData.person.trim() && formData.contact.trim();
});

const handleSubmit = () => {
  if (!formData.content.trim()) {
    uni.showToast({ title: '请输入咨询内容', icon: 'none' });
    return;
  }
  if (!formData.person.trim()) {
    uni.showToast({ title: '请输入联系人', icon: 'none' });
    return;
  }
  if (!formData.contact.trim()) {
    uni.showToast({ title: '请输入联系方式', icon: 'none' });
    return;
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!phoneRegex.test(formData.contact) && !emailRegex.test(formData.contact)) {
    uni.showToast({ title: '联系方式格式有误', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '提交中...' });
  
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: '提交成功', icon: 'success' });
    
    // Clear form
    formData.content = '';
    formData.person = '';
    formData.contact = '';
  }, 1000);
};
</script>

<style lang="scss" scoped>
.question-container {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.form-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 30rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 30rpx;
}

.card-header {
  margin-bottom: 30rpx;
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
  font-size: 28rpx;
  color: #1F2937;
  font-weight: bold;
}

.form-item {
  padding: 20rpx 0;
}

.border-btm {
  border-bottom: 1rpx solid #F3F4F6;
}

.label-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.label {
  font-size: 26rpx;
  color: #374151;
  font-weight: bold;
}

.textarea {
  width: 100%;
  height: 160rpx;
  font-size: 26rpx;
  color: #1F2937;
  background-color: #F9FAFB;
  border-radius: 12rpx;
  padding: 16rpx;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 20rpx;
  color: #9CA3AF;
  margin-top: 8rpx;
}

.input-box {
  width: 100%;
  height: 72rpx;
  font-size: 26rpx;
  color: #1F2937;
  background-color: #F9FAFB;
  border-radius: 12rpx;
  padding: 0 16rpx;
  box-sizing: border-box;
}

.placeholder {
  color: #9CA3AF;
}

.submit-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20rpx;
    padding-bottom: 40rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #60A5FA, #3B82F6);
  border-radius: 44rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn.disabled {
    background: #D1D5DB;
    opacity: 0.8;
}

.btn-content {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.btn-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.tips {
    font-size: 22rpx;
    color: #9CA3AF;
    text-align: center;
}
</style>
