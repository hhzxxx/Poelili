<template>
  <el-form :inline="true"
           :model="formInline"
           size="mini"
           class="demo-form-inline">
    <el-form-item style="margin-right: 60px"
                  label="获取时间">
      <div>{{ EcRate.date }}</div>
    </el-form-item>
    <el-form-item v-loading="txValueLoading"
                  label="腾讯服EC比">
      <div>{{ EcRate.txValue }}</div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary"
                 @click="getEcRate(1)">刷新</el-button>
    </el-form-item>
    <el-form-item v-loading="gjValueLoading"
                  label="国际服EC比">
      <div>{{ EcRate.gjValue }}</div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary"
                 @click="getEcRate(2)">刷新</el-button>
    </el-form-item>
  </el-form>
  <el-form v-for="(data, index) in formData"
           :key="index"
           :inline="true"
           :model="formInline"
           label-width="0px"
           size="mini"
           class="demo-form-inline">
    <el-form-item size="mini"
                  label="">
      <el-select style="width: 80px"
                 fit-input-width="true"
                 v-model="data.domain"
                 placeholder="serve">
        <el-option label="腾讯"
                   value="1"></el-option>
        <el-option label="国际"
                   value="2"></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="">
      <el-input input-style="min-width:120px;max-width:150px"
                v-model="data.name"
                @click="clickName(data.name)"
                placeholder="reamrk"></el-input>
    </el-form-item>
    <el-form-item label-width="60px"
                  label="均价">
      <div>{{ data.averagePrice }}</div>
    </el-form-item>
    <el-form-item label="">
      <el-input input-style="min-width:30px;max-width:60px"
                v-model="data.maxPrice"
                placeholder="最高价"></el-input>
    </el-form-item>
    <el-form-item label="">
      <el-input input-style="min-width:20px;max-width:40px"
                v-model="data.wsLength"
                placeholder="wsLength"></el-input>
    </el-form-item>
    <el-form-item label="">
      <el-switch v-model="data.active" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary"
                 @click="editShow(index)">edit</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary"
                 @click="getByCode(index)">test</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary"
                 @click="deleteItem(index)">delete</el-button>
    </el-form-item>

  </el-form>
  <el-row>
    <el-button type="primary"
               @click="addItem">Add</el-button>
  </el-row>
  <EditShow :data="editShowData"
            :leagues="leagues"
            v-model="itemShow"></EditShow>
</template>

<script>
import { ElMessage } from 'element-plus'
const objects = require('../obj/objects')
const spider = require('../utils/spider')
const MathUtils = require('../utils/MathUtils')
import store from '../store'
import dateUtil from '../utils/DateUtil'
import EditShow from '../components/edit.vue'

