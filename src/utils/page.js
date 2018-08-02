import mitt from 'mitt'
import shallowEqual from 'shallowequal'
import { watch } from '../lib/observe'
const app = getApp()
const emitter = mitt()

const newPage = function(config) {
  const { onLoad, observe, onUnload, mapState } = config
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
    if (mapState) {
      Object.keys(mapState).forEach(key => {
        const fn = mapState[key]
        const val = fn(app)
        watch(_ => {
          this.setData({
            [key]: fn(app)
          })
        })
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