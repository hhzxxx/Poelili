import store from "../store";
const spider = require("./spider");

let txValue = store.get("EcRate.txValue");
let gjValue = store.get("EcRate.gjValue");

export { getFetch };

function getFetch(item) {
  if (!item.code || !item.domain || !item.league) {
    return false;
  }
  let fetchItem = item;
  return new Promise((resolve, reject) => {
    spider.getQueryByCode(item).then((query) => {
      spider.query({ query: query, data: item }).then((res) => {
        item.code = res.data.id;
        let searchList = dealFetchIds(res);
        getItemsByList(item, searchList).then((res) => {
          let list = [];
          res.forEach((element) => {
            let stackSize;
            let chaos;
            if (
              element.listing.price.currency == "chaos" ||
              element.listing.price.currency == "exalted"
            ) {
              stackSize = element.item.stackSize ? element.item.stackSize : 1;

              if (element.listing.price.currency == "chaos") {
                chaos =
                  element.listing.price.amount *
                  (item.domain == 1 ? 1 : stackSize);
              }
              if (element.listing.price.currency == "exalted") {
                chaos =
                  element.listing.price.amount *
                  (item.domain == 1 ? txValue : gjValue) *
                  (item.domain == 1 ? 1 : stackSize);
              }
              if (
                chaos &&
                stackSize &&
                (item.listenPrice
                  ? Math.round(chaos / stackSize) <= item.listenPrice
                  : true)
              ) {
                let newEl = element;
                newEl.fetchItem = fetchItem;
                newEl.avgPrice = Math.round(chaos / stackSize);
                list.push(newEl);
              }
            }
          });
          resolve(list);
        });
      });
    });
  });
}

function getItemsByList(item, ...searchList) {
  return new Promise((resolve, reject) => {
    if (searchList.length > 0) {
      let reqList = [];
      searchList.forEach((fetchIds) => {
        if (fetchIds.length > 0) {
          reqList.push({
            code: item.code,
            searchList: fetchIds,
            domain: item.domain,
          });
        }
      });
      if (reqList.length > 0) {
        spider.axiosAll(reqList).then(
          (res) => resolve(res),
          (rej) => reject(rej)
        );
      }
    }
  });
}

function dealFetchIds(res) {
  if (!store.has("fetchResult." + res.data.id)) {
    store.set("fetchResult." + res.data.id, res.data.fetchID[0]);
    return res.data.fetchID[0];
  } else {
    let oldList = store.get("fetchResult." + res.data.id);
    store.set("fetchResult." + res.data.id, res.data.fetchID[0]);
    let newList = res.data.fetchID[0];
    let searchList = [];
    newList.forEach((element) => {
      if (oldList.indexOf(element) < 0) {
        searchList.push(element);
      }
    });
    return searchList;
  }
}