export default {
  components: {
    EditShow,
  },
  name: 'HelloWorld',
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
          code: 'YkklVXHY',
          name: '',
          domain: '1',
          league: 'S17赛季',
        },
      ],
      leagues: {},
      txValueLoading: false,
      gjValueLoading: false,
      editShowData: {},
      itemShow: false,
    }
  },
  watch: {
    formData: {
      handler(newData, oldData) {
        let saveData = []
        newData.forEach((element) => {
          if (element.code && element.domain && element.league) {
            saveData.push(element)
          }
        })
        store.set('itemList', saveData)
      },
      deep: true,
    },
    itemShow: {
      handler(newData, oldData) {
        if (!newData) {
          this.editShowData = {}
        }
      },
      deep: true,
    },
  },
  created() {
    var that = this
    if (!store.has('EcRate')) {
      this.EcRate = {
        date: dateUtil.formatDate(new Date()),
        txValue: 0,
        gjValue: 0,
      }
      store.set('EcRate', this.EcRate)
    } else {
      this.EcRate = store.get('EcRate')
    }
    if (store.has('itemList')) {
      this.formData = store.get('itemList')
    } else {
      this.formData = [new objects.ItemDate()]
      store.set('itemList', this.formData)
    }
    if (
      store.has('leagues') &&
      store.get('leagues.1') &&
      store.get('leagues.2')
    ) {
      this.leagues = store.get('leagues')
    } else {
      spider.initTxLeagues().then((res) => {
        this.leagues[1] = res
      })
      spider.initGJLeagues().then((res) => {
        this.leagues[2] = res
      })
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
          ElMessage('复制成功')
        },
        (e) => {}
      )
    },
    editShow(index) {
      this.editShowData = this.formData[index]
      this.itemShow = true
    },
    addItem() {
      this.formData.push(new objects.ItemDate())
      this.editShow(this.formData.length - 1)
    },
    deleteItem(index) {
      if (this.formData.length == 1) {
        this.formData = [new objects.ItemDate()]
      } else {
        this.formData.splice(index, 1)
      }
    },
    /**获取e价格 */
    getEcRate(type) {
      let itemData = {
        code: type == 1 ? '2Xb7pjUk' : 'NV6ofp', //
        domain: type,
        league: this.leagues[type][0].text,
      }
      type == 1 ? (this.txValueLoading = true) : (this.gjValueLoading = true)
      spider.getQueryByCode(itemData).then((query) => {
        spider.query({ query: query, data: itemData }).then((res) => {
          itemData.code = res.data.id
          this.checkLimitState(res.data.limitState)
          this.getItemsByList(
            itemData,
            res.data.fetchID[0],
            res.data.fetchID[1],
            res.data.fetchID[2]
          ).then(
            (res) => {
              let midNum = 0
              let priceList = []
              res.forEach((element) => {
                if (element.listing.price.currency == 'chaos') {
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
                    )
                  }
                }
              })
              midNum = MathUtils.midNum(priceList)
              ElMessage('获取成功')
              type == 1
                ? (this.txValueLoading = false)
                : (this.gjValueLoading = false)
              store.set('EcRate.date', dateUtil.formatDate(new Date()))
              if (type == 1) {
                this.EcRate.txValue = midNum
                store.set('EcRate.txValue', this.EcRate.txValue)
              } else {
                this.EcRate.gjValue = midNum
                store.set('EcRate.gjValue', this.EcRate.gjValue)
              }
            },
            (rej) => {
              ElMessage('获取失败')
              type == 1
                ? (this.txValueLoading = false)
                : (this.gjValueLoading = false)
            }
          )
        })
      })
    },
    /**处理平均价*/
    getAveragePrice(list, domain) {
      let size = 0
      let chaos = 0

      list.forEach((element) => {
        if (element.listing.price.currency == 'chaos') {
          size += element.item.stackSize ? element.item.stackSize : 1
          chaos +=
            element.listing.price.amount *
            (domain == 1
              ? 1
              : element.item.stackSize
              ? element.item.stackSize
              : 1)
        }
        if (element.listing.price.currency == 'exalted') {
          size += element.item.stackSize ? element.item.stackSize : 1
          chaos +=
            element.listing.price.amount *
            (domain == 1 ? this.EcRate.txValue : this.EcRate.gjValue) *
            (domain == 1
              ? 1
              : element.item.stackSize
              ? element.item.stackSize
              : 1)
        }
      })
      if (size > 0 && chaos > 0) {
        console.log('totalChaso:' + chaos + ' size:' + size)
        return Math.round(chaos / size)
      } else {
        return 0
      }
    },
    getByCode(index) {
      if (
        this.isCounting ||
        !this.formData[index].code ||
        !this.formData[index].domain ||
        !this.formData[index].league
      ) {
        return false
      }
      spider.getQueryByCode(this.formData[index]).then((query) => {
        if (!this.formData[index].name) {
          this.formData[index].name = query.query.type
        }
        spider
          .query({ query: query, data: this.formData[index] })
          .then((res) => {
            if (this.formData[index].code != res.data.id) {
              if (store.has('queryList.' + this.formData[index].code)) {
                let query = store.get('queryList.' + this.formData[index].code)
                store.set('queryList.' + res.data.id, query)
                store.delete('queryList.' + this.formData[index].code)
              }
              this.formData[index].code = res.data.id
            }

            this.checkLimitState(res.data.limitState)
            this.getItemsByList(this.formData[index], res.data.fetchID[0]).then(
              (res) => {
                ElMessage('获取成功')
                this.formData[index].averagePrice = this.getAveragePrice(
                  res,
                  this.formData[index].domain
                )
              }
            )
          })
      })
    },
    getItemsByList(item, ...searchList) {
      return new Promise((resolve, reject) => {
        if (searchList.length > 0) {
          let reqList = []
          searchList.forEach((fetchIds) => {
            if (fetchIds && fetchIds.length > 0) {
              reqList.push({
                code: item.code,
                searchList: fetchIds,
                domain: item.domain,
              })
            }
          })
          if (reqList.length > 0) {
            spider.axiosAll(reqList).then(
              (res) => resolve(res),
              (rej) => reject(rej)
            )
          }
        }
      })
    },
    checkLimitState(limitState) {
      switch (
        true // X-Rate-Limit-Ip: 5:10:60,15:60:300,30:300:1800
      ) {
        case limitState.third >= 28:
          this.startCountdown(50)
          break
        case limitState.third >= 24:
          this.startCountdown(10)
          break
        case limitState.second >= 14:
          this.startCountdown(8)
          break
        case limitState.second >= 12:
          this.startCountdown(4)
          break
        case limitState.first >= 4:
          this.startCountdown(2)
          break
        default:
          break
      }
    },
    startCountdown(Time) {
      this.countTime = Time * 1000
      this.isCounting = true
    },
  },
}
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
