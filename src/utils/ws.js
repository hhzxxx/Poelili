const poeServe = require('../utils/poeServe')
import io from 'socket.io-client'
import store from '../store'

function getWsItem(item) {
	document.cookie = 'POESESSID=' + store.get('poeSession')[item.domain]
	var socket = new WebSocket(
		poeServe.wsdomains[item.domain] +
			'/api/trade/live/' +
			encodeURI(item.league) +
			'/' +
			item.code,
		'binary.k8s.io'
	)

	// Web Socket 已连接上，使用 send() 方法发送数据
	socket.onopen = function () {
		// 这里用一个延时器模拟事件
	}
	// 这里接受服务器端发过来的消息
	socket.onmessage = function (e) {
		console.log(e.data)
	}
}

export { getWsItem }
