import mitt from 'mitt'
import shallowEqual from 'shallowequal'
const app = getApp()
const emitter = mitt()

const newPage = function(config) {
  const { onLoad, observe, onUnload } = config
  config.onLoad = function (onLoadOptions) {
    const pages = getCurrentPages()
    this.__previousPage = pages[pages.length - 2]
    if (this.__previousPage) {
      onLoadOptions.params = this.__previousPage.__params
      delete this.__previousPage.__params
    }
    if (observe) {
      const proxyData = observe(app)
      this.setData(proxyData)
      this.__proxyData = proxyData
      const self = this
      emitter.on('change', () => {
        const newData = observe(app)
        if (!shallowEqual(newData, this.__proxyData)) {
          console.log(`data is changed`)
          this.setData(newData)
          this.__proxyData = newData
        }
      })
    }
    if (onLoad) onLoad.call(this, onLoadOptions)
  }

  config.setAppData = function(data) {
    if (typeof data === 'object') {
      app.globalData = {
        ...app.globalData,
        ...data,
      }
      emitter.emit('change')
    }
  }

  config.navigateTo = function ({ url, params }) {
    this.__params = params
    wx.navigateTo({ url })
  }
  config.onUnload = function() {

  }
  return Page(config)
}

export default newPage