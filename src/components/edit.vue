<template>
  <el-dialog v-model="sdata.dialogFormVisible" title="Shipping address">
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
      <el-form-item label="ws读取数">
        <el-input
          :disabled="add"
          v-model="sdata.wsLength"
          placeholder="wsLength"
        ></el-input>
      </el-form-item>
      <el-form-item label="最低价">
        <el-input
          :disabled="add"
          v-model="sdata.minPrice"
          placeholder="minPrice"
        ></el-input>
      </el-form-item>
      <el-form-item label="最高价">
        <el-input
          :disabled="add"
          v-model="sdata.maxPrice"
          placeholder="maxPrice"
        ></el-input>
      </el-form-item>
      <el-form-item label="排序">
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
  </el-dialog>
</template>

<script>
import store from "../store";
export default {
  name: "HelloWorld",
  props: {
    data: Object,
    leagues: Object,
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
      } else {
        this.add = true;
      }
    },
  },
  watch: {
    sdata: {
      handler(newData, oldData) {
        if (newData.minPrice || newData.maxPrice) {
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
        if (newData.dialogFormVisible != oldData.dialogFormVisible) {
          this.init();
        }
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
    this.init();
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
