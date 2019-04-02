export default class {
  $init (wemix, $wxpage, pagePath, ...args) {
    this.options = args[0]
    this.route = `/${pagePath}`
    this.search = wemix.parseSearch(this.options)
    this.setData = (data, func) => {
      for (let key in data) {
        if (data[key] === undefined) {
          delete data[key]
        }
      }
      $wxpage.setData(data, func)
    }
    // this.emit = (config = {}, ...args) => {
    //   config = Object.assign({ listenCurrentRoute: false }, config)
    //   if (config.listenerName) {
    //     const pages = getCurrentPages()
    //     if (config.listenCurrentRoute) {
    //       const route = pages[pages.length - 1].route || pages[pages.length - 1].__route__
    //       if (route && wemix.instance.pages && wemix.instance.pages[`/${route}`]) {
    //         const samePages = Object.keys(wemix.instance.pages[`/${route}`]) || []
    //         samePages.forEach(item => {
    //           const currentPageInstance = wemix.instance.pages[`/${route}`][item]
    //           currentPageInstance.constructor['listeners'] &&
    //             currentPageInstance.constructor['listeners'][config.listenerName] &&
    //             currentPageInstance.constructor['listeners'][config.listenerName].apply(currentPageInstance, args)
    //           checkComListeners(wemix, wemix.config.pages[`/${route}`], currentPageInstance.__wxWebviewId__, config.listenerName, args)
    //         })
    //       }
    //     } else {
    //       pages.forEach((page) => {
    //         const route = page.route || page.__route__
    //         if (route && wemix.instance.pages && wemix.instance.pages[`/${route}`]) {
    //           const samePages = Object.keys(wemix.instance.pages[`/${route}`]) || []
    //           samePages.forEach(item => {
    //             const currentPageInstance = wemix.instance.pages[`/${route}`][item]
    //             currentPageInstance.constructor['listeners'] &&
    //               currentPageInstance.constructor['listeners'][config.listenerName] &&
    //               currentPageInstance.constructor['listeners'][config.listenerName].apply(currentPageInstance, args)
    //             checkComListeners(wemix, wemix.config.pages[`/${route}`], currentPageInstance.__wxWebviewId__, config.listenerName, args)
    //           })
    //         }
    //       })
    //     }
    //   }
    // }
  }
}
