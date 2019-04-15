import wemix from '@wemix/core'

/**
 * 类名不要使用Page字段
 */
export default class Index extends wemix.page {
  constructor () {
    super()
    this.data = {}
  }
  onLoad (options) { }
  onShow () { }
  onHide () { }
  onUnload () { }
}

Index.config = {
  navigationBarTitleText: 'wemix',
  usingComponents: {
    'list-component': '/components/normal/list',
  },
  wechatComponents: {
    'login-component': '/components/wechat/login',
  },
  alipayComponents: {
    'login-component': '/components/alipay/login',
  },
  swanComponents: {
    'login-component': '/components/swan/login',
  },
  ttComponents: {
    'login-component': '/components/tt/login',
  },
}
