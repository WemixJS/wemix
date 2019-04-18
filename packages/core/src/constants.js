export const NATIVE_API = [
  // 图片
  'saveImageToPhotosAlbum',
  'previewImage',
  'getImageInfo',
  'compressImage',
  'chooseMessageFile',
  'chooseImage',
  // 数据存储
  'setStorageSync',
  'setStorage',
  'removeStorageSync',
  'removeStorage',
  'getStorageSync',
  'getStorage',
  'getStorageInfoSync',
  'getStorageInfo',
  'clearStorageSync',
  'clearStorage',
  // 下拉刷新
  'stopPullDownRefresh',
  'startPullDownRefresh',
  // 转发
  'updateShareMenu',
  'showShareMenu',
  'hideShareMenu',
  'getShareInfo',
  // 位置
  'openLocation',
  'getLocation',
  'chooseLocation',
  // 导航栏
  'showNavigationBarLoading',
  'setNavigationBarTitle',
  'setNavigationBarColor',
  'hideNavigationBarLoading',
  // 背景
  'setBackgroundTextStyle',
  'setBackgroundColor',
  // 收获地址
  'chooseAddress',
  // 交互
  'showToast',
  'showModal',
  'showLoading',
  'showActionSheet',
  'hideToast',
  'hideLoading',
  // 系统信息
  'getSystemInfoSync',
  'getSystemInfo',
]
export const ALI_UNSUPPORTED_API_WARNING = '支付宝小程序不支持'
export const ALI_UNSUPPORTED_API = [
  'chooseMessageFile',
  'updateShareMenu',
  'showShareMenu',
  'getShareInfo',
  'chooseAddress',
]
export const TT_UNSUPPORTED_API_WARNING = '头条小程序不支持'
export const TT_UNSUPPORTED_API = [
  'getImageInfo',
  'compressImage',
  'chooseMessageFile',
  'updateShareMenu',
  'getShareInfo',
  'chooseLocation',
  'showNavigationBarLoading',
  'setNavigationBarColor',
  'hideNavigationBarLoading',
  'setBackgroundTextStyle',
  'setBackgroundColor',
  'chooseAddress',
]
export const SWAN_UNSUPPORTED_API_WARNING = '百度小程序不支持'
export const SWAN_UNSUPPORTED_API = [
  'compressImage',
  'chooseMessageFile',
  'hideShareMenu',
  'updateShareMenu',
  'showShareMenu',
  'getShareInfo',
]
