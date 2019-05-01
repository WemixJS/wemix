const defaultMapStateToData = () => ({})

function connect (mapStateToData = defaultMapStateToData) {
  const store = getApp().store
  const _initRematch = function () {
    // 每次页面显示就setData,此时的作用域在wemix page实例
    const data = mapStateToData(store.getState())
    // 用wemixpage实例去setData
    this.setData(data)
    if (!this.dispatch) {
      this.dispatch = store.dispatch
    }
  }
  return function (pageConfig, cls, type) {
    // dispatch 更新data的时候要用到
    cls.mapStateToData = mapStateToData
    switch (type) {
      case 'page':
        // page: wechat alipay tt swan
        const _onLoad = pageConfig.onLoad
        const _onShow = pageConfig.onShow
        const onLoad = function (...args) {
          this.onLoadFlag = true
          this.$initRematch = _initRematch
          return _onLoad && _onLoad.apply(this, args)
        }
        const onShow = function (...args) {
          if (!this.onLoadFlag) {
            _initRematch.call(this.page)
            // onShow的时候组件也要更新数据
            const instances = this.page.selectAllComponents()
            instances.map(item => {
              _initRematch.call(item)
            })
          }
          this.onLoadFlag = false
          return _onShow && _onShow.apply(this, args)
        }
        Object.assign(pageConfig, { onLoad, onShow })
        break
      case 'component':
        // component: alipay
        const _didMount = pageConfig.didMount
        const _attached = pageConfig.attached
        if (_didMount) {
          const didMount = function (...args) {
            this.$initRematch = _initRematch
            return _didMount && _didMount.apply(this, args)
          }
          Object.assign(pageConfig, { didMount })
        }
        if (_attached) {
          const attached = function (...args) {
            _initRematch.call(this.component)
            this.dispatch = store.dispatch
            return _attached && _attached.apply(this, args)
          }
          Object.assign(pageConfig, { attached })
        }
        break
    }
    return pageConfig
  }
}
export default connect
