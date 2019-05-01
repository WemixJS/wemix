function createStore (config) {
  const models = config.models
  const store = {
    models,
    getState: () => {
      const states = {}
      Object.keys(models).map(key => {
        states[key] = models[key].state
      })
      return states
    },
    dispatch: {},
  }
  const rootState = store.getState()
  // 由事件触发一次所有view的变更
  function handleChange () {
    const rootState = store.getState() // 这里必须重新取一次state,是因为有些state是纯数字，没法通过引用自动修改
    const pages = getCurrentPages() || []
    pages.map(page => {
      if (page.page.constructor.mapStateToData) {
        const data = page.page.constructor.mapStateToData(rootState)
        page.page.setData(data)
      }
      const instances = page.page.selectAllComponents()
      instances.map(item => {
        if (item.constructor.mapStateToData) {
          const data = item.constructor.mapStateToData(rootState)
          item.setData(data)
        }
      })
    })
  }

  // 遍历reducers和effects，分别传入state和rootState,并触发数据变化，并都绑到dispatch上
  Object.keys(models).map(key => {
    const model = models[key]
    const reducers = model.reducers || {}
    const effects = (model.effects && model.effects(store.dispatch)) || {}

    store.dispatch[key] = {}
    const reducerInDispatch = {}
    for (const func in reducers) {
      const fn = reducers[func]
      reducerInDispatch[func] = store.dispatch[key][func] = (...payload) => {
        model.state = fn.call({}, model.state, ...payload)
        handleChange()
      }
    }
    for (const func in effects) {
      const fn = effects[func]

      store.dispatch[key][func] = (...payload) => {
        fn.call(reducerInDispatch, ...payload, rootState) // TODO，这里需要验证一下rootState是否需要临时取
      }
    }
  })
  return store
}

export default createStore