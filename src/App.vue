<template>
  <div>Poelili</div>
  <el-switch v-model="notice" active-text="开启通知" inactive-text="关闭通知">
  </el-switch>

  <div id="nav">
    <router-link to="/PoeSession"> PoeSession</router-link> |
    <router-link to="/Main"> Main</router-link> |
    <router-link to="/Proxy"> proxy</router-link>
  </div>
  <router-view></router-view>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="全部" name="all"></el-tab-pane>
    <el-tab-pane
      v-for="fetchItem in itemList"
      :key="fetchItem.code"
      :label="fetchItem.name"
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
  <ItemShow :data="itemShowData" :show="itemShow" v-model="itemShow"></ItemShow>
</template>

<script>
import store from "./store";
const listenAction = require("./utils/listenAction");
import { Delete, List } from "@element-plus/icons";
import ItemShow from "./components/itemShow.vue";

export default {
  name: "App",
  components: { ItemShow },
  data() {
    return {
      itemList: [],
      newList: [],
      activeName: "all",
      notice: false,
      itemShowData: {},
      itemShow: false,
      Delete,
      List,
    };
  },
  computed: {
  },
  watch:{
		newList: {
			handler(newData, oldData) {
				if(newData.length>50){
					newData.splice(49)
					this.newList = newData
				}
			},
			deep: true,
		},
  },
  methods: {
    copy(text) {
      this.$copyText(text).then(
        (e) => {
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
  },
  created() {
    let that = this;
    this.itemList = store.get("itemList");
    let int = setInterval(function () {
      if (store.has("itemList")) {
        that.itemList = store.get("itemList");
        try {
          that.itemList.forEach((item, index) => {
            let workingList = store.get("workingList");
            if (item.active && !workingList[item.code]) {
              store.set("workingList." + item.code, true);
              listenAction.getFetch(item).then(
                (res) => {
                  let newlist = res.concat(that.newList);
                  // newlist.sort(function (a, b) {
                  // 	return a.avgPrice - b.avgPrice
                  // })
                  that.newList = newlist;
                  if (res) {
                    if (
                      window.Notification &&
                      Notification.permission !== "denied" &&
                      that.notice
                    ) {
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
    }, 15000);
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
