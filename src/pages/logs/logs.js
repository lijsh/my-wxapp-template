//logs.js
const util = require('../../utils/util')
import { page } from 'omina'

page({
  data: {
    logs: []
  },
  mapState: {
    logInfo(app) {
      return `${app.globalData.test.foo} + ${app.globalData.name}`
    },
    fooBar(app) {
      return JSON.stringify(app.globalData.test.bar)
    }
  },
  onLoad: function (option) {
    console.log('params from previous page is', option.params)
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  }
})
