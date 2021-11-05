const electronStore = require('electron-store');
import dateUtil from "../utils/DateUtil";

const store = new electronStore();

if (!store.has("poeSession")) {
    store.set("poeSession", {
        1: "",
        2: "",
    })
}

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

export default store // 暴露出去