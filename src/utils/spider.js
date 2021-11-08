let request = require('request')
let axios = require('axios')
const poeServe = require('../utils/poeServe')
import store from '../store'
import nodeTimer from '../utils/schedule'

// module.exports = {
//   handleRequestByPromise,
//   getQueryByCode,
//   query,
//   fetchItems
// };
export { axiosAll, getQueryByCode, query, initTxLeagues, initGJLeagues }

let proxyList = []
let proxyCount = 0

if (store.has('proxyList')) {
	proxyList = store.get('proxyList')
}

axios.defaults.timeout = 10000

function setProxy(options) {
	proxyList = store.get('proxyList')
	let proxy = null
	let index = proxyCount % (proxyList.length + 1)
	if (index >= proxyList.length || proxyList.length == 0) {
		proxy = null
	} else {
		if (proxyList[index].active) {
			proxy = proxyList[index]
		}
	}
	if (proxy != null) {
		if (proxy.username && proxy.password) {
			options.proxy =
				'http://' +
				proxy.username +
				':' +
				proxy.password +
				'@' +
				proxy.address.replace('http://', '')
		} else {
			options.proxy = proxy.address
		}
	}
	proxyCount++
	console.log('proxyCount :' + proxyCount)
	console.log('proxy :' + options.proxy)
	return options
}

/**
 * 检查proxy15,30,45,59
 */
nodeTimer.scheduleTimer('* 1 * * * *', function () {
	if (store.has('proxyList')) {
		proxyList = store.get('proxyList')
		let posts = []
		proxyList.forEach((proxy) => {
			if (proxy.username && proxy.password) {
				posts.push(
					checkProxy(
						'http://' +
							proxy.username +
							':' +
							proxy.password +
							'@' +
							proxy.address.replace('http://', '')
					)
				)
			} else {
				posts.push(checkProxy(proxy.address))
			}
		})
		axios.all(posts).then((resArr) => {
			console.log(resArr)
			var pattern =
				/((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/
			for (let i = 0; i < resArr.length; i++) {
				if (!pattern.test(resArr[i].data)) {
					proxyList[i].active = false
				} else {
					proxyList[i].active = true
				}
			}
			store.set('proxyList', proxyList)
		})
	}
})

function checkProxy(address) {
	return axios.post(`http://localhost:9091/poelili/checkProxy`, {
		proxy: address,
	})
}

function axiosAll(data) {
	let posts = []
	data.forEach((element) => {
		posts.push(fetchItems(element))
	})
	const promise = new Promise(function (resolve, reject) {
		axios.all(posts).then((resArr) => {
			let resList = []
			resArr.forEach((element) => {
				element.data.result.forEach((element1) => {
					resList.push(element1)
				})
			})
			console.log('请求结果', resList)
			resolve(resList)
		})
	})
	return promise
}

function getQueryByCode(data) {
	const promise = new Promise(function (resolve, reject) {
		axios
			.post(`http://localhost:9091/poelili/spider`, {
				url:
					poeServe.domains[data.domain] +
					'/trade/search/' +
					encodeURI(data.league) +
					'/' +
					data.code,
				cookie: store.get('poeSession')[data.domain],
			})
			.then((response) => {
				let pattern = /t\({.*?\);/
				let jsonStr = response.data
					.match(pattern)[0]
					.replaceAll('t(', '')
					.replaceAll(');', '')
				let query = {
					query: JSON.parse(jsonStr).state,
					sort: {
						indexed: 'desc',
						// price: "asc"
					},
				}
				console.log(query)
				resolve(query)
			})
			.catch(function (error) {
				reject(`请求✿✿✿✿✿✿失败`)
			})
	})
	return promise
}

function query(data) {
	const promise = new Promise(function (resolve, reject) {
		let options = {
			baseUrl: poeServe.domains[data.data.domain],
			league: data.data.league,
			url: '/api/trade/search/' + encodeURI(data.data.league),
			cookie: store.get('poeSession')[data.data.domain],
			searchJson: data.query,
			// proxy: "http://127.0.0.1:10809"
		}
		axios
			.post(`http://localhost:9091/poelili/trade`, setProxy(options))
			.then((response) => {
				console.log(response)

				resolve(response)
			})
			.catch(function (error) {
				console.log(error)
			})
	})
	return promise
}

function fetchItems(data) {
	let ids = ''
	data.searchList.forEach((element) => {
		ids += element + ','
	})
	ids = ids.substr(0, ids.length - 1)
	let options = {
		url:
			poeServe.domains[data.domain] +
			'/api/trade/fetch/' +
			ids +
			'?query=' +
			data.code,
		cookie: store.get('poeSession')[data.domain],
	}
	return axios.post(`http://localhost:9091/poelili/spider`, setProxy(options))
}

function initTxLeagues() {
	const promise = new Promise(function (resolve, reject) {
		if (store.has('poeSession') && store.get('poeSession')[1]) {
			axios
				.post(`http://localhost:9091/poelili/spider`, {
					url: poeServe.domains[1] + '/trade/search',
					cookie: store.get('poeSession')[1],
				})
				.then((response) => {
					let pattern = /t\({.*?\);/
					let jsonStr = response.data
						.match(pattern)[0]
						.replaceAll('t(', '')
						.replaceAll(');', '')
					store.set('leagues.1', JSON.parse(jsonStr).leagues)
					resolve(JSON.parse(jsonStr).leagues)
				})
		} else {
			reject('no sessionid')
		}
	})
	return promise
}

function initGJLeagues() {
	const promise = new Promise(function (resolve, reject) {
		if (store.has('poeSession') && store.get('poeSession')[2]) {
			axios
				.post(`http://localhost:9091/poelili/spider`, {
					url: poeServe.domains[2] + '/trade/search',
					cookie: store.get('poeSession')[2],
				})
				.then((response) => {
					let pattern = /t\({.*?\);/
					let jsonStr = response.data
						.match(pattern)[0]
						.replaceAll('t(', '')
						.replaceAll(');', '')
					store.set('leagues.2', JSON.parse(jsonStr).leagues)
					resolve(JSON.parse(jsonStr).leagues)
				})
		} else {
			reject('no sessionid')
		}
	})
	return promise
}

if (!store.has('leagues')) {
	initTxLeagues()
	initGJLeagues()
}
