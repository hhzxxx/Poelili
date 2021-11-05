let request = require("request");
let axios = require("axios");
const poeServe = require('../utils/poeServe');
import store from "../store";
import nodeTimer from "../utils/schedule";

// module.exports = {
//   handleRequestByPromise,
//   getQueryByCode,
//   query,
//   fetchItems
// };
export { axiosAll, getQueryByCode, query };


let proxyList = []

/**
 * 检查proxy15,30,45,59
 */ 
nodeTimer.scheduleTimer('20 * * * * *', function (err) {
  if(store.has("proxyList")){
    proxyList = store.get("proxyList")
    let posts = []
    proxyList.forEach(proxy => {
      if(proxy.username && proxy.password){
        posts.push(checkProxy('http://'+proxy.username+':'+proxy.password+"@"+proxy.address.replace('http://','')))
      }else{
        posts.push(checkProxy(proxy.address))
      }
    });
    axios.all(posts).then((resArr) => {
      console.log('检查', resArr)
    })
  }
})

function checkProxy(address){
  return axios
    .post(`http://localhost:9091/poelili/checkProxy`, {
      proxy: address
    })
}

function axiosAll(data) {
  let posts = []
  data.forEach(element => {
    posts.push(fetchItems(element))
  });
  const promise = new Promise(function (resolve, reject) {
    axios.all(posts).then((resArr) => {
      let resList = []
      resArr.forEach(element => {
        element.data.result.forEach(element1 => {
          resList.push(element1)
        });
      });
      console.log('请求结果', resList)
      resolve(resList)
    })
  });
  return promise;
}

function getQueryByCode(data) {
  const promise = new Promise(function (resolve, reject) {
    axios
      .post(`http://localhost:9091/poelili/spider`, {
        url: poeServe.domains[data.domain] + "/trade/search/" + encodeURI(data.league) + "/" + data.code,
        cookie: store.get("poeSession")[data.domain]
      })
      .then((response) => {
        let pattern = /t\({.*?\);/;
        let jsonStr = response.data.match(pattern)[0].replaceAll("t(", "").replaceAll(");", "");
        let query = {
          query: JSON.parse(jsonStr).state,
          sort: {
            indexed: "desc"
            // price: "asc"
          }
        }
        console.log(query)
        resolve(query);
      })
      .catch(function (error) {
        reject(`请求✿✿✿✿✿✿失败`);
      });
  });
  return promise;
}


function query(data) {
  const promise = new Promise(function (resolve, reject) {
    axios
      .post(`http://localhost:9091/poelili/trade`, {
        baseUrl: poeServe.domains[data.data.domain],
        league: data.data.league,
        url: "/api/trade/search/" + encodeURI(data.data.league),
        cookie: store.get("poeSession")[data.data.domain],
        searchJson: data.query,
        // proxy: "http://127.0.0.1:10809"
      })
      .then((response) => {
        console.log(response)

        resolve(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  });
  return promise;
}

function fetchItems(data) {
  let ids = "";
  data.searchList.forEach(element => {
    ids += element + ","
  });
  ids = ids.substr(0, ids.length - 1);
  console.log(ids);
  return axios
    .post(`http://localhost:9091/poelili/spider`, {
      url: poeServe.domains[data.domain] + "/api/trade/fetch/" + ids + "?query=" + data.code,
      cookie: store.get("poeSession")[data.domain]
    })
}
