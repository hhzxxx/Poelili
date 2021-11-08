const schedule = require('node-schedule') //定时器
const nodeTimer = {}
let cancelTimer = ''
/**
 *Cron风格定时器/对象文本语法定时器
 * @param executionTime ：定时器字符串'30 * * * * *'/定时器对象{hour: 16, minute: 11, dayOfWeek: 1}
 * @param callback ：回调函数
 */
nodeTimer.scheduleTimer = (executionTime = '30 * * * * *', callback) => {
	// 每分钟的第30秒触发： '30 * * * * *'
	// 每小时的1分30秒触发 ：'30 1 * * * *'
	// 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
	// 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
	// 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
	// 每周1的1点1分30秒触发 ：'30 1 1 * * 1'

	cancelTimer = schedule.scheduleJob(executionTime, () => {
		if (typeof callback === 'function') {
			callback()
		}
	})
}

// 取消定时器
// 调用 定时器对象的cancl()方法即可
nodeTimer.scheduleCancel = () => {
	// 定时器取消
	cancelTimer.cancel()
	console.log('定时器成功取消')
}

export default nodeTimer
