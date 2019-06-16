import http from '../lib/Http/index'

export function getUrlApi(data) {
    return http.get({
        url: 'song/url',
        data:data
    })
}

export function getCatlist() {
  return http.get({
    url: 'playlist/catlist'
  })
}


export function loginApi() {
  return http.get({
    url: 'login?email=gongwlin@163.com&password=gwl123'
  })
}


export function refreshApi() {
  return http.get({
    url: 'login/refresh'
  })
}

export function getFmApi() {
  return http.get({
    url: 'fm'
  })
}

export function getLikeApi() {
  return http.get({
    url: 'likelist'
  })
}