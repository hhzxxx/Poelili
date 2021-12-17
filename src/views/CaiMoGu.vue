<template>
  <div class="common-layout">
    <el-form size="mini" class="demo-form-inline">
      <el-form-item label="">
        <el-input
          input-style="min-width:220px;max-width:300px"
          v-model="caimoguCookie"
          placeholder="cookie"
        ></el-input>
      </el-form-item>
    </el-form>
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
        caimoguCookie:""
    }
  },
  watch: {
    caimoguCookie: {
      handler(newData, oldData) {
        store.set("caimoguCookie", newData);
      },
      deep: true,
    },
  },
  computed: {},
  methods: {

  },
  created() {
    if (store.has("caimoguCookie")) {
      this.caimoguCookie = store.get("caimoguCookie");
    }
    caimoguApi.getMyList().then(res => {
        console.log(res)
    })
  },
  mounted() {},
}
</script>
<style lang="scss" scoped>
</style>
