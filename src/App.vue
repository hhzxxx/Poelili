<template>
  <div>Poelili</div>

  <div id="nav">
    <router-link to="/PoeSession"> PoeSession</router-link> |
    <router-link to="/Main"> Main</router-link> |
    <router-link to="/Proxy"> proxy</router-link>
  </div>
  <router-view></router-view>
  <ul class="infinite-list" style="overflow: auto">
    <li
      v-for="(item, index) in newList"
      :key="index"
      class="infinite-list-item"
    >
      {{ item.item.note }}
    </li>
  </ul>
</template>

<script>
import store from "./store";
const listenAction = require("./utils/listenAction");

export default {
  name: "App",
  components: {},
  data() {
    return {
      itemList: [],
      newList: [],
    };
  },
  methods: {},
  created() {
    let that = this;
    let int = setInterval(function () {
      if (store.has("itemList")) {
        this.itemList = store.get("itemList");
        try {
          this.itemList.forEach((item, index) => {
            let workingList = store.get("workingList");
            if (item.active && !workingList[item.code]) {
              store.set("workingList." + item.code, true);
              listenAction.getFetch(item).then(
                (res) => {
                  that.newList = res.concat(that.newList);
                  if (res) {
                    if (
                      window.Notification &&
                      Notification.permission !== "denied"
                    ) {
                      Notification.requestPermission(function (status) {
                        if (status === "granted") {
                          var n = new Notification("通知标题", {
                            body: "这里是通知内容！",
                          });
                        }
                      });
                    }
                  }
                },
                (rej) => {}
              );
              throw new Error("ending");
            }
          });
          store.set("workingList", {});
        } catch (e) {
          console.log(e);
        }
      }
    }, 10000);
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
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
</style>
