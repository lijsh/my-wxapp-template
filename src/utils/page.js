import { set, del } from '../lib/observe/index'
import { Watcher } from '../lib/observe/watcher'
const app = getApp()

const newPage = function(config) {
  const { onLoad, onUnload, mapState } = config
  config.onLoad = function (onLoadOptions) {
    const pages = getCurrentPages()
    this.$previousPage = pages[pages.length - 2]
    if (this.$previousPage) {
      onLoadOptions.params = this.$previousPage.__params
      delete this.$previousPage.__params
    }
    if (mapState) {
      Object.keys(mapState).forEach(key => {
        const fn = mapState[key]
        new Watcher(this, _ => {
          const ret = fn(app)
          this.setData({
            [key]: ret
          })
          return ret
        }, { isMapStateWatcher:true, exp: fn, key })
      })
    }

    if (onLoad) onLoad.call(this, onLoadOptions)
  }

  config.$navTo = function ({ url, params }) {
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
    delete this.$watchers
    if (onUnload) onUnload.call(this)
  }
  return Page(config)
}

export default newPage
