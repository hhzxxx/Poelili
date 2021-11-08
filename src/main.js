import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import store from './store'
const nodeQueue = require('./utils/queue')
const spider = require('./utils/spider')

let txValue
let gjValue
let int = setInterval(function () {
	if (store.has('itemList')) {
		let itemList = store.get('itemList')
		let length = 0
		itemList.forEach((item) => {
			if (item.active) {
				length++
				nodeQueue.push({ item: item, time: 20000 }, function (obj) {
					txValue = store.get('EcRate.txValue')
					gjValue = store.get('EcRate.gjValue')
					getFetch(obj.item)
				})
			}
		})
	}
}, 1000)

function getFetch(item) {
	if (!item.code || !item.domain || !item.league) {
		return false
	}
	spider.getQueryByCode(item).then((query) => {
		spider.query({ query: query, data: item }).then((res) => {
			item.code = res.data.id
			let searchList = dealFetchIds(res)
			getItemsByList(item, searchList).then((res) => {
				let list = []
				res.forEach((element) => {
					let stackSize
					let chaos
					if (element.listing.price.currency == 'chaos') {
						stackSize = element.item.stackSize
						chaos =
							element.listing.price.amount *
							(item.domain == 1 ? 1 : stackSize)
					}

					if (element.listing.price.currency == 'exalted') {
						stackSize = element.item.stackSize
						chaos =
							element.listing.price.amount *
							(item.domain == 1 ? txValue : gjValue) *
							(item.domain == 1 ? 1 : stackSize)
					}
					if (Math.round(chaos / stackSize) <= item.listenPrice) {
						list.push(element)
					}
				})
				console.log('new list', list)
			})
		})
	})
}

function getItemsByList(item, ...searchList) {
	return new Promise((resolve, reject) => {
		if (searchList.length > 0) {
			let reqList = []
			searchList.forEach((fetchIds) => {
				if (fetchIds.length > 0) {
					reqList.push({
						code: item.code,
						searchList: fetchIds,
						domain: item.domain,
					})
				}
			})
			if (reqList.length > 0) {
				spider.axiosAll(reqList).then(
					(res) => resolve(res),
					(rej) => reject(rej)
				)
			}
		}
	})
}

function dealFetchIds(res) {
	if (!store.has('fetchResult.' + res.data.id)) {
		store.set('fetchResult.' + res.data.id, res.data.fetchID[0])
		return res.data.fetchID[0]
	} else {
		let oldList = store.get('fetchResult.' + res.data.id)
		store.set('fetchResult.' + res.data.id, res.data.fetchID[0])
		let newList = res.data.fetchID[0]
		let searchList = []
		newList.forEach((element) => {
			if (oldList.indexOf(element) < 0) {
				searchList.push(element)
			}
		})
		return searchList
	}
}

createApp(App).use(ElementPlus).use(router).mount('#app')
