import event from './lib/Events/index'
import { getUrlApi, loginApi, refreshApi, getFmApi,getLikeApi } from './api/home';
const bgAudioManager = wx.getBackgroundAudioManager();

App({
  onLaunch() {
    var cookie = wx.getStorageSync('cookie') || '';
    var gb = wx.getStorageSync("globalData");
    gb && (this.globalData = gb)
    const { globalData } = this
    globalData.cookie = cookie
    // var that = this;
    //当前歌曲播放结束后，播放列表中下一首
    bgAudioManager.onEnded(() => {
      const { globalStop, playtype } = this.globalData
      if (globalStop) {
        return;
      }
      if (playtype != 2) {
        this.nextplay(playtype);
      } else {
        this.nextfm();
      }
    })

    //监听音乐暂停，保存播放进度广播暂停状态
    bgAudioManager.onPause(() => {
      const { globalData } = this
      event.trigger("music_toggle", {
        playing: false,
        playtype: globalData.playtype,
        music: globalData.curplay || {}
      });

      globalData.playing = false;
      globalData.globalStop = globalData.hide ? true : false;
      wx.getBackgroundAudioPlayerState({
        complete: function (res) {
          globalData.currentPosition = res.currentPosition ? res.currentPosition : 0
        }
      })
    });
    this.mine();
    // this.likelist();

  },

  //  获取我的
  mine() {
    loginApi().then( res => {
      wx.setStorageSync('user', res)
    })
  },


  //  获取喜欢列表
  likelist() {
    getLikeApi().then(() => {
      this.globalData.staredlist = res.ids
    })
  },

  nextplay(t, pos) {
    //播放列表中下一首
    this.preplay();
    const { globalData } = this
    let { playtype, curplay } = globalData
    if (globalData.playtype == 2) {
      this.nextfm();
      return;
    }
    const list = playtype == 1 ? globalData.list_am : globalData.list_dj;
    let index = playtype == 1 ? this.globalData.index_am : this.globalData.index_dj;
    t == 1 ? index++ : index--;
    index = index > list.length - 1 ? 0 : (index < 0 ? list.length - 1 : index);
    index = pos != undefined ? pos : index;
    curplay = (playtype == 1 ? list[index] : list[index].mainSong) || curplay;
    if (this.globalData.staredlist.indexOf(curplay.id) != -1) {
      curplay.starred = true;
      curplay.st = true;
    }
    if (playtype == 1) {
      this.globalData.index_am = index;
    } else {
      this.globalData.index_dj = index;
    }
    event.trigger("music_next", {
      music: curplay,
      playtype: playtype,
      p: playtype == 1 ? [] : list[index],
      index: playtype == 1 ? this.globalData.index_am : this.globalData.index_dj
    });
    this.seekmusic(playtype);
  },

  //下一首fm
  nextfm(cb) {
    this.preplay()
    // var that = this;
    const { globalData } = this
    var list = globalData.list_fm;
    var index = globalData.index_fm;
    index++;
    globalData.playtype = 2;
    if (index > list.length - 1) {
      this.getfm();
    } else {
      console.log("获取下一首fm")
      globalData.index_fm = index;
      globalData.curplay = list[index];
      if (globalData.staredlist.indexOf(globalData.curplay.id) !== -1) {
        globalData.curplay.starred = true;
        globalData.curplay.st = true;
      }
      this.seekmusic(2);
      event.trigger("music_next", {
        music: globalData.curplay,
        playtype: 2,
        index: index
      });
      cb && cb();
    }
  },

  preplay() {
    //歌曲切换 停止当前音乐
    this.globalData.playing = false;
    this.globalData.globalStop = true;
    bgAudioManager.pause();
  },

  getfm() {
    getFmApi().then( res => {
      this.globalData.list_fm = res.data;
      this.globalData.index_fm = 0;
      this.globalData.curplay = res.data[0];
      if (this.globalData.staredlist.indexOf(this.globalData.curplay.id) != -1) {
        this.globalData.curplay.starred = true;
        this.globalData.curplay.st = true;
      }
      this.seekmusic(2);
      event.trigger("music_next", {
        music: this.globalData.curplay,
        playtype: 2,
        index: 0
      });
    })
  },

  // 暂停播放
  stopmusic(type, cb) {
    bgAudioManager.pause();
  },


  seekmusic(type, seek, cb) {
    // var that = this;
    console.log('seekmusic', ...arguments)
    const { globalData } = this
    const curplay = globalData.curplay;
    if (!curplay.id) return;
    globalData.playtype = type;
    if (cb) {
      this.playing(type, cb, seek);
    } else {
      this.geturl(() => {
        this.playing(type, cb, seek)
      })
    }
  },

  // 播放歌曲  
  playing(type, cb, seek) {
    if (seek != undefined) {
      bgAudioManager.seek(seek)
      return;
    };
    const { globalData } = this
    const curplay = globalData.curplay
    console.log('bgAudioManager.src', curplay)
    bgAudioManager.src = curplay.url
    bgAudioManager.title = curplay.name;

    event.trigger("music_toggle", {
      playing: true,
      music: curplay,
      playtype: globalData.playtype
    });

    // wx.playBackgroundAudio({
    //   dataUrl: m.url,
    //   title: m.name,
    //   success: function (res) {
    //     if (seek != undefined) {
    //       wx.seekBackgroundAudio({ position: seek })
    //     };
    //     that.globalData.globalStop = false;
    //     that.globalData.playtype = type;
    //     that.globalData.playing = true;
    //     nt.postNotificationName("music_toggle", {
    //       playing: true,
    //       music: that.globalData.curplay,
    //       playtype: that.globalData.playtype
    //     });
    //     cb && cb();
    //   },
    //   fail: function () {
    //     if (type != 2) {
    //       that.nextplay(1)
    //     } else {
    //       that.nextfm();
    //     }
    //   }
    // })
  },

  geturl(fn) {
    const { globalData } = this
    const { curplay } = globalData
    console.log('this', this)
    console.log('this.globalData', globalData)
    const param = { id: curplay.id, br: 128000 }
    getUrlApi(param)
      .then((res) => {
        res = res.data[0];
        curplay.url = res.url;
        curplay.getutime = (new Date()).getTime()
        if (globalData.staredlist.indexOf(curplay.id) != -1) {
          curplay.starred = true;
          curplay.st = true;
        }
        fn && fn()
      })
  },

  shuffleplay(shuffle) {
    //播放模式shuffle，1顺序，2单曲，3随机
    var that = this;
    this.globalData.shuffle = shuffle;
    if (shuffle == 1) {
      this.globalData.list_am = this.globalData.list_sf;
    } else if (shuffle == 2) {
      this.globalData.list_am = [this.globalData.curplay]
    } else {
      this.globalData.list_am = [].concat(this.globalData.list_sf);
      var sort = this.globalData.list_am;
      sort.sort(function () {
        return Math.random() - (0.5) ? 1 : -1;
      })

    }
    for (let s in this.globalData.list_am) {
      if (this.globalData.list_am[s].id == this.globalData.curplay.id) {
        this.globalData.index_am = s;
      }
    }
  },

  // app生命周期方法
  onShow() {
    this.globalData.hide = false
  },


  onHide() {
    this.globalData.hide = true;
    console.log("home hide")
    wx.setStorageSync('globalData', this.globalData);
  },
  globalData: {
    hasLogin: true,
    hide: false,
    list_am: [],
    list_dj: [],
    list_fm: [],  // 个人推荐
    list_sf: [],
    index_dj: 0,
    index_fm: 0,
    index_am: 0,
    playing: false,  // 播放状态
    playtype: 1,
    curplay: {},
    shuffle: 1,  // 播放模式： 顺序、单曲循环、随机
    globalStop: true,
    currentPosition: 0, // 当前播放位置
    staredlist: [],
    cookie: "",
    user: {}
  }
})