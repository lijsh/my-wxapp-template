//logs.js
const util = require('../../utils/util')
import Page from '../../utils/page'

Page({
  data: {
    logs: []
  },
  mapState: {
    logInfo(app) {
      return `${app.globalData.test.foo} + ${app.globalData.name}`
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
