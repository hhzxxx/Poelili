<template>
  <el-dialog :model="show" title="云列表">
    <el-tabs el-tabs v-model="activeName" @tab-click="handleClick">
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
    v-for="(data, index) in sdata"
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
        input-style="min-width:120px;max-width:80px"
        v-model="data.name"
        placeholder="reamrk"
      ></el-input>
    </el-form-item>
    <el-form-item label="">
      <el-input
        input-style="min-width:120px;max-width:150px"
        v-model="data.type"
      ></el-input>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="downItem(index)">获取</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="deleteItem(index)">删除</el-button>
    </el-form-item>
  </el-form>
  </el-dialog>
</template>

<script>
const poeServe = require("../utils/poeServe");
import store from "../store";
import { ipcRenderer } from "electron";
const spider = require("../utils/spider");

export default {
  name: "HelloWorld",
  props: {
    data: Object,
    show: Boolean,
  },
  methods: {
    downItem(index){
        this.$emit('downItem',this.sdata[index])
    },
    deleteItem(index){
        spider.deleteOnlineItem(this.sdata[index].code).then(res =>{
            if(res.data.body == 0){
                this.sdata.splice(index, 1);
                // this.$emit('downItem',null)
            }
        })
    }
  },
  watch: {
    data: {
      handler(newData, oldData) {
        this.sdata = newData;
        console.log(this.sdata);
      },
      deep: true,
    },
  },
  data() {
    return {
      sdata: this.data,
      activeName:"all",
    };
  },
  created() {
    // this.init()
    console.log(this.sdata);
  },
  mounted() {
    console.log(this.sdata);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
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
