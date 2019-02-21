import wemix from 'wemix'

/**
 * 类名不要使用App字段
 */
export default class Main extends wemix.app {
  onLaunch (options) {}
  onShow (options) {}
  onHide () {}
  onError (msg) {}
  onPageShow () {}
  onPageHide (tp) {}
  onClick (e) {}
}

Main.config = {
  pages: ['pages/main/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: 'WEMIX',
    navigationBarTextStyle: 'black',
  },
}
