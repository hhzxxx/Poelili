<template>
  <el-form
    :inline="true"
    :model="formInline"
    size="mini"
    class="demo-form-inline"
  >

    <el-form-item>
      <el-button type="primary" @click="onlineList">云</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="hideAll">{{hideName}}</el-button>
    </el-form-item>


    <!-- <el-form-item style="margin-right: 60px" label="获取时间">
      <div>{{ EcRate.date }}</div>
    </el-form-item> -->
    <el-form-item v-loading="txValueLoading" label="腾讯服EC比">
      <div>{{ EcRate.txValue }}</div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="getEcRate(1)">刷新</el-button>
    </el-form-item>
    <el-form-item v-loading="gjValueLoading" label="国际服EC比">
      <div>{{ EcRate.gjValue }}</div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="getEcRate(2)">刷新</el-button>
    </el-form-item>
  </el-form>
  <el-tabs v-model="activeName" @tab-click="handleClick">
    <el-tab-pane :label="'全部'" name="all"></el-tab-pane>
    <el-tab-pane
      v-for="type in typeList"
      :key="type"
      :label="type"
      :name="type"
    >
    </el-tab-pane>
  </el-tabs>

  <el-form
    v-for="(data, index) in formData.filter((obj) => {
        if (activeName === 'all') {
          return true
        } else {
          return obj.type === activeName
        }
      })"
    :key="index"
    :inline="true"
    :model="formInline"
    label-width="0px"
    size="mini"
    class="demo-form-inline"
    
  >
    <el-form-item size="mini" label="">
      <el-select
        style="width: 80px"
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
        input-style="min-width:100px;max-width:120px"
        v-model="data.name"
        @click="clickName(data.name)"
        placeholder="reamrk"
      ></el-input>
    </el-form-item>
    <el-form-item label="">
      <div>{{ data.averagePrice }}</div>
    </el-form-item>
    <el-form-item label="">
      <el-input
        input-style="min-width:30px;max-width:60px"
        v-model="data.maxPrice"
        placeholder="最高价"
      ></el-input>
    </el-form-item>
    <el-form-item label="">
      <el-input
        input-style="min-width:30px;max-width:50px"
        v-model="data.wsLength"
        placeholder="wsLength"
      ></el-input>
    </el-form-item>
    <el-form-item label="">
      <el-switch v-model="data.active" />
    </el-form-item>

    <el-form-item>
          <el-dropdown split-button="true" hide-timeout="250" @click="editShow(index)" size="small" max-height="100px" placement="bottom-end" type="primary" @command="handleCommand">
          <span class="el-dropdown-link">
            edit 
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="'test_'+index">test</el-dropdown-item>
              <el-dropdown-item :command="'delete_'+index">delete</el-dropdown-item>
              <el-dropdown-item :command="'upload_'+index">upload</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
    </el-form-item>
    <el-form-item label="">
      <el-switch v-model="data.autoCopy" />
    </el-form-item>
  </el-form>
  <el-row>
    <el-button type="primary" size="small" @click="addItem">Add</el-button>
    <el-button type="primary" size="small" @click="uploadAll">上传</el-button>
  </el-row>
  <EditShow
    :data="editShowData"
    :leagues="leagues"
    :options="typeList.map((type)=>{
      return {
        value:type,
        label:type
      }
    })"
    v-model="itemShow"
  ></EditShow>

  <OnlineList
    width="80%"
    @downItem="downItem"
    :data="onlineListData"
    v-model="onlineListShow"
  ></OnlineList>
</template>

<script>
import { ElMessage } from "element-plus";
const objects = require("../obj/objects");
const spider = require("../utils/spider");
const MathUtils = require("../utils/MathUtils");
import store from "../store";
import dateUtil from "../utils/DateUtil";
import EditShow from "../components/edit.vue";
import OnlineList from "../components/onlineList.vue";

