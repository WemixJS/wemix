const componentIns = {}
export const setComponent = function (webviewId, id, ins) {
  if (!componentIns[webviewId]) {
    componentIns[webviewId] = {}
  }
  if (!componentIns[webviewId][id]) {
    componentIns[webviewId][id] = []
  }
  componentIns[webviewId][id].push(ins)
}

export const getComponent = function (webviewId, id) {
  return (
    componentIns[webviewId] &&
    componentIns[webviewId][id] &&
    componentIns[webviewId][id][0]
  )
}

export const getAllComponent = function (webviewId) {
  let components = []
  for (const key in componentIns[webviewId]) {
    components = components.concat(componentIns[webviewId][key])
  }
  return components
}

export const deleteComponent = function (webviewId, id, nodeId) {
  const components = componentIns[webviewId][id]
  if (components) {
    for (let i = 0; i < components.length; i++) {
      if (components[i].__exparserNodeId__ === nodeId) {
        componentIns[webviewId][id].splice(i, 1)
        break
      }
    }
  }
}

export const deleteAllComponent = function (webviewId) {
  delete componentIns[webviewId]
}
