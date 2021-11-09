const electron = window.require('electron')



export const note = function (title, body) {
    const n = new electron.remote.Notification({
        title: title,
        body: body
    })
    n.show()//展示
}