import { set, del } from '../lib/observe/index'
import { Watcher } from '../lib/observe/watcher'
const app = getApp()

const newPage = function(config) {
  const { onLoad, observe, onUnload, mapState } = config
  config.onLoad = function (onLoadOptions) {
    const pages = getCurrentPages()
    this.__previousPage = pages[pages.length - 2]
    if (this.__previousPage) {
      onLoadOptions.params = this.__previousPage.__params
      delete this.__previousPage.__params
    }
    if (mapState) {
      Object.keys(mapState).forEach(key => {
        const fn = mapState[key]
        new Watcher(_ => {
          this.setData({
            [key]: fn(app)
          })
        }, this)
      })
    }

    if (onLoad) onLoad.call(this, onLoadOptions)
  }

  config.$navigateTo = function ({ url, params }) {
    this.__params = params
    wx.navigateTo({ url })
  }

  config.$set = set
  config.$del = del

  config.onUnload = function() {
    if (Array.isArray(this.$watchers)) {
      this.$watchers.forEach(watcher => {
        watcher.teardown()
      })
    }
    if (onUnload) onUnload.call(this)
  }
  return Page(config)
}

export default newPage
