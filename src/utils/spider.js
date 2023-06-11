let axios = require("axios");
const poeServe = require("../utils/poeServe");
import store from "../store";
export {
  axiosAll,
  getQueryByCode,
  query,
  initTxLeagues,
  initGJLeagues,
  checkProxyOut,
  getProxy,
  getItemsByList,
  takeProxy,
  caimoguApi,
  uploadItem,
  onlineList,
  deleteOnlineItem
};

let proxyList = [];
let proxyCount = 0;

if (store.has("proxyList")) {
  proxyList = store.get("proxyList");
}

axios.defaults.timeout = 10000;
axios.defaults.retry = 2;
axios.defaults.retryDelay = 1000;

axios.interceptors.response.use(undefined, function axiosRetryInterceptor(err) {
  var config = err.config;
  // If config does not exist or the retry option is not set, reject
  if (!config || !config.retry) return Promise.reject(err);

  // Set the variable for keeping track of the retry count
  config.__retryCount = config.__retryCount || 0;

  // Check if we've maxed out the total number of retries
  if (config.__retryCount >= config.retry) {
    // Reject with the error
    return Promise.reject(err);
  }

  // Increase the retry count
  config.__retryCount += 1;

  // Create new promise to handle exponential backoff
  var backoff = new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, config.retryDelay || 1);
  });

  // Return the promise in which recalls axios to retry the request
  return backoff.then(function () {
    return axios(config);
  });
});

function takeProxy(){
  proxyList = store.get("proxyList");
  let proxy = null;
  let index = proxyCount % (proxyList.length + 1);
  if (index >= proxyList.length || proxyList.length == 0) {
    proxy = null;
  } else {
    if (proxyList[index].active) {
      proxy = proxyList[index];
    }
  }
  proxyCount++;
  return proxy;
}

function setProxy(options) {
  let proxy = takeProxy();
  if (proxy != null) {
    if (proxy.username && proxy.password) {
      options.proxy =
        "http://" +
        proxy.username +
        ":" +
        proxy.password +
        "@" +
        proxy.address.replace("http://", "");
    } else {
      options.proxy = proxy.address;
    }
  }
  return options;
}

const ipReg =
  /((^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$))/;

setTimeout(() => {
  if (store.has("proxyList")) {
    proxyList = store.get("proxyList");
    proxyList.forEach((proxy) => {
      let address = proxy.address;
      if (proxy.username && proxy.password) {
        address =
          "http://" +
          proxy.username +
          ":" +
          proxy.password +
          "@" +
          proxy.address.replace("http://", "");
      }
      checkProxy(address).then(
        (res) => {
          proxy.active = true;
          store.set("proxyList", proxyList);
        },
        (rej) => {
          proxy.active = false;
          store.set("proxyList", proxyList);
        }
      );
    });
  }
}, 2000);

function getProxy() {
  const promise = new Promise(function (resolve, reject) {
    axios.post(`http://localhost:9091/poelili/getProxy`).then(
      (res) => {
        resolve(res);
      },
      (rej) => reject(rej)
    );
  });
  return promise;
}

function checkProxy(address) {
  return axios.post(`http://localhost:9091/poelili/checkProxy`, {
    proxy: address,
  });
}

function checkProxyOut(address) {
  const promise = new Promise(function (resolve, reject) {
    axios
      .post(`http://localhost:9091/poelili/checkProxy`, {
        proxy: address,
      })
      .then(
        (res) => {
          if (ipReg.test(res.data)) {
            resolve(res);
          } else {
            reject(res);
          }
        },
        (rej) => reject(rej)
      );
  });
  return promise;
}

function axiosAll(data) {
  let posts = [];
  data.forEach((element) => {
    posts.push(fetchItems(element));
  });
  const promise = new Promise(function (resolve, reject) {
    axios.all(posts).then(
      (resArr) => {
        let resList = [];
        resArr.forEach((element) => {
          element.data.result.forEach((element1) => {
            resList.push(element1);
          });
        });
        console.log("请求结果", resList);
        resolve(resList);
      },
      (rej) => {
        reject(rej);
      }
    );
  });
  return promise;
}

