import { toggleplay as togglePlay } from '../../utils/util'
import event from '../../lib/Events/index'
const bsurl = require('../../utils/bsurl')
var async = require("../../utils/async.js");
import http from '../../lib/Http/index.js'

import { getCatlist, loginApi } from '../../api/home.js'

const app = getApp();

Page({
    data: {
        rec: {
            idx: 0, loading: false,
        },
        music: {},
        playing: false,
        playtype: {},
        banner: [4],
        thisday: (new Date()).getDate(),
        cateisShow: false,
        playlist: {
            idx: 1, loading: false,
            list: {},
            offset: 0,
            limit: 20
        },
        catelist: {
            res: {},
            checked: {}
        },
        djlist: {
            idx: 2, loading: false,
            list: [],
            offset: 0,
            limit: 20
        },
        djcate: { loading: false },
        djrecs: {},
        sort: {
            idx: 3, loading: false
        },
        tabidx: 0
    },
    toggleplay: function () {
        togglePlay(this, app);
    },
    playnext: function (e) {
        app.nextplay(e.currentTarget.dataset.pt)
    },
    music_next: function (r) {
        this.setData({
            music: r.music,
            playtype: r.playtype
        })
    },
    music_toggle: function (r) {
        this.setData({
            playing: r.playing
        })
    },
    onLoad: function (options) {
        if (options.share == 1) {
            var url = '../' + options.st + '/index?id=' + options.id
            console.log(url, options.st, options.id)
            wx.navigateTo({
                url: url,
                success: function () {
                    console.log("tiaozhuan chenggong")
                }
            })
            return;
        };
    },
    onHide: function () {
        event.off("music_next", this)
        event.off("music_toggle", this)
    },
    onShow: function () {
        event.on("music_next", this.music_next, this);
        event.on("music_toggle", this.music_toggle, this)
        this.setData({
            music: app.globalData.curplay,
            playing: app.globalData.playing,
            playtype: app.globalData.playtype,
        })
        // if (!wx.getStorageSync('user')) {
        //     wx.redirectTo({
        //         url: '../login/index'
        //     });
        //     return;
        // }
        !this.data.rec.loading && this.init();
    },
    gdjlist: function (isadd) {
        var that = this;
        var that = this;
        wx.request({
            url: bsurl + 'djradio/hot',
            data: {
                limit: that.data.djlist.limit,
                offset: that.data.djlist.offset
            },
            complete: function (res) {
                that.data.djlist.loading = true;
                if (!isadd) {
                    that.data.djlist.list = res.data
                } else {
                    res.data.djRadios = that.data.djlist.list.djRadios.concat(res.data.djRadios);
                    that.data.djlist.list = res.data
                }
                that.data.djlist.offset += res.data.djRadios.length;
                that.setData({
                    djlist: that.data.djlist
                })
            }
        })
    },
    gplaylist: function (isadd) {
        //分类歌单列表
        var that = this;
        wx.request({
            url: bsurl + 'top/playlist',
            data: {
                limit: that.data.playlist.limit,
                offset: that.data.playlist.offset,
                type: that.data.catelist.checked.name
            },
            complete: function (res) {
                that.data.playlist.loading = true;
                if (!isadd) {
                    that.data.playlist.list = res.data
                } else {
                    res.data.playlists = that.data.playlist.list.playlists.concat(res.data.playlists);
                    that.data.playlist.list = res.data
                }
                that.data.playlist.offset += res.data.playlists.length;
                that.setData({
                    playlist: that.data.playlist
                })
            }
        })
    },
    onReachBottom: function () {
        if (this.data.tabidx == 1) {
            this.gplaylist(1);//更多歌单
        }
        else if (this.data.tabidx == 2) {
            this.gdjlist(1);//更多dj节目
        }
    },
    togglePtype: function () {
        this.setData({
            cateisShow: !this.data.cateisShow
        })
    },
    cateselect: function (e) {
        var t = e.currentTarget.dataset.catype;
        this.data.catelist.checked = t
        this.setData({
            playlist: {
                idx: 1,
                loading: false,
                list: {},
                offset: 0,
                limit: 20
            },
            cateisShow: !this.data.cateisShow,
            catelist: this.data.catelist
        });
        this.gplaylist();
    },

    init: function () {
        var that = this
        var rec = this.data.rec
        //banner，
        wx.request({
            url: bsurl + 'banner?type=2',
            // data: { cookie: app.globalData.cookie },
            success: function (res) {
                that.setData({
                    banner: res.data.banners
                })
            }
        });
        getCatlist().then((res)=> {
          that.setData({
            catelist: {
              isShow: false,
              res: res,
              checked: res.all
            }
          })
        })
      const urlArr = ['personalized', 'personalized/newsong', 'personalized/mv', 'personalized/djprogram']
      const promiseArr = urlArr.map(val => http.get({url:val}))

      // console.log('promiseArr', promiseArr)
      Promise.all(promiseArr).then( val => {
        const arr = val.map(val => val.result)
        this.setData({
        'rec.re': arr,
        'rec.loading': true,
        })
      })
    }
})