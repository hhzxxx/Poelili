<template>
  <el-form
    :inline="true"
    :model="formInline"
    size="mini"
    class="demo-form-inline"
  >
    <el-form-item style="margin-right: 60px" label="获取时间">
      <div>{{ EcRate.date }}</div>
    </el-form-item>
    <el-form-item label="腾讯服EC比">
      <div>{{ EcRate.txValue }}</div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="getEcRate(1)">刷新</el-button>
    </el-form-item>
    <el-form-item label="国际服EC比">
      <div>{{ EcRate.gjValue }}</div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="getEcRate(2)">刷新</el-button>
    </el-form-item>
  </el-form>
  <el-form
    v-for="(data, index) in formData"
    :key="index"
    :inline="true"
    :model="formInline"
    label-width="0px"
    size="mini"
    class="demo-form-inline"
  >
    <el-form-item size="mini" label="">
      <el-select
        style="width: 90px"
        fit-input-width="true"
        v-model="data.domain"
        placeholder="serve"
      >
        <el-option label="腾讯" value="1"></el-option>
        <el-option label="国际" value="2"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="">
      <el-input
        input-style="min-width:40px;max-width:80px"
        v-model="data.league"
        placeholder="league"
      ></el-input>
    </el-form-item>
    <el-form-item label="">
      <el-input
        input-style="min-width:60px;max-width:100px"
        v-model="data.code"
        placeholder="code"
      ></el-input>
    </el-form-item>
    <el-form-item label="">
      <el-input
        input-style="min-width:70px;max-width:90px"
        v-model="data.name"
        placeholder="reamrk"
      ></el-input>
    </el-form-item>
    <el-form-item label-width="60px" label="均价">
      <div>{{ data.averagePrice }}</div>
    </el-form-item>
    <el-form-item label="">
      <el-input
        input-style="min-width:40px;max-width:80px"
        v-model="data.listenPrice"
        placeholder="监听价"
      ></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="getByCode(index)">test</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="deleteItem(index)">delete</el-button>
    </el-form-item>
  </el-form>
  <el-row>
    <el-button type="primary" @click="addItem">Add</el-button>
  </el-row>
</template>

<script>
const objects = require("../obj/objects");
const spider = require("../utils/spider");
const MathUtils = require("../utils/MathUtils");
import store from "../store";
import dateUtil from "../utils/DateUtil";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      countTime: 0,
      isCounting: false,
      EcRate: {},
      formData: [
        {
          code: "YkklVXHY",
          name: "",
          domain: "1",
          league: "S17赛季",
        },
      ],
    };
  },
  watch: {
    formData: {
      handler(newData, oldData) {
        let saveData = [];
        newData.forEach((element) => {
          if (element.code && element.domain && element.league) {
            saveData.push(element);
          }
        });
        store.set("itemList", saveData);
      },
      deep: true,
    },
  },
  created() {
    if (!store.has("EcRate")) {
      this.EcRate = {
        date: dateUtil.formatDate(new Date()),
        txValue: 0,
        gjValue: 0,
      };
      store.set("EcRate", this.EcRate);
    } else {
      this.EcRate = store.get("EcRate");
    }
    if (store.has("itemList")) {
      this.formData = store.get("itemList");
    } else {
      this.formData = [new objects.ItemDate()];
      store.set("itemList", this.formData);
    }
  },
  methods: {
    addItem() {
      this.formData.push(new objects.ItemDate());
    },
    deleteItem(index) {
      if (this.formData.length == 1) {
        this.formData = [new objects.ItemDate()];
      } else {
        this.formData.splice(index, 1);
      }
    },
    /**获取e价格 */
    getEcRate(type) {
      let itemData = {
        code: type == 1 ? "2Xb7pjUk" : "NV6ofp", //
        domain: type,
        league: type == 1 ? "S17赛季" : "Scourge",
      };
      spider.getQueryByCode(itemData).then((query) => {
        spider.query({ query: query, data: itemData }).then((res) => {
          itemData.code = res.data.id;
          this.checkLimitState(res.data.limitState);
          this.getItemsByList(
            itemData,
            res.data.fetchID[0],
            res.data.fetchID[1],
            res.data.fetchID[2]
          ).then((res) => {
            let midNum = 0;
            let priceList = [];
            res.forEach((element) => {
              if (element.listing.price.currency == "chaos") {
                if (element.item.stackSize && element.listing.price.amount) {
                  priceList.push(
                    Math.round(
                      type == 1
                        ? element.listing.price.amount / element.item.stackSize
                        : element.listing.price.amount
                    )
                  );
                }
              }
            });
            midNum = MathUtils.midNum(priceList);
            store.set("EcRate.date", dateUtil.formatDate(new Date()));
            if (type == 1) {
              this.EcRate.txValue = midNum;
              store.set("EcRate.txValue", this.EcRate.txValue);
            } else {
              this.EcRate.gjValue = midNum;
              store.set("EcRate.gjValue", this.EcRate.txValue);
            }
          });
        });
      });
    },
    /**处理平均价*/
    getAveragePrice(list, domain) {
      let size = 0;
      let chaos = 0;

      list.forEach((element) => {
        if (element.listing.price.currency == "chaos") {
          size += element.item.stackSize;
          chaos +=
            element.listing.price.amount *
            (domain == 1 ? 1 : element.item.stackSize);
        }
        if (element.listing.price.currency == "exalted") {
          size += element.item.stackSize;
          chaos +=
            element.listing.price.amount *
            (domain == 1 ? this.EcRate.txValue : this.EcRate.gjValue) *
            (domain == 1 ? 1 : element.item.stackSize);
        }
      });
      if (size > 0 && chaos > 0) {
        console.log("totalChaso:" + chaos + " size:" + size);
        return Math.round(chaos / size);
      } else {
        return 0;
      }
    },
    getByCode(index) {
      if (
        this.isCounting ||
        !this.formData[index].code ||
        !this.formData[index].domain ||
        !this.formData[index].league
      ) {
        return false;
      }
      spider.getQueryByCode(this.formData[index]).then((query) => {
        if (!this.formData[index].name) {
          this.formData[index].name = query.query.type;
        }
        spider
          .query({ query: query, data: this.formData[index] })
          .then((res) => {
            this.formData[index].code = res.data.id;
            this.checkLimitState(res.data.limitState);
            this.getItemsByList(this.formData[index], res.data.fetchID[0]).then(
              (res) => {
                this.formData[index].averagePrice = this.getAveragePrice(
                  res,
                  this.formData[index].domain
                );
              }
            );
          });
      });
    },
    getItemsByList(item, ...searchList) {
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
    },
    dealFeachIds(res) {
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
    },
    checkLimitState(limitState) {
      switch (
        true // X-Rate-Limit-Ip: 5:10:60,15:60:300,30:300:1800
      ) {
        case limitState.third >= 28:
          this.startCountdown(50);
          break;
        case limitState.third >= 24:
          this.startCountdown(10);
          break;
        case limitState.second >= 14:
          this.startCountdown(8);
          break;
        case limitState.second >= 12:
          this.startCountdown(4);
          break;
        case limitState.first >= 4:
          this.startCountdown(2);
          break;
        default:
          break;
      }
    },
    startCountdown(Time) {
      this.countTime = Time * 1000;
      this.isCounting = true;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
