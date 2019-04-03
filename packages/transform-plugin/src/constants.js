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
  mixins: 'mixins',
  usingComponents: 'usingComponents',
}

export const ALIPAY_PAGE_CONFIG = {
  titleBarColor: 'navigationBarBackgroundColor',
  defaultTitle: 'navigationBarTitleText',
  pullRefresh: 'enablePullDownRefresh',
  allowsBounceVertical: 'YES',
  mixins: 'mixins',
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
  mixins: 'mixins',
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
  mixins: 'mixins',
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
}

export const WECHAT_ATTRIBUTE = {
  if: 'wx:if',
  else: 'wx:else',
  elseif: 'wx:elif',
  for: 'wx:for',
  forItem: 'wx:for-item',
  forIndex: 'wx:for-index',
  key: 'wx:key',
}

export const ALIPAY_ATTRIBUTE = {
  if: 'a:if',
  else: 'a:else',
  elseif: 'a:elif',
  for: 'a:for',
  forItem: 'a:for-item',
  forIndex: 'a:for-index',
  key: 'a:key',
}

export const TT_ATTRIBUTE = {}
export const SWAN_ATTRIBUTE = {}
