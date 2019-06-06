const defaultMapStateToProps = () => ({})
const defaultMapDispatchToProps = () => ({})

function connect (
  mapStateToProps = defaultMapStateToProps,
  mapDispatchToProps = defaultMapDispatchToProps
) {
  const store = getApp().store
  const _initRematch = function () {
    // 每次页面显示就setData,此时的作用域在wemix page实例
    const data = mapStateToProps(store.getState())
    const patch = mapDispatchToProps(store.dispatch)
    this.dispatchPropsKeys = Object.keys(data) || []
    this.props = this.props || {}
    Object.assign(this.props, patch)
    // 用wemixpage实例去setData
    this.setProps(data)
    if (!this.dispatch) {
      this.dispatch = store.dispatch
    }
  }
  return function (pageConfig, cls, type) {
    // dispatch 更新data的时候要用到
    cls.mapStateToProps = mapStateToProps
    cls.mapDispatchToProps = mapDispatchToProps
    switch (type) {
      case 'page':
        // page: wechat alipay tt swan
        const _onLoad = pageConfig.onLoad
        const _onShow = pageConfig.onShow
        const onLoad = function (...args) {
          this.onLoadFlag = true
          // core 会去调用该接口
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
            // core 会去调用该接口
            this.$initRematch = _initRematch
            return _didMount && _didMount.apply(this, args)
          }
          Object.assign(pageConfig, { didMount })
        }
        if (_attached) {
          const attached = function (...args) {
            // core 会去调用该接口
            this.$initRematch = _initRematch
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