function getQueryByCode(data) {
  const promise = new Promise(function (resolve, reject) {
    let flag = false;
    if (store.has("queryList." + data.code)) {
      try {
        let query = store.get("queryList." + data.code);
        resolve(query);
      } catch (e) {
        flag = true;
      }
    } else {
      flag = true;
    }
    if (flag) {
      axios
        .post(`http://localhost:9091/poelili/spider`, {
          url:
            poeServe.domains[data.domain] +
            "/trade/search/" +
            encodeURI(data.league) +
            "/" +
            data.code,
          cookie: store.get("poeSession")[data.domain],
        })
        .then(
          (response) => {
            let pattern = /t\({.*?\);/gs;
            let jsonStr = response.data
              .match(pattern)[0]
              .replaceAll("t(", "")
              .replaceAll(");", "");
            let query = {
              query: JSON.parse(jsonStr).state,
              sort: {
                indexed: "desc",
                // price: "asc"
              },
            };
            store.set("queryList." + data.code, query);
            console.log(query);
            resolve(query);
          },
          (rej) => {
            reject(rej);
          }
        )
        .catch(function (error) {
          reject(`请求✿✿✿✿✿✿失败`);
        });
    }
  });
  return promise;
}

function query(data) {
  const promise = new Promise(function (resolve, reject) {
    let options = {
      baseUrl: poeServe.domains[data.data.domain],
      league: data.data.league,
      url: "/api/trade/search/" + encodeURI(data.data.league),
      cookie: store.get("poeSession")[data.data.domain],
      searchJson: data.query,
      // proxy: "http://127.0.0.1:10809"
    };
    axios
      .post(`http://localhost:9091/poelili/trade`, setProxy(options))
      .then((response) => {
        console.log(response);

        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
  return promise;
}

function getItemsByList(item, ...searchList) {
  return new Promise((resolve, reject) => {
    if (searchList.length > 0) {
      let reqList = []
      searchList.forEach((fetchIds) => {
        if (fetchIds && fetchIds.length > 0) {
          reqList.push({
            code: item.code,
            searchList: fetchIds,
            domain: item.domain,
          })
        }
      })
      if (reqList.length > 0) {
        axiosAll(reqList).then(
          (res) => resolve(res),
          (rej) => reject(rej)
        )
      }
    }
  })
}

function fetchItems(data) {
  let ids = "";
  data.searchList.forEach((element) => {
    ids += element + ",";
  });
  ids = ids.substr(0, ids.length - 1);
  let options = {
    url:
      poeServe.domains[data.domain] +
      "/api/trade/fetch/" +
      ids +
      "?query=" +
      data.code,
    cookie: store.get("poeSession")[data.domain],
  };
  return axios.post(`http://localhost:9091/poelili/spider`, setProxy(options));
}

function initTxLeagues() {
  const promise = new Promise(function (resolve, reject) {
    if (store.has("poeSession") && store.get("poeSession")[1]) {
      axios
        .post(`http://localhost:9091/poelili/spider`, {
          url: poeServe.domains[1] + "/trade/search",
          cookie: store.get("poeSession")[1],
        })
        .then((response) => {
          let pattern = /t\({.*?\);/gs;
          let jsonStr = response.data
            .match(pattern)[0]
            .replaceAll("t(", "")
            .replaceAll(");", "");
          store.set("leagues.1", JSON.parse(jsonStr).leagues);
          resolve(JSON.parse(jsonStr).leagues);
        });
    } else {
      reject("no sessionid");
    }
  });
  return promise;
}

function initGJLeagues() {
  const promise = new Promise(function (resolve, reject) {
    if (store.has("poeSession") && store.get("poeSession")[2]) {
      axios
        .post(`http://localhost:9091/poelili/spider`, {
          url: poeServe.domains[2] + "/trade/search",
          cookie: store.get("poeSession")[2],
        })
        .then((response) => {
          let pattern = /t\({.*?\);/gs;
          let jsonStr = response.data
            .match(pattern)[0]
            .replaceAll("t(", "")
            .replaceAll(");", "");
          store.set("leagues.2", JSON.parse(jsonStr).leagues);
          resolve(JSON.parse(jsonStr).leagues);
        });
    } else {
      reject("no sessionid");
    }
  });
  return promise;
}

function caimoguApi(options) {
  const promise = new Promise(function (resolve, reject) {
    options['cookie'] = store.get("caimoguCookie")
    axios
      .post(`http://localhost:9091/poelili/caimogu`, options)
      .then((response) => {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
  return promise;
}

function uploadItem(item){
  const promise = new Promise(function (resolve, reject) {
    axios
      .post(`http://49.234.3.138/magicApi/poelili/item/save`, item)
      .then((response) => {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
  return promise;
}


function onlineList(){
  const promise = new Promise(function (resolve, reject) {
    axios
      .post(`http://49.234.3.138/magicApi/poelili/item/find`, {})
      .then((response) => {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
  return promise;
}

function deleteOnlineItem(code){
  const promise = new Promise(function (resolve, reject) {
    axios
      .post(`http://49.234.3.138/magicApi/poelili/item/delete`, {code:code})
      .then((response) => {
        resolve(response);
      })
      .catch(function (error) {
        reject(error);
      });
  });
  return promise;
}

if (!store.has("leagues")) {
  initTxLeagues();
  initGJLeagues();
}
