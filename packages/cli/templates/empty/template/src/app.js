import wemix from '@wemix/core'

/**
 * 类名不要使用App字段
 */
export default class Main extends wemix.app {
  onLaunch (options) { }
  onShow (options) { }
  onHide () { }
  onError (msg) { }
  onPageShow () { }
  onPageHide (tp) { }
  onLog (type, e, data) { }
}

Main.config = {
  pages: ['pages/index'],
  window: {
    navigationBarBackgroundColor: '#000000',
    navigationBarTitleText: 'wemix',
  },
}
