import wx from 'weixin-js-sdk';
import { getJSSDKSignature } from '@/api/index.js';

/**
 * 初始化微信 JS-SDK 并设置分享信息
 * @param {Object} shareData - 分享数据对象
 * @param {string} shareData.title - 分享标题
 * @param {string} shareData.desc - 分享描述
 * @param {string} shareData.link - 分享链接
 * @param {string} shareData.imgUrl - 分享图标完整URL
 */
export const initWechatShare = async (shareData = {}) => {
  // #ifdef H5
  const ua = navigator.userAgent.toLowerCase();
  const isWechat = /micromessenger/i.test(ua);
  
  // 仅在微信内置浏览器才执行
  if (!isWechat) return;

  try {
    // 动态获取当前完整的 URL (不包含哈希部分，因为微信鉴权对哈希部分有些严格限制要求)
    const currentUrl = window.location.href.split('#')[0];
    
    // 获取签名参数
    const res = await getJSSDKSignature(currentUrl);
    
    if (res.code === 0 || res.code === 200) {
      // res.data 里包含了后端从微信拉取的鉴权属性
      const { appId, timestamp, nonceStr, signature } = res.data;
      
      // 注入权限验证配置
      wx.config({
        debug: false, // 关闭调试模式，消除页面弹窗
        appId: appId,
        timestamp: timestamp,
        nonceStr: nonceStr,
        signature: signature,
        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'] // 需要使用的核心 JS 接口列表
      });

      // 初始化分享数据
      wx.ready(() => {
        const defaultShareData = {
          title: shareData.title || '匠心重工·劳模工匠创新工作室', // 分享标题
          desc: shareData.desc || '探索国家级、省级劳模工匠创新工作室的卓越成果', // 分享描述
          link: shareData.link || window.location.href, // 分享链接
          imgUrl: shareData.imgUrl || 'https://studio.mouse.asia/static/share_thumb.png', // 分享图标
        };

        // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
        wx.updateAppMessageShareData({
          ...defaultShareData,
          success: function () {
            console.log('WeChat JS-SDK: AppMessage Share Data configured.');
          }
        });

        // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容
        wx.updateTimelineShareData({
          ...defaultShareData,
          success: function () {
            console.log('WeChat JS-SDK: Timeline Share Data configured.');
          }
        });
      });

      wx.error((res) => {
        console.error('WeChat JS-SDK config error:', res);
      });
    }
  } catch (error) {
    console.error('Failed to init WeChat share:', error);
  }
  // #endif
};
