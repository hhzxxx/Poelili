function formatDate(date) {
	var y = date.getFullYear()
	console.log(y)
	var m = date.getMonth() + 1
	m = m < 10 ? '0' + m : m
	var d = date.getDate()
	d = d < 10 ? '0' + d : d
	return y + '-' + m + '-' + d
}

var byTime = [
	365 * 24 * 60 * 60 * 1000,
	24 * 60 * 60 * 1000,
	60 * 60 * 1000,
	60 * 1000,
	1000,
]
var unit = ['年', '天', '小时', '分钟', '秒钟']
function timeAgo(date) {
	var ct = new Date().getTime - date.getTime()
	if (ct < 0) {
		return '瞎糊闹！'
	}

	var sb = []
	for (var i = 0; i < byTime.length; i++) {
		if (ct < byTime[i]) {
			continue
		}
		var temp = Math.floor(ct / byTime[i])
		ct = ct % byTime[i]
		if (temp > 0) {
			sb.push(temp + unit[i])
		}

		/*一下控制最多输出几个时间单位：
		一个时间单位如：N分钟前
		两个时间单位如：M分钟N秒前
		三个时间单位如：M年N分钟X秒前
	以此类推
	*/
		if (sb.length >= 1) {
			break
		}
	}
	document.write(sb.join('') + '前')
}

module.exports = {
	formatDate,
	timeAgo,
}
