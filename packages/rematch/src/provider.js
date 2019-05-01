function Provider (store) {
  return appObj => {
    appObj.store = store
    return appObj
  }
}
export default Provider
