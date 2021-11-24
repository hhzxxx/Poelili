<template>
  <div class="header">
    <div class="title">PoeLili</div>
    <div class="but">
      <el-button
        :icon="Minus"
        size="mini"
        circle
        @click="minimizeWin"
      ></el-button>
      <el-button
        :icon="FullScreen"
        size="mini"
        circle
        @click="maximizeWin"
      ></el-button>
      <el-button :icon="Close" size="mini" circle @click="closeWin"></el-button>
    </div>
  </div>

  <div style="display: list-item; margin-top: 50px">
    <div v-if="!wsState" style="float: left; margin-left: 10px">
      timer:{{ timerTime }}
      <div class="slider-demo-block">
        <el-slider :min="5" :max="30" v-model="timerTime"></el-slider>
      </div>
    </div>
    <el-button
      type="danger"
      style="float: right; margin-left: 10px"
      @click="clean"
      :icon="Delete"
      circle
    ></el-button>
    <div style="float: right; margin-left: 10px">
      ws监听
      <el-switch v-model="wsState" />
    </div>
  </div>

  <div style="margin-top: 30px"></div>
  <el-switch v-model="notice" active-text="开启通知" inactive-text="关闭通知">
  </el-switch>
  <div id="nav">
    <router-link to="/PoeSession"> PoeSession</router-link> |
    <router-link to="/Main"> Main</router-link> |
    <router-link to="/Proxy"> proxy</router-link>
  </div>
  <router-view></router-view>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane
      :label="'全部' + (newList.length ? '(' + newList.length + ')' : '')"
      name="all"
    ></el-tab-pane>
    <el-tab-pane
      v-for="fetchItem in itemList"
      :key="fetchItem.code"
      :label="
        fetchItem.name +
        (newList.filter((obj) => obj.fetchItem.code === fetchItem.code).length
          ? '(' +
            newList.filter((obj) => obj.fetchItem.code === fetchItem.code)
              .length +
            ')'
          : '')
      "
      :name="fetchItem.code"
    >
    </el-tab-pane>
  </el-tabs>
  <ul class="infinite-list" style="overflow: auto">
    <li
      v-for="item in newList.filter((obj) => {
        if (activeName === 'all') {
          return obj.fetchItem.code != null;
        } else {
          return obj.fetchItem.code === activeName;
        }
      })"
      :key="item.id"
      @click="copy(item.listing.whisper)"
      class="infinite-list-item"
    >
      <img style="height: 100%" :src="item.item.icon" />
      <div style="margin-left: 12px">
        {{ item.fetchItem.name }}
      </div>
      <div style="margin-left: 12px; color: black">
        {{ item.item.name + " " + item.item.baseType }}
      </div>
      <div style="margin-left: 12px">
        报价：{{ item.listing.price.amount + "" + item.listing.price.currency }}
      </div>
      <div style="margin-left: 12px">
        数量：{{ item.item.stackSize ? item.item.stackSize : 1 }} 均价：{{
          item.avgPrice + "c"
        }}
      </div>
      <div style="margin-left: 20px">
        {{
          new Date(item.listing.indexed).getHours() +
          ":" +
          new Date(item.listing.indexed).getMinutes()
        }}
      </div>

      <el-button
        @click="showItem(item.id)"
        style="margin-left: 15px"
        type="danger"
        :icon="List"
        circle
      ></el-button>
      <el-button
        @click="deleteLine(item.id)"
        style="margin-left: 15px"
        type="danger"
        :icon="Delete"
        circle
      ></el-button>
    </li>
  </ul>
  <audio :src="audio" id="eventAudio"></audio>
  <ItemShow :data="itemShowData" :show="itemShow" v-model="itemShow"></ItemShow>
</template>

<script>
import { ipcRenderer } from "electron";
const poeServe = require("./utils/poeServe");
import store from "./store";
const listenAction = require("./utils/listenAction");
import {
  Delete,
  List,
  Refresh,
  Minus,
  FullScreen,
  Close,
} from "@element-plus/icons";
import ItemShow from "./components/itemShow.vue";
import { ElMessage } from "element-plus";
import audio from "./assets/getitem.mp3";

export default {
  name: "App",
  components: { ItemShow },
  data() {
    return {
      itemList: [],
      newList: [],
      activeName: "all",
      notice: true,
      itemShowData: {},
      itemShow: false,
      date: new Date(),
      play: true,
      timerTime: 10,
      working: false,
      workList: [],
      wscount: 0,
      wsClient: {},
      wsReady: {},
      wsState: true,
      wsPoolList: {},
      wsCount: 0,
      Delete,
      List,
      Refresh,
      audio,
      Minus,
      FullScreen,
      Close,
    };
  },
  mounted() {},
  computed: {},
  watch: {
    timerTime: {
      handler(newData, oldData) {
        console.log(newData);
      },
      deep: true,
    },
  },
  methods: {
    minimizeWin() {
      ipcRenderer.send("window-mini"); // 窗口最小化
    },
    maximizeWin() {
      ipcRenderer.send("window-max");
    },
    closeWin() {
      ipcRenderer.send("window-closed");
    },
    copy(text) {
      this.$copyText(text).then(
        (e) => {
          ElMessage("复制成功");
          console.log("复制成功");
        },
        (e) => {
          console.log("复制成功");
        }
      );
    },
    handleClick() {},
    showItem(id) {
      let index = this.newList.findIndex((item) => item.id === id);
      this.itemShowData = this.newList[index];
      this.itemShow = true;
      console.log(this.itemShowData);
    },
    deleteLine(id) {
      let index = this.newList.findIndex((item) => item.id === id);
      this.newList.splice(index, 1);
    },
    reload() {
      location.reload();
    },
    clean() {
      if (this.activeName == "all") {
        this.newList = [];
      } else {
        this.newList = this.newList.filter(
          (item) => item.fetchItem.code != this.activeName
        );
      }
    },
    getWsItem(item) {
      this.wscount++;
      const fetchItem = item;
      let that = this;
      if (this.wsClient[fetchItem.code] || !this.wsState) {
        return false;
      }
      var socket = new WebSocket(
        "ws://" +
          poeServe.wsnginx[(this.wscount % 2) + 1] +
          "/" +
          poeServe.wsnginxapi[item.domain] +
          "/api/trade/live/" +
          encodeURI(item.league) +
          "/" +
          item.code +
          "?poesessid=" +
          store.get("poeSession")[item.domain]
      );

      socket.onclose = function (e) {
        that.wsClient[item.code] = null;
        delete that.wsClient[item.code]
        that.wsReady[item.code] = null;
        delete that.wsReady[item.code]
        ElMessage(fetchItem.name + ",连接关闭");
      };
      socket.onerror = function (e) {
        that.wsClient[item.code] = null;
        delete that.wsClient[item.code]
        that.wsReady[item.code] = null;
        delete that.wsReady[item.code]
        ElMessage(fetchItem.name + ",连接异常");
      };

      socket.onopen = function () {};
      socket.onmessage = function (n) {
        var i = JSON.parse(n.data);
        if (i.auth) {
          if (!that.wsClient[fetchItem.code]) {
            that.wsClient[fetchItem.code] = socket;
            that.wsReady[item.code] = null;
          }
          ElMessage(fetchItem.name + ",连接成功");
        } else if (i.new) {
          if (!that.wsPoolList[fetchItem.code]) {
            that.wsPoolList[fetchItem.code] = [];
          }
          let oldList = that.wsPoolList[fetchItem.code];
          let newList = oldList.concat(i.new);
          if (
            newList.length >= (fetchItem.wsLength ? fetchItem.wsLength : 10)
          ) {
            that.wsPoolList[fetchItem.code] = [];
            listenAction.getWsItems(newList, fetchItem).then(
              (res) => {
                that.showNewItem(res);
              },
              (rej) => {}
            );
          } else {
            that.wsPoolList[fetchItem.code] = newList;
          }
        }
      };
    },
    getItem(item) {
      let that = this;
      setTimeout(() => {
        that.working = false;
        listenAction.getFetch(item).then(
          (res) => {
            that.showNewItem(res);
          },
          (rej) => {}
        );
      }, this.timerTime * 1000);
    },
    showNewItem(res) {
      let that = this;
      if (res && res.length) {
        let newlist = res.reverse().concat(that.newList);
        that.newList = newlist;
        if (
          window.Notification &&
          Notification.permission !== "denied" &&
          that.notice
        ) {
          document.getElementById("eventAudio").play();

          Notification.requestPermission(function (status) {
            if (status === "granted") {
              var n = new Notification(newlist[0].fetchItem.name, {
                body: "新的" + res.length + "份",
              });
            }
          });
        }
      }
    },
  },
  created() {
    let that = this;
    if (this.timer) {
      clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
    }
    if (store.has("timerTime")) {
      this.timerTime = store.get("timerTime");
    }
    that.itemList = store.get("itemList");
    this.timer = setInterval(function () {
      if (store.has("itemList")) {
        that.itemList = store.get("itemList");
        if (!that.wsState) {
          that.itemList.forEach((item, index) => {
            if (item.active && that.workList.indexOf(item.code) < 0) {
              that.workList.push(item.code);
            }
          });
          if (!that.working && that.workList.length > 0) {
            let code = that.workList.shift();
            that.itemList.forEach((item, index) => {
              if (item.active && item.code == code) {
                that.working = true;
                that.getItem(item);
              }
            });
          }
        } else {
          that.itemList.forEach((item, index) => {
            if (
              item.active &&
              !that.wsClient[item.code] &&
              !that.wsReady[item.code]
            ) {
              that.wsReady[item.code] = 1;
              that.getWsItem(item);
            } else if (!item.active && that.wsClient[item.code]) {
              that.wsClient[item.code].close();
            }
          });
          for(let wsCode in that.wsClient){
            console.log("now ws:"+wsCode)
            let flag = true
            that.itemList.forEach((item, index) => {
              if(item.code == wsCode){
                flag = false
              }
            })
            if(flag && that.wsClient[wsCode]){
              that.wsClient[wsCode].close();
            }
          }
        }
      }
    }, 1000);
  },
  beforeUnmount() {
    console.log(123)
    if (this.timer) {
      clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
    }
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}
.infinite-list {
  height: 300px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.infinite-list .infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: var(--el-color-primary-light-9);
  margin: 10px;
  color: var(--el-color-primary);
}

.list-item {
  margin-top: 10px;
}
.header {
  height: 40px;
  position: fixed;
  z-index: 9999999999999999999999999999999999999999999;
  top: 5px;
  width: 98%;
  .title {
    float: left;
    align-self: center;
    -webkit-app-region: drag;
    width: 80%;
    text-align: left;
  }
  .but {
    float: right;
  }
}
</style>
