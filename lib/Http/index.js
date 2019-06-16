import config from '../../config'

class Http {
  constructor() {
    this.instance = null
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Http()
    }
    return this.instance
  }

  get(params) {
    params.method = 'GET'
    console.log('get:', params.url)
    return this.request(params).then(res => res )
  }

  post(params) {
    params.method = 'POST'
    console.log('post:',params.url)
    return this.request(params).then(res => res)
  }

  request({
    url,
    data={},
    header,
    method
  }) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: config.baseUrl + url,
        header,
        data,
        success: (res) => {
          const { statusCode } = res
          if(statusCode>=200 && statusCode<300) {
            // console.log('res.header',res.header)
            if (res.header["Set-Cookie"]) {
              let cookie = res.header["Set-Cookie"]
              cookie = cookie.toString().split(';')[0]
              wx.setStorageSync("cookie", cookie)
              console.log('cookie', cookie)
            }
            resolve(res.data)
          }
        },
        fail: (err) => {
          wx.showModal({
            title: '提示',
            content: err.errMsg,
          })
          reject()
        }
      })
    })
  }


}

const http = new Http.getInstance()
export default http