<script>
// import { initWechatShare } from '@/utils/weixinShare.js'

export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
    // 在页面显示时调用微信SDK初始化 (暂时注释避开接口报错)
    // setTimeout(() => {
    //   initWechatShare()
    // }, 500)
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */
</style>
