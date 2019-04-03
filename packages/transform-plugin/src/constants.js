export const EXPORT_WECHAT = 'wechat'
export const EXPORT_ALIPAY = 'alipay'
export const EXPORT_TT = 'tt'
export const EXPORT_SWAN = 'swan'
export const WECHAT_HTML_EXT = '.wxml'
export const WECHAT_STYLE_EXT = '.wxss'
export const ALIPAY_HTML_EXT = '.axml'
export const ALIPAY_STYLE_EXT = '.acss'
export const TT_HTML_EXT = '.ttml'
export const TT_STYLE_EXT = '.ttss'
export const SWAN_HTML_EXT = '.swan'
export const SWAN_STYLE_EXT = '.css'

export const WECHAT_APP_CONFIG = {
  pages: 'pages',
  debug: 'debug',
  subpackages: 'subpackages',
  window: {
    navigationBarBackgroundColor: 'navigationBarBackgroundColor',
    navigationBarTextStyle: 'navigationBarTextStyle',
    navigationBarTitleText: 'navigationBarTitleText',
    backgroundColor: 'backgroundColor',
    backgroundTextStyle: 'backgroundTextStyle',
    enablePullDownRefresh: 'enablePullDownRefresh',
    onReachBottomDistance: 'onReachBottomDistance',
  },
  tabBar: {
    color: 'color',
    selectedColor: 'selectedColor',
    backgroundColor: 'backgroundColor',
    list: {
      pagePath: 'pagePath',
      text: 'text',
      iconPath: 'iconPath',
      selectedIconPath: 'selectedIconPath',
    },
  },
}

export const ALIPAY_APP_CONFIG = {
  pages: 'pages',
  window: {
    titleBarColor: 'navigationBarBackgroundColor',
    defaultTitle: 'navigationBarTitleText',
    pullRefresh: 'enablePullDownRefresh',
    allowsBounceVertical: 'YES',
  },
  tabBar: {
    textColor: 'color',
    selectedColor: 'selectedColor',
    backgroundColor: 'backgroundColor',
    items: {
      pagePath: 'pagePath',
      name: 'text',
      icon: 'iconPath',
      activeIcon: 'selectedIconPath',
    },
  },
}

export const TT_APP_CONFIG = {
  pages: 'pages',
  debug: 'debug',
  window: {
    navigationBarBackgroundColor: 'navigationBarBackgroundColor',
    navigationBarTextStyle: 'navigationBarTextStyle',
    navigationBarTitleText: 'navigationBarTitleText',
    backgroundColor: 'backgroundColor',
    backgroundTextStyle: 'backgroundTextStyle',
    enablePullDownRefresh: 'enablePullDownRefresh',
    onReachBottomDistance: 'onReachBottomDistance',
  },
  tabBar: {
    color: 'color',
    selectedColor: 'selectedColor',
    backgroundColor: 'backgroundColor',
    list: {
      pagePath: 'pagePath',
      text: 'text',
      iconPath: 'iconPath',
      selectedIconPath: 'selectedIconPath',
    },
  },
}

export const SWAN_APP_CONFIG = {
  pages: 'pages',
  subpackages: 'subpackages',
  window: {
    navigationBarBackgroundColor: 'navigationBarBackgroundColor',
    navigationBarTextStyle: 'navigationBarTextStyle',
    navigationBarTitleText: 'navigationBarTitleText',
    backgroundColor: 'backgroundColor',
    backgroundTextStyle: 'backgroundTextStyle',
    enablePullDownRefresh: 'enablePullDownRefresh',
    onReachBottomDistance: 'onReachBottomDistance',
  },
  tabBar: {
    color: 'color',
    selectedColor: 'selectedColor',
    backgroundColor: 'backgroundColor',
    list: {
      pagePath: 'pagePath',
      text: 'text',
      iconPath: 'iconPath',
      selectedIconPath: 'selectedIconPath',
    },
  },
}

export const WECHAT_PAGE_CONFIG = {
  navigationBarBackgroundColor: 'navigationBarBackgroundColor',
  navigationBarTextStyle: 'navigationBarTextStyle',
  navigationBarTitleText: 'navigationBarTitleText',
  backgroundColor: 'backgroundColor',
  backgroundTextStyle: 'backgroundTextStyle',
  enablePullDownRefresh: 'enablePullDownRefresh',
  onReachBottomDistance: 'onReachBottomDistance',
  usingComponents: 'usingComponents',
}

