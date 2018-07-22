const newPage = function(config) {
  const { onLoad } = config
  config.onLoad = function (onLoadOptions) {
    const pages = getCurrentPages()
    this.__previousPage = pages[pages.length - 2]
    if (this.__previousPage) {
      onLoadOptions.params = this.__previousPage.__params
      delete this.__previousPage.__params
    }
    if (onLoad) onLoad.call(this, onLoadOptions)
  }

  config.navigateTo = function ({ url, params }) {
    this.__params = params
    wx.navigateTo({ url })
  }
  return Page(config)
}

export default newPage