const poeServe = require("../utils/poeServe");
import { ElMessage } from "element-plus";
import store from "../store";

function getWsItem(item) {
  const fetchItem = item;
  var socket = new WebSocket(
    "ws://" +
      poeServe.wsnginx[2] +
      "/poetxsocket/api/trade/live/" +
      encodeURI(item.league) +
      "/" +
      item.code +
      "?poesessid=" +
      store.get("poeSession")[item.domain]
  );

  // Web Socket 已连接上，使用 send() 方法发送数据
  socket.onopen = function () {
    // 这里用一个延时器模拟事件
  };
  // 这里接受服务器端发过来的消息
  socket.onmessage = function (n) {
    var i = JSON.parse(n.data);
    if (i.auth) {
      ElMessage(fetchItem.name + ",连接成功");
    } else if (i.new) {
      console.log(i);
    }
  };
}

export { getWsItem };
