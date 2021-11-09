<template>
	<div>Poelili</div>

	<div id="nav">
		<router-link to="/PoeSession"> PoeSession</router-link> |
		<router-link to="/Main"> Main</router-link> |
		<router-link to="/Proxy"> proxy</router-link>
	</div>
	<router-view></router-view>
	<el-tabs v-model="activeName" @tab-click="handleClick">
		<el-tab-pane label="全部" name="all"></el-tab-pane>
		<el-tab-pane
			v-for="fetchItem in itemList"
			:key="fetchItem.code"
			:label="fetchItem.name"
			:name="fetchItem.code"
		>
		</el-tab-pane>
	</el-tabs>
	<ul class="infinite-list" style="overflow: auto">
		<li
			v-for="(item, index) in newList.filter((obj) => {
				if (activeName === 'all') {
					return obj.fetchItem.code != null
				} else {
					return obj.fetchItem.code === activeName
				}
			})"
			:key="index"
			@click="copy(item.listing.whisper)"
			class="infinite-list-item"
		>
			<img :src="item.item.icon" />
			<div style="margin-left: 12px">
				{{ item.fetchItem.name }}
			</div>
			<div style="margin-left: 12px">
				{{ item.fetchItem.domain == 1 ? '腾讯 ' : '国际 ' }}
			</div>
			<div style="margin-left: 12px">{{ item.item.league }}</div>
			<div style="margin-left: 12px">
				报价：{{
					item.listing.price.amount + '' + item.listing.price.currency
				}}
			</div>
			<div style="margin-left: 12px">
				数量：{{ item.item.stackSize }} 均价：{{ item.avgPrice + 'c' }}
			</div>
			<div style="margin-left: 80px">
				{{
					new Date(item.listing.indexed).getHours() +
					':' +
					new Date(item.listing.indexed).getMinutes()
				}}
			</div>
			<el-icon><close /></el-icon>
		</li>
	</ul>
</template>

<script>
import store from './store'
const listenAction = require('./utils/listenAction')

export default {
	name: 'App',
	components: {},
	data() {
		return {
			itemList: [],
			newList: [],
			activeName: 'all',
		}
	},
	methods: {
		copy(text) {
			this.$copyText(text).then(
				(e) => {
					console.log('复制成功')
				},
				(e) => {
					console.log('复制成功')
				}
			)
		},
		handleClick() {},
	},
	created() {
		let that = this
		this.itemList = store.get('itemList')
		let int = setInterval(function () {
			if (store.has('itemList')) {
				that.itemList = store.get('itemList')
				try {
					that.itemList.forEach((item, index) => {
						let workingList = store.get('workingList')
						if (item.active && !workingList[item.code]) {
							store.set('workingList.' + item.code, true)
							listenAction.getFetch(item).then(
								(res) => {
									let newlist = res.concat(that.newList)
									// newlist.sort(function (a, b) {
									// 	return a.avgPrice - b.avgPrice
									// })
									that.newList = newlist
									if (res) {
										if (
											window.Notification &&
											Notification.permission !== 'denied'
										) {
											Notification.requestPermission(
												function (status) {
													if (status === 'granted') {
														var n =
															new Notification(
																newlist[0].fetchItem.name,
																{
																	body:
																		'新的' +
																		res.length +
																		'份',
																}
															)
													}
												}
											)
										}
									}
								},
								(rej) => {}
							)
							throw new Error('ending')
						}
					})
					store.set('workingList', {})
				} catch (e) {
					console.log(e)
				}
			}
		}, 20000)
	},
}
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
.infinite-list {
	height: 300px;
	padding: 0;
	margin: 0;
	list-style: none;
}
.infinite-list .infinite-list-item {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 50px;
	background: var(--el-color-primary-light-9);
	margin: 10px;
	color: var(--el-color-primary);
}

.list-item {
	margin-top: 10px;
}
</style>
