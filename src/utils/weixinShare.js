import { getJSSDKSignature } from '@/api/index.js';

const DEFAULT_SHARE_TITLE = '匠心重工·劳模工匠创新工作室';
const DEFAULT_SHARE_DESC = '探索国家级、省市级劳模工匠创新工作室的卓越成果';
const DEFAULT_SHARE_IMAGE = '/static/share_thumb.png';

let latestShareTaskId = 0;
let wechatSdkPromise = null;

const isWechatBrowser = () => {
  // #ifdef H5
  return /micromessenger/i.test(navigator.userAgent);
  // #endif
  return false;
};

const getCurrentPageUrl = () => {
  // #ifdef H5
  return window.location.href;
  // #endif
  return '';
};

const loadWechatSdk = () => {
  // #ifdef H5
  if (window.wx?.config) {
    return Promise.resolve(window.wx);
  }

  if (wechatSdkPromise) {
    return wechatSdkPromise;
  }

  wechatSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
    script.async = true;
    script.onload = () => {
      if (window.wx?.config) {
        resolve(window.wx);
        return;
      }

      reject(new Error('微信 JS-SDK 加载成功但未找到 wx 对象'));
    };
    script.onerror = () => {
      reject(new Error('微信 JS-SDK 脚本加载失败'));
    };
    document.head.appendChild(script);
  });

  return wechatSdkPromise;
  // #endif

  return Promise.resolve(null);
};

const toAbsoluteUrl = (url) => {
  // #ifdef H5
  const fallbackUrl = new URL(DEFAULT_SHARE_IMAGE, window.location.origin).href;

  if (!url) {
    return fallbackUrl;
  }

  try {
    return new URL(url, window.location.origin).href;
  } catch (error) {
    console.warn('Invalid share image url, fallback to default image:', url, error);
    return fallbackUrl;
  }
  // #endif
  return url || DEFAULT_SHARE_IMAGE;
};

const updateAppMessageShareData = (wx, sharePayload) => {
  return new Promise((resolve, reject) => {
    wx.updateAppMessageShareData({
      title: sharePayload.title,
      desc: sharePayload.desc,
      link: sharePayload.link,
      imgUrl: sharePayload.imgUrl,
      success: resolve,
      fail: reject
    });
  });
};

const updateTimelineShareData = (wx, sharePayload) => {
  return new Promise((resolve, reject) => {
    wx.updateTimelineShareData({
      title: sharePayload.title,
      link: sharePayload.link,
      imgUrl: sharePayload.imgUrl,
      success: resolve,
      fail: reject
    });
  });
};

export const initWechatShare = async (shareData = {}) => {
  // #ifdef H5
  if (!isWechatBrowser()) {
    return false;
  }

  const taskId = ++latestShareTaskId;
  const pageUrl = getCurrentPageUrl();
  const wx = await loadWechatSdk();
  const result = await getJSSDKSignature(pageUrl);

  if (result.code !== 0 && result.code !== 200) {
    throw new Error(result.message || '获取微信签名失败');
  }

  const { appId, timestamp, nonceStr, signature } = result.data || {};
  if (!appId || !timestamp || !nonceStr || !signature) {
    throw new Error('微信签名参数不完整');
  }

  const sharePayload = {
    title: shareData.title || DEFAULT_SHARE_TITLE,
    desc: Object.prototype.hasOwnProperty.call(shareData, 'desc') ? shareData.desc : DEFAULT_SHARE_DESC,
    link: shareData.link || pageUrl,
    imgUrl: toAbsoluteUrl(shareData.imgUrl)
  };

  await new Promise((resolve, reject) => {
    wx.ready(async () => {
      if (taskId !== latestShareTaskId) {
        resolve(false);
        return;
      }

      try {
        await Promise.all([
          updateAppMessageShareData(wx, sharePayload),
          updateTimelineShareData(wx, sharePayload)
        ]);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    wx.error((error) => {
      if (taskId !== latestShareTaskId) {
        resolve(false);
        return;
      }

      reject(error);
    });

    wx.config({
      debug: false,
      appId,
      timestamp,
      nonceStr,
      signature,
      jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
    });
  });

  return true;
  // #endif

  return false;
};
