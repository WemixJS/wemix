import wechat from './wechatAdapter'
import alipay from './alipay'

export default class Adapter {
  constructor (compiler) {
    if (compiler) {
      switch (compiler.options.export) {
        case 'alipay':
          this.platform = alipay
          break
        default:
          this.platform = wechat
          break
      }
    } else {
      this.platform = wechat
    }
  }
  getEntryConfigPath () {
    return this.platform.getEntryConfigPath
  }
  getOutputConfigPath () {
    return this.platform.getOutputConfigPath
  }
  getOutputPath () {
    return this.platform.getOutputPath
  }
  transformHtml () {}
  transformJs () {}
  transformStyle () {}
  splitConfig () {}
}
