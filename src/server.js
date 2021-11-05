(
  function () {
    "use strict";
    let express = require('express');
    let app = express();
    const request = require('request');
    const moment = require('moment');
    const bodyParser = require("body-parser");

    //设置跨域访问
    app.all("*", function (req, res, next) {
      //设置允许跨域的域名，*代表允许任意域名跨域
      res.header("Access-Control-Allow-Origin", "*");
      //允许的header类型
      res.header("Access-Control-Allow-Headers", "content-type");
      //跨域允许的请求方式 
      res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
      if (req.method.toLowerCase() == 'options')
        res.send(200);  //让options尝试请求快速结束
      else
        next();
    })

    // 使用 bodyparser.json() 將 HTTP 請求方法 POST、DELETE、PUT 和 PATCH，放在 HTTP 主體 (body) 發送的參數存放在 req.body
    app.use(bodyParser.urlencoded({
      extended: false
    }));
    app.use(bodyParser.json({
      "limit": "102400kb"
    }));

    // API router
    app.get('/', function (req, res) {
      res.send("ready!");
    });

    
    app.post('/poelili/checkProxy', function (req, res) {
      let options = {
        url: 'http://icanhazip.com/',
        tiemout: 5000,
        method: 'get',
        headers: {
          'accept': '*/*',
          'User-Agent': 'lolixxx',
        },
        rejectUnauthorized: false,
        requestCert: false,
        agent: false,
      }
      if (req.body.proxy) {
        options.proxy = `${req.body.proxy}`
      }
      request(options, function (error, response, body) {
        res.send(body);
      });
    });

    app.post('/poelili/spider', function (req, res) {
      let options = {
        url: req.body.url,
        method: 'get',
        headers: {
          'accept': '*/*',
          'Cookie': `POESESSID=${req.body.cookie}`,
          'User-Agent': 'lolixxx',
        },
        rejectUnauthorized: false,
        requestCert: false,
        agent: false,
      }
      if (req.body.proxy) {
        options.proxy = `${req.body.proxy}`
      }
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          res.status(response.statusCode).send(body);
          console.log(response.statusCode, body)
        }

      });
    });

    // post searchJson to garena POE trade API
    app.post('/poelili/trade', function (req, res) {
      console.log(moment().format('HH:mm:ss'), "Call trade(post) API", req.body.league)
      console.log(req.body.searchJson.query)
      let league = encodeURI(req.body.league)
      let baseUrl = req.body.baseUrl
      let fetchID = [] // 儲存得到的 result ID, 10 個 ID 為一組陣列
      let options = {
        url: `${baseUrl}/api/trade/search/${league}`,
        // could replace searchJson by `${league}?q={"query": ... }`
        method: 'post',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'User-Agent': 'lolixxx',
        },
        rejectUnauthorized: false,
        requestCert: false,
        agent: false,
        json: req.body.searchJson
      }
      if (req.body.cookie) {
        options.headers.Cookie = `POESESSID=${req.body.cookie};`
      }
      if (req.body.proxy) {
        options.proxy = `${req.body.proxy}`
      }
      // console.log(req.body.cookie)
      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(`searchID: ${body.id}, searchTotal: ${body.total}`)
          body.result.forEach((element, index) => {
            let idx = index <= 9 ? 0 : parseInt((index % 100) / 10)
            if (!Array.isArray(fetchID[idx])) {
              fetchID[idx] = []
            }
            fetchID[idx].push(element)
          });
          let limitString = (response.headers["x-rate-limit-ip-state"]).split(",")
          let limitState = {
            "first": parseInt(limitString[0].substring(0, limitString[0].indexOf(':')), 10),
            "second": parseInt(limitString[1].substring(0, limitString[1].indexOf(':')), 10),
            "third": parseInt(limitString[2].substring(0, limitString[2].indexOf(':')), 10),
          }

          res.send({
            id: body.id,
            total: body.total,
            resultLength: body.result.length,
            fetchID: fetchID,
            limitState: limitState
          });
        } else {
          res.status(response.statusCode).send(body);
          console.log(response.statusCode, body)
        }
      });
    });

    let server = app.listen(9091, function () {
      console.log(moment().format('HH:mm:ss'), 'Express server listening on port ' + server.address().port);
    });
    module.exports = app;
  }()
);