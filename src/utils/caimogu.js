const spider = require("./spider");
const poeServe = require("../utils/poeServe");
const cheerio = require("cheerio")
const objects = require("../obj/objects");
import store from "../store";

export{getMyList,fresh,login}

function fresh(){
  getMyList().then(list =>{
    if(list){
      let ids = ""
      list.filter(item => item.status == "1").forEach((item,index) => {
        ids += item.itemId + ","
      });
      ids = ids.substring(0,ids.length-1)
      if(ids.length){
        spider.caimoguApi({
          url:"https://www.caimogu.net/poe/garden/my.html",
          method:"POST",
          type:"form",
          formData:{
            act:"batch_delay",
            ids:ids
          }
        }).then(res =>{
          console.log(res)
        })
      }
    }
  })
}

function login(){
  spider.caimoguApi({
    url:"https://www.caimogu.net/login.html",
    method:"get"
  }).then((res)=>{
    dealCookie(res)
    var $ = cheerio.load(res.data.body)
    let token = $($(".login-submit input")[1]).attr("value")
    spider.caimoguApi({
      url:"https://www.caimogu.net/login.html",
      method:"POST",
      type:"form",
      formData:{
        username:"17858767717",
        password:"aGh6OTg3NDEyMzY1",
        "__token__":token
      }
    }).then(res =>{
      console.log(res)
    })
  })

}

function getMyList(){
    return new Promise( resolve =>{
        spider.caimoguApi({
            url:poeServe.caomoguUrls.myList,
            method:"get"
        }).then((res)=>{
            let data = res.data.body
            let itemList = []
            var $ = cheerio.load(data)
            if($("#tGarden")){
                Array.from($("#threadlist tbody tr")).forEach(tr => {
                  let obj = new objects.CaiMoGuItem()
                  obj.status = $(tr).find(".btn-valid").attr("data-status")
                  obj.league = $(tr).find("td:eq(1)").html()
                  obj.content = $(tr).find("td:eq(2)").html().replaceAll(/<.*?>/g,"")
                  obj.price = $(tr).find("td:eq(3)").html().replaceAll(/<.*?>/g,"").replaceAll(" ","").replaceAll("\n","")
                  obj.itemId = $(tr).find(".btn-edit").attr("data-id")
                  obj.priceType = $(tr).find("img").attr("title") == "混沌石"?1:2
                  obj.priceIcon = $(tr).find("img").attr("src")
                  itemList.push(obj)
                });
            }
            resolve(itemList)
        })
    })
}

function dealCookie(res){
  if(res.data['set-cookie']){
    let cookies = res.data['set-cookie']
    cookies.forEach(cookie => {
      if(cookie.indexOf("CAIMOGU=")>-1){
        console.log(cookie.split(";")[0].replace("CAIMOGU=",""))
        store.set("caimoguCookie", cookie.split(";")[0].replace("CAIMOGU=",""));
      }
    });
  }

}