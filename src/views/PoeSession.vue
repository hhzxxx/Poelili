<template>
  <div class="wrapper">
    <el-form size="mini" class="demo-form-inline">
      <el-form-item label="">
        <el-input
          input-style="min-width:220px;max-width:300px"
          v-model="poeSession[1]"
          placeholder="腾讯服"
        ></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-input
          input-style="min-width:220px;max-width:300px"
          v-model="poeSession[2]"
          placeholder="国际服"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import store from "../store";

export default {
  components: {},
  props: {},
  data() {
    return {
      poeSession: {
        1: "",
        2: "",
      },
    };
  },
  watch: {
    poeSession: {
      handler(newData, oldData) {
        store.set("poeSession", newData);
      },
      deep: true,
    },
  },
  computed: {},
  methods: {},
  created() {
    if (store.has("poeSession")) {
      this.poeSession = store.get("poeSession");
    } else {
      this.poeSession = [
        {
          1: "",
          2: "",
        },
      ];
      store.set("poeSession", this.poeSession);
    }
  },
  mounted() {},
};
</script>
<style lang="scss" scoped>
</style>