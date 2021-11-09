const electronStore = require('electron-store');
import dateUtil from "../utils/DateUtil";

const store = new electronStore();

if (!store.has("poeSession")) {
    store.set("poeSession", {
        1: "",
        2: "",
    })
}
store.set("workingList", {
})

if (!store.has("proxyList")) {
    store.set("proxyList", [
        {
            address: "",
            username: "",
            password: "",
        },
    ])
}

if (!store.has("fetchResult")) {
    store.set("fetchResult", {

    })
}

if (!store.has("EcRate")) {
    store.set("EcRate", {
        date:dateUtil.formatDate(new Date()),
        txValue:0,
        gjValue:0
    })
}

if (store.has("itemList")) {
    let itemList = store.get("itemList")
    itemList.forEach(item => {
        item.active = false
        item.dialogFormVisible = false
    });
    store.set("itemList", itemList)
}


export default store // 暴露出去