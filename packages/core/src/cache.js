const componentIns = {}
export const setComponent = function (id, cls, ins) {
  if (!componentIns[ins.__webviewId__]) {
    componentIns[ins.__webviewId__] = []
  }
  componentIns[ins.__webviewId__].push({
    id: id,
    class: cls,
    ins: ins,
  })
}

export const getComponent = function (webviewId, selector) {
  if (toString.call(componentIns[webviewId]) === '[object Array]') {
    if (selector[0] === '.' || selector[0] === '#') {
      for (let i = 0; i < componentIns[webviewId].length; i++) {
        if (
          selector[0] === '#' &&
          componentIns[webviewId][i].id === selector.substr(1)
        ) {
          return componentIns[webviewId][i].ins
        }
        const preReg = new RegExp(`^${selector.substr(1)} `)
        const curReg = new RegExp(` ${selector.substr(1)} `)
        const nextReg = new RegExp(` ${selector.substr(1)}$`)
        if (
          selector[0] === '.' &&
          (preReg.test(componentIns[webviewId][i].class) ||
            curReg.test(componentIns[webviewId][i].class) ||
            nextReg.test(componentIns[webviewId][i].class))
        ) {
          return componentIns[webviewId][i].ins
        }
      }
    } else {
      console.warn('Only support #id or .class')
    }
  }
}

export const getAllComponents = function (webviewId, selector) {
  if (toString.call(componentIns[webviewId]) === '[object Array]') {
    if (!selector) {
      return componentIns[webviewId]
        .filter(val => {
          return val
        })
        .map(item => {
          return item.ins
        })
    }
    const components = []
    if (selector[0] === '.' || selector[0] === '#') {
      for (let i = 0; i < componentIns[webviewId].length; i++) {
        if (selector[0] === '#') {
          if (componentIns[webviewId][i].id === selector.substr(1)) {
            components.push(componentIns[webviewId][i].ins)
          }
        }
        if (selector[0] === '.') {
          const preReg = new RegExp(`^${selector.substr(1)} `)
          const curReg = new RegExp(` ${selector.substr(1)} `)
          const nextReg = new RegExp(` ${selector.substr(1)}$`)
          if (
            preReg.test(componentIns[webviewId][i].class) ||
            curReg.test(componentIns[webviewId][i].class) ||
            nextReg.test(componentIns[webviewId][i].class)
          ) {
            components.push(componentIns[webviewId][i].ins)
          }
        }
      }
    }
    return components
  } else {
    return []
  }
}

export const deleteComponent = function (webviewId, nodeId) {
  if (componentIns[webviewId]) {
    componentIns[webviewId].forEach((item, i) => {
      if (
        item.ins.__webviewId__ === webviewId &&
        item.ins.__exparserNodeId__ === nodeId
      ) {
        delete componentIns[webviewId][i]
      }
    })
  }
}

export const deleteAllComponents = function (webviewId) {
  if (componentIns[webviewId]) {
    delete componentIns[webviewId]
  }
}
