const spider = require("./spider");
const poeServe = require("../utils/poeServe");
const cheerio = require("cheerio")

export{getMyList}

function updateAll(){
    spider.caimoguApi({
        url:"",
        method:"get"
    })
}

function getMyList(){
    return new Promise( resolve =>{
        spider.caimoguApi({
            url:poeServe.caomoguUrls.myList,
            method:"get"
        }).then((res)=>{
            let data = res.data
            var $ = cheerio.load(data)
            if($("#tGarden")){
                resolve($("#tGarden").find("tr"))
            }else{
                resolve(data)
            }
        })
    })
}