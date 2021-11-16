const electronStore = require("electron-store");
import dateUtil from "../utils/DateUtil";

const store = new electronStore();

if (!store.has("poeSession")) {
  store.set("poeSession", {
    1: "",
    2: "",
  });
}
store.set("workingList", {});

if (!store.has("proxyList")) {
  store.set("proxyList", [
    {
      address: "",
      username: "",
      password: "",
    },
  ]);
}

if (!store.has("fetchResult")) {
  store.set("fetchResult", {});
}

if (!store.has("EcRate")) {
  store.set("EcRate", {
    date: dateUtil.formatDate(new Date()),
    txValue: 0,
    gjValue: 0,
  });
}

if (store.has("itemList")) {
  let itemList = store.get("itemList");
  let queryList = store.get("queryList");
  let fetchResult = store.get("fetchResult");
  let nowCodes = [];
  itemList.forEach((item) => {
    item.active = false;
    item.dialogFormVisible = false;
    nowCodes.push(item.code);
  });
  if (queryList) {
    for (let code in queryList) {
      if (nowCodes.indexOf(code) < 0) {
        store.delete("queryList." + code);
      }
    }
  }
  if (fetchResult) {
    for (let code in fetchResult) {
      if (nowCodes.indexOf(code) < 0) {
        store.delete("fetchResult." + code);
      }
    }
  }
  store.set("itemList", itemList);
}

export default store; // 暴露出去
