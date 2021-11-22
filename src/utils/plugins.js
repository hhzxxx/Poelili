import { ipcRenderer } from 'electron'

/**
 * 创建窗口
 */
export function windowCreate(args) {
	console.log(args)
	ipcRenderer.send('window-new', args)
}

/**
 * 关闭窗口
 */
export function windowClose(id) {
	console.log('窗口id：' + id)
	ipcRenderer.send('window-closed', id)
}

/**
 * 创建view
 */
export function viewCreate(args) {
	console.log(args)
	ipcRenderer.send('view-new', args)
	ipcRenderer.on('view-reply', (event, arg) => {
		console.log(arg, 'reply') // prints "pong"
	})
}
// ...
