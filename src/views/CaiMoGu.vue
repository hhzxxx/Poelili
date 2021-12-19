<template>
  <div class="common-layout">
    <div v-html="listHtml"></div>
  </div>
</template>

<script>
import store from "../store"
const spider = require("../utils/spider")
const caimoguApi = require("../utils/caimogu")

export default {
  components: {},
  props: {},
  data() {
    return {
        listHtml:""
    }
  },
  watch: {
  },
  computed: {},
  methods: {

  },
  created() {
    if (store.has("caimoguCookie")) {
      store.delete("caimoguCookie")
    }
    // caimoguApi.getMyList().then(res => {
    //   this.listHtml = res
    //     console.log(res)
    // })
    caimoguApi.login()
  },
  mounted() {},
}
</script>
<style lang="scss" scoped>

</style>
<style type="text/css">
    #ct{width: 1180px !important;}
    #group_detail .z-left .z-quanzi-con .z-forum-desc{width: 100% !important; padding-right: 45px;}
    #group_detail .z-left .z-quanzi-con .z-forum-desc .z-btns .gz-quanzi.active{border-color: #999;color: #999;}
    .edit-in{float: right;background-color: #4aaafe;border-radius: 3px;padding: 2px 20px;color: #fff;}
    .zlgant-container{margin-top: 33px;}
    ul li{list-style: none;}
    #mdly {position: absolute;margin-top: -16px;padding: 10px 25px;line-height: 32px;overflow: hidden;}
    #mdly h6 {line-height: 32px;}
    #mdly h6 strong {margin: 0 3px;color: #F26C4F;}
    .pipe {margin: 0 5px;color: #CCC;}
    .circleIntr ul li{font-size: 12px; color: #435f6d;}
    .btn-publish-garden{float: right;}
    .poe-select-league {position: relative;padding: 40px 70px 20px 45px;}
    .poe-select-league:after {content: "批量操作";position: absolute;top: 15px;left: 45px;font-size: 12px;font-weight: 700;color: #435f6d;text-transform: uppercase;letter-spacing: 1px;}
    #tGarden{margin: 10px 45px; width: 1060px;}
    #tGarden thead tr th{font-size: 18px; padding: 10px 5px; border-bottom: 1px solid #e0e0e0;}
    #tGarden tbody tr td{padding: 20px 5px; border-bottom: 1px dashed #e0e0e0;}
    .username {width: 130px;display: inline-block; white-space: nowrap;text-overflow: ellipsis;overflow: hidden;word-break: break-all;}
    .action-button{width: 60px; float: left; border: 1px solid lightgrey; text-align: center; margin-right: 10px;cursor: pointer; font-size: 12px; padding: 5px;}
    .btn-common{padding: 5px 20px !important; background-color: #4aaafe !important; color: #fff !important;border: none !important;}
    .action-icon > a{margin-right: 5px;}
    .poe-select-league .season-choice{margin-top: 5px; float: left;}
    .poe-select-league .season-choice a{margin-right: 15px; display: inline-block;}
    .poe-select-league .right-tools{float: right; margin-top: 10px;}
    .input-filter{border-radius: 5px;background-color: #f5f5f8;border: 1px solid #eee;width: 100%;padding: 10px 15px;}
    .btn-style{border-radius: 3px;margin-right: 5px;font-size: 12px;padding: 5px 10px !important;background-color: #4aaafe !important;color: #fff !important;border: none !important;}
    .expire-time{font-size: 10px; padding-top: 5px; color: gray;}
    ul.intro > li{font-weight: bolder;}
    img.icon-currency{height: 32px; max-width: 32px; max-height: 32px; margin-right: 5px; border: none;}
    .btn-batch-delete{background-color: #ff6c6f !important;}
    .btn-batch-offshelves{background-color: #999 !important;}
    .btn-batch-delay{background-color: #996699 !important;}
    .btn-offshelves{background-color: #999 !important;}
    .btn-onshelves{background-color: #339933 !important;}
    .btn-share{background-color: #CC6600 !important;}
    #tGarden > tbody > tr:nth-child(even) {background-color: #F0F0F0;}
    .txt-white{color: black; font-weight: bolder;}
    .txt-red{color: red; font-weight: bolder;}
    .txt-green{color: green; font-weight: bolder;}
    .txt-blue{color: blue; font-weight: bolder;}
    .txt-caster{color: #00a0e9; font-weight: bolder;}
    .txt-physical{color: #c79d93; font-weight: bolder;}
    .txt-fire{color: #ff9a77; font-weight: bolder;}
    .txt-unique{color: #af6025; font-weight: bolder;}
    .txt-cold{color: #93d8ff; font-weight: bolder;}
    .txt-lighting{color: #f8cb76; font-weight: bolder;}
    .txt-speed{color: #86e700; font-weight: bolder;}
    .txt-magic{color: #8888ff; font-weight: bolder;}
    .txt-attack{color: #da814d; font-weight: bolder;}
    .txt-life{color: #c96e6e; font-weight: bolder;}
    .txt-enchanted{color: #b8daf2; font-weight: bolder;}
    .txt-crit{color: #8067d0; font-weight: bolder;}
    .txt-defences{color: #a88f67; font-weight: bolder;}
    .txt-chaos{color: #d8a7d3; font-weight: bolder;}
    .garden-icon{position: absolute;}
    .garden-icon img{width: 22px; height: 22px;}
    .icon-poe-video{width: 19px !important; height: 19px !important;}
    .btn-d2r{padding: 5px 8px !important; color: #a58546 !important;border: none !important; background: url(https://static.caimogu.net/image/d2r/btn-bg.png) no-repeat;}
    .btn-d2r > .btn-d2r-icon{background: url(https://static.caimogu.net/image/d2r/icon.png) no-repeat; background-size: 25px 25px; padding: 4px 13px;}
</style>
