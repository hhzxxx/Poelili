<template>
  <el-dialog :model="show" title="新增">
    <el-form ref="form" :model="sdata">
      <el-form-item size="mini" label="Serve">
        <el-select
          fit-input-width="true"
          v-model="sdata.domain"
          placeholder="serve"
        >
          <el-option label="腾讯" value="1"></el-option>
          <el-option label="国际" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item size="mini" label="League">
        <el-select
          fit-input-width="true"
          v-model="sdata.league"
          placeholder="league"
        >
          <el-option
            v-for="(item, index1) in leagues[sdata.domain]"
            :key="index1"
            :label="item.id"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Code">
        <el-input
          :disabled="codeDis"
          v-model="sdata.code"
          placeholder="code"
        ></el-input>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="sdata.name" placeholder="reamrk"></el-input>
      </el-form-item>
      <el-form-item v-if="false" label="ws读取数">
        <el-input
          :disabled="add"
          v-model="sdata.wsLength"
          placeholder="wsLength"
        ></el-input>
      </el-form-item>
      <el-form-item v-if="!add" label="最低价">
        <el-input
          :disabled="add"
          v-model="sdata.minPrice"
          placeholder="minPrice"
        ></el-input>
      </el-form-item>
      <el-form-item v-if="!add" label="最高价">
        <el-input
          :disabled="add"
          v-model="sdata.maxPrice"
          placeholder="maxPrice"
        ></el-input>
      </el-form-item>

      <el-form-item v-if="!add" label="排序">
        <el-select
          :disabled="add"
          @change="changeSort"
          fit-input-width="true"
          v-model="sort"
          placeholder="sort"
        >
          <el-option label="最近" value='{"indexed":"desc"}'></el-option>
          <el-option label="低价" value='{"price":"asc"}'></el-option>
          <el-option label="高价" value='{"price":"desc"}'></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #title>
      <span class="dialog-footer">
        <h3>新增</h3>
        <el-button
          v-if="sdata.league && sdata.domain"
          style="float: right"
          type="primary"
          @click="newWindow"
          >网页</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script>
const poeServe = require("../utils/poeServe");
import store from "../store";
import { viewCreate, windowCreate } from "../utils/plugins";
import { ipcRenderer } from "electron";
const spider = require("../utils/spider");

export default {
  name: "HelloWorld",
  props: {
    data: Object,
    leagues: Object,
    show: Boolean,
  },
  methods: {
    changeSort(val) {
      if (store.has("queryList." + this.sdata.code)) {
        store.set("queryList." + this.sdata.code + ".sort", JSON.parse(val));
      }
      console.log(val);
    },
    init() {
      if (store.has("queryList." + this.sdata.code)) {
        let query = store.get("queryList." + this.sdata.code);
        if (query.sort) {
          this.sort = JSON.stringify(query.sort);
        }
      }
      if (
        store.has(
          "queryList." +
            this.sdata.code +
            ".query.filters.trade_filters.filters.price"
        )
      ) {
        let price = store.get(
          "queryList." +
            this.sdata.code +
            ".query.filters.trade_filters.filters.price"
        );
        this.sdata.minPrice = price.min ? price.min : null;
        this.sdata.maxPrice = price.max ? price.max : null;
      }
      if (this.sdata.code) {
        this.codeDis = true;
        this.add = false;
      } else {
        this.codeDis = false;
        this.add = true;
      }
    },
    newWindow() {
      let that = this;
      ipcRenderer.send("view-new", {
        url:
          poeServe.domains[that.sdata.domain] +
          "/trade/search/" +
          encodeURI(that.sdata.league) +
          (that.sdata.code ? "/" + that.sdata.code : ""),
        POESESSID: store.get("poeSession")[that.sdata.domain],
        domain: poeServe.domains[that.sdata.domain],
        proxy:spider.takeProxy()
      });
      ipcRenderer.on("view-reply", (event, arg) => {
        let args = arg.split("/");
        if (args.length == 7) {
          that.sdata.code = args[6];
          that.sdata.minPrice = null;
          that.sdata.maxPrice = null;
        }
      });
    },
  },
  watch: {
    data: {
      handler(newData, oldData) {
        this.sdata = newData;
        this.codeDis = false;
        this.add = false;
        if (
          (newData.minPrice || newData.maxPrice) &&
          store.has("queryList." + newData.code)
        ) {
          let price = {
            min: newData.minPrice ? parseInt(newData.minPrice) : null,
            max: newData.maxPrice ? parseInt(newData.maxPrice) : null,
            option: null,
          };
          store.set(
            "queryList." +
              newData.code +
              ".query.filters.trade_filters.filters.price",
            price
          );
          store.set(
            "queryList." +
              newData.code +
              ".query.filters.trade_filters.disabled",
            false
          );
        }
        if (
          newData.code != oldData.code &&
          newData.code &&
          newData.code.length > 5
        ) {
          store.delete("queryList." + oldData.code);
          this.sdata.minPrice = null;
          this.sdata.maxPrice = null;
        }
        this.init();
      },
      deep: true,
    },
  },
  data() {
    return {
      sdata: this.data,
      sort: "",
      codeDis: false,
      add: false,
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