export default {
  components: {
    EditShow,
    OnlineList
  },
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
      leagues: {},
      txValueLoading: false,
      gjValueLoading: false,
      editShowData: {},
      itemShow: false,
      onlineListShow:false,
      onlineListData:[],
      typeList:[],
      activeName:"all",
      hideName:"隐藏"
    };
  },
  watch: {
    formData: {
      handler(newData, oldData) {
        let saveData = [];
        let typeList = []
        newData.forEach((element) => {
          if (element.code && element.domain && element.league) {
            saveData.push(element);
          }
          if(element.type && !typeList.includes(element.type)){
            typeList.push(element.type)
          }
        });
        this.typeList = typeList
        store.set("itemList", saveData);
      },
      deep: true,
    },
    itemShow: {
      handler(newData, oldData) {
        if (!newData) {
          this.editShowData = {};
        }
      },
      deep: true,
    },
  },
  created() {
    var that = this;
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
    if (
      store.has("leagues") &&
      store.get("leagues.1") &&
      store.get("leagues.2")
    ) {
      this.leagues = store.get("leagues");
    } else {
      spider.initTxLeagues().then((res) => {
        this.leagues[1] = res;
      });
      spider.initGJLeagues().then((res) => {
        this.leagues[2] = res;
      });
    }

    // let Ec = setInterval(function () {
    //   that.getEcRate(1)
    //   that.getEcRate(2)
    // }, 1000 * 60 * 30)
  },
  methods: {
    clickName(name) {
      this.$copyText(name).then(
        (e) => {
          ElMessage("复制成功");
        },
        (e) => {}
      );
    },
    editShow(index) {
      let that = this
      let item = this.formData.filter((obj) => {
        if (that.activeName === 'all') {
          return true
        } else {
          return obj.type === that.activeName
        }
      })[index]
      index = this.formData.indexOf(item)
      this.editShowData = this.formData[index];
      this.itemShow = true;
    },
    addItem() {
      this.activeName = 'all'
      this.formData.push(new objects.ItemDate());
      this.editShow(this.formData.length - 1);
    },
    deleteItem(index) {
      if (this.formData.length == 1) {
        this.formData = [new objects.ItemDate()];
      } else {
        this.formData.splice(index, 1);
      }
    },
    uploadItem(index){
      spider.uploadItem(this.formData[index]).then((res)=>{
        if(res.data.body > 0){
          ElMessage("上传成功");
        }
        if(res.data.body == 0){
          ElMessage("更新成功");
        }
      })
    },
    uploadAll(){
      let that = this
      this.formData.forEach((obj,index) => {
        if (that.activeName === 'all') {
          that.uploadItem(index)
        } else if (obj.type === that.activeName) {
          that.uploadItem(index)
        }
      })
    },
    downItem(item){
      // this.onlineListShow=false
      if(item){
        this.formData.push(item)
      }
    },
    handleCommand(command){
      let strs = command.split("_")
      let index = strs[1]
      let that = this
      let item = this.formData.filter((obj) => {
        if (that.activeName === 'all') {
          return true
        } else {
          return obj.type === that.activeName
        }
      })[index]
      index = this.formData.indexOf(item)
      if(strs[0] == "test"){
        ElMessage("开始获取");
        this.getByCode(index)
      }else if(strs[0] == "delete"){
        this.deleteItem(index)
      }else if(strs[0] == "upload"){
        this.uploadItem(index)
      }
    },
    hideAll(){
      this.activeName = "0021312"
    },
    onlineList(){
      let that = this
      spider.onlineList().then(res =>{
        that.onlineListShow = true;
        that.onlineListData = res.data.body.filter((data)=>{
          return that.formData.filter(nowData => nowData.code == data.code).length == 0
        }).map( data => {
          delete data.json
          return data
        })
      })
    },
    /**获取e价格 */
    getEcRate(type) {
      let exCode = store.get("exCode")
      let itemData = {
        code: exCode[type], //
        domain: type,
        league: this.leagues[type][0].text,
      };
      type == 1 ? (this.txValueLoading = true) : (this.gjValueLoading = true);
      spider.getQueryByCode(itemData).then((query) => {
        spider.query({ query: query, data: itemData }).then((res) => {
          itemData.code = res.data.id;
          this.checkLimitState(res.data.limitState);
          if (res.data) {
            spider
              .getItemsByList(
                itemData,
                res.data.fetchID[0],
                res.data.fetchID[1],
                res.data.fetchID[2]
              )
              .then(
                (res) => {
                  let midNum = 0;
                  let priceList = [];
                  res.forEach((element) => {
                    if (element.listing.price.currency == "chaos") {
                      if (
                        (element.item.stackSize ? element.item.stackSize : 1) &&
                        element.listing.price.amount
                      ) {
                        priceList.push(
                          Math.round(
                            type == 1
                              ? element.listing.price.amount /
                                  (element.item.stackSize
                                    ? element.item.stackSize
                                    : 1)
                              : element.listing.price.amount
                          )
                        );
                      }
                    }
                  });
                  midNum = MathUtils.midNum(priceList);
                  ElMessage("获取成功");
                  type == 1
                    ? (this.txValueLoading = false)
                    : (this.gjValueLoading = false);
                  store.set("EcRate.date", dateUtil.formatDate(new Date()));
                  if (type == 1) {
                    this.EcRate.txValue = midNum;
                    store.set("EcRate.txValue", this.EcRate.txValue);
                  } else {
                    this.EcRate.gjValue = midNum;
                    store.set("EcRate.gjValue", this.EcRate.gjValue);
                  }
                },
                (rej) => {
                  ElMessage("获取失败");
                  type == 1
                    ? (this.txValueLoading = false)
                    : (this.gjValueLoading = false);
                }
              );
          }
        });
      });
    },
    /**处理平均价*/
    getAveragePrice(list, domain) {
      let size = 0;
      let chaos = 0;

      list.forEach((element) => {
        if (element.listing.price.currency == "chaos") {
          size += element.item.stackSize ? element.item.stackSize : 1;
          chaos +=
            element.listing.price.amount *
            (domain == 1
              ? 1
              : element.item.stackSize
              ? element.item.stackSize
              : 1);
        }
        if (element.listing.price.currency == "exalted") {
          size += element.item.stackSize ? element.item.stackSize : 1;
          chaos +=
            element.listing.price.amount *
            (domain == 1 ? this.EcRate.txValue : this.EcRate.gjValue) *
            (domain == 1
              ? 1
              : element.item.stackSize
              ? element.item.stackSize
              : 1);
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
            if (this.formData[index].code != res.data.id) {
              if (store.has("queryList." + this.formData[index].code)) {
                let query = store.get("queryList." + this.formData[index].code);
                store.set("queryList." + res.data.id, query);
                store.delete("queryList." + this.formData[index].code);
              }
              this.formData[index].code = res.data.id;
            }

            this.checkLimitState(res.data.limitState);
            if (res.data) {
              spider
                .getItemsByList(this.formData[index], res.data.fetchID[0])
                .then((res) => {
                  ElMessage("获取成功");
                  this.formData[index].averagePrice = this.getAveragePrice(
                    res,
                    this.formData[index].domain
                  );
                });
            }
          });
      });
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