export const ALIPAY_PAGE_CONFIG = {
  titleBarColor: 'navigationBarBackgroundColor',
  defaultTitle: 'navigationBarTitleText',
  pullRefresh: 'enablePullDownRefresh',
  allowsBounceVertical: 'YES',
  usingComponents: 'usingComponents',
}
export const TT_PAGE_CONFIG = {
  navigationBarBackgroundColor: 'navigationBarBackgroundColor',
  navigationBarTextStyle: 'navigationBarTextStyle',
  navigationBarTitleText: 'navigationBarTitleText',
  backgroundColor: 'backgroundColor',
  backgroundTextStyle: 'backgroundTextStyle',
  enablePullDownRefresh: 'enablePullDownRefresh',
  onReachBottomDistance: 'onReachBottomDistance',
  usingComponents: 'usingComponents',
}
export const SWAN_PAGE_CONFIG = {
  navigationBarBackgroundColor: 'navigationBarBackgroundColor',
  navigationBarTextStyle: 'navigationBarTextStyle',
  navigationBarTitleText: 'navigationBarTitleText',
  backgroundColor: 'backgroundColor',
  backgroundTextStyle: 'backgroundTextStyle',
  enablePullDownRefresh: 'enablePullDownRefresh',
  onReachBottomDistance: 'onReachBottomDistance',
  usingComponents: 'usingComponents',
}

export const STANDARD_ATTRIBUTE_PREFIX = 'wm'
export const STANDARD_ATTRIBUTE = {
  if: 'wm:if',
  else: 'wm:else',
  elseif: 'wm:elseif',
  for: 'wm:for',
  forItem: 'wm:forItem',
  forIndex: 'wm:forIndex',
  key: 'wm:key',
  bindtap: 'bindtap',
  bindlongtap: 'bindlongtap',
  bindtouchstart: 'bindtouchstart',
  bindtouchmove: 'bindtouchmove',
  bindtouchcancel: 'bindtouchcancel',
  bindtouchend: 'bindtouchend',
  catchtap: 'catchtap',
  catchlongtap: 'catchlongtap',
  catchtouchstart: 'catchtouchstart',
  catchtouchmove: 'catchtouchmove',
  catchtouchcancel: 'catchtouchcancel',
  catchtouchend: 'catchtouchend',
}

export const WECHAT_ATTRIBUTE = {
  if: 'wx:if',
  else: 'wx:else',
  elseif: 'wx:elif',
  for: 'wx:for',
  forItem: 'wx:for-item',
  forIndex: 'wx:for-index',
  key: 'wx:key',
  bindtap: 'bindtap',
  bindlongtap: 'bindlongpress',
  bindtouchstart: 'bindtouchstart',
  bindtouchmove: 'bindtouchmove',
  bindtouchcancel: 'bindtouchcancel',
  bindtouchend: 'bindtouchend',
  catchtap: 'catchtap',
  catchlongtap: 'catchlongpress',
  catchtouchstart: 'catchtouchstart',
  catchtouchmove: 'catchtouchmove',
  catchtouchcancel: 'catchtouchcancel',
  catchtouchend: 'catchtouchend',
}

export const ALIPAY_ATTRIBUTE = {
  if: 'a:if',
  else: 'a:else',
  elseif: 'a:elif',
  for: 'a:for',
  forItem: 'a:for-item',
  forIndex: 'a:for-index',
  key: 'a:key',
  bindtap: 'onTap',
  bindlongtap: 'onLongTap',
  bindtouchstart: 'onTouchStart',
  bindtouchmove: 'onTouchMove',
  bindtouchcancel: 'onTouchCancel',
  bindtouchend: 'onTouchEnd',
  catchtap: 'catchTap',
  catchlongtap: 'catchLongTap',
  catchtouchstart: 'catchTouchStart',
  catchtouchmove: 'catchTouchMove',
  catchtouchcancel: 'catchTouchCancel',
  catchtouchend: 'catchTouchEnd',
}

export const TT_ATTRIBUTE = {
  if: 'tt:if',
  else: 'tt:else',
  elseif: 'tt:elif',
  for: 'tt:for',
  forItem: 'tt:for-item',
  forIndex: 'tt:for-index',
  key: 'tt:key',
  bindtap: 'bindtap',
  bindlongtap: 'bindlongpress',
  bindtouchstart: 'bindtouchstart',
  bindtouchmove: 'bindtouchmove',
  bindtouchcancel: 'bindtouchcancel',
  bindtouchend: 'bindtouchend',
  catchtap: 'catchtap',
  catchlongtap: 'catchlongpress',
  catchtouchstart: 'catchtouchstart',
  catchtouchmove: 'catchtouchmove',
  catchtouchcancel: 'catchtouchcancel',
  catchtouchend: 'catchtouchend',
}
export const SWAN_ATTRIBUTE = {
  if: 's-if',
  else: 's-else',
  elseif: 's-elif',
  for: 's-for',
  forItem: 's-for-item',
  forIndex: 's-for-index',
  key: 's-key',
  bindtap: 'bindtap',
  bindlongtap: 'bindlongpress',
  bindtouchstart: 'bindtouchstart',
  bindtouchmove: 'bindtouchmove',
  bindtouchcancel: 'bindtouchcancel',
  bindtouchend: 'bindtouchend',
  catchtap: 'catchtap',
  catchlongtap: 'catchlongpress',
  catchtouchstart: 'catchtouchstart',
  catchtouchmove: 'catchtouchmove',
  catchtouchcancel: 'catchtouchcancel',
  catchtouchend: 'catchtouchend',
}
