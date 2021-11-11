<template>
	<el-button
		style="float: right"
		type="danger"
		@click="reload"
		:icon="Refresh"
		circle
	></el-button>
	<div>Poelili</div>
	<el-switch v-model="notice" active-text="开启通知" inactive-text="关闭通知">
	</el-switch>
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
			v-for="item in newList.filter((obj) => {
				if (activeName === 'all') {
					return obj.fetchItem.code != null
				} else {
					return obj.fetchItem.code === activeName
				}
			})"
			:key="item.id"
			@click="copy(item.listing.whisper)"
			class="infinite-list-item"
		>
			<img style="height: 100%" :src="item.item.icon" />
			<div style="margin-left: 12px">
				{{ item.fetchItem.name }}
			</div>
			<div style="margin-left: 12px; color: black">
				{{ item.item.name + ' ' + item.item.baseType }}
			</div>
			<div style="margin-left: 12px">
				报价：{{
					item.listing.price.amount + '' + item.listing.price.currency
				}}
			</div>
			<div style="margin-left: 12px">
				数量：{{
					item.item.stackSize ? item.item.stackSize : 1
				}}
				均价：{{ item.avgPrice + 'c' }}
			</div>
			<div style="margin-left: 20px">
				{{
					new Date(item.listing.indexed).getHours() +
					':' +
					new Date(item.listing.indexed).getMinutes()
				}}
			</div>

			<el-button
				@click="showItem(item.id)"
				style="margin-left: 15px"
				type="danger"
				:icon="List"
				circle
			></el-button>
			<el-button
				@click="deleteLine(item.id)"
				style="margin-left: 15px"
				type="danger"
				:icon="Delete"
				circle
			></el-button>
		</li>
	</ul>
	<audio :src="audio" id="eventAudio"></audio>
	<ItemShow
		:data="itemShowData"
		:show="itemShow"
		v-model="itemShow"
	></ItemShow>
</template>

<script>
import store from './store'
const listenAction = require('./utils/listenAction')
import { Delete, List, Refresh } from '@element-plus/icons'
import ItemShow from './components/itemShow.vue'
import { ElMessage } from 'element-plus'
import audio from './assets/getitem.mp3'

export default {
	name: 'App',
	components: { ItemShow },
	data() {
		return {
			itemList: [],
			newList: [],
			activeName: 'all',
			notice: false,
			itemShowData: {},
			itemShow: false,
			date: new Date(),
			play: true,
			Delete,
			List,
			Refresh,
			audio,
		}
	},
	mounted() {},
	computed: {},
	watch: {},
	methods: {
		copy(text) {
			this.$copyText(text).then(
				(e) => {
					ElMessage('复制成功')
					console.log('复制成功')
				},
				(e) => {
					console.log('复制成功')
				}
			)
		},
		handleClick() {},
		showItem(id) {
			let index = this.newList.findIndex((item) => item.id === id)
			this.itemShowData = this.newList[index]
			this.itemShow = true
			console.log(this.itemShowData)
		},
		deleteLine(id) {
			let index = this.newList.findIndex((item) => item.id === id)
			this.newList.splice(index, 1)
		},
		reload() {
			location.reload()
		},
	},
	created() {
		ElMessage('POELili Ready')
		let that = this
		if (this.timer) {
			clearInterval(this.timer) // 在Vue实例销毁前，清除我们的定时器
		}
		this.itemList = store.get('itemList')
		this.timer = setInterval(function () {
			if (store.has('itemList')) {
				that.itemList = store.get('itemList')
				try {
					that.itemList.forEach((item, index) => {
						let workingList = store.get('workingList')
						if (item.active && !workingList[item.code]) {
							store.set('workingList.' + item.code, true)
							listenAction.getFetch(item).then(
								(res) => {
									if (res && res.length) {
										let newlist = res.concat(that.newList)
										// newlist.sort(function (a, b) {
										// 	return a.avgPrice - b.avgPrice
										// })
										that.newList = newlist
										if (
											window.Notification &&
											Notification.permission !==
												'denied' &&
											that.notice
										) {
											document
												.getElementById('eventAudio')
												.play()

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
		}, 15000)
	},
	beforeUnmount() {
		if (this.timer) {
			clearInterval(this.timer) // 在Vue实例销毁前，清除我们的定时器
		}
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
	margin-top: 10px;
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
