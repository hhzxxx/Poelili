<template>
  <div class="wrapper">
    <el-form size="mini" class="demo-form-inline">
      <el-form-item label="腾讯服">
        <el-input v-model="poeSession[1]" placeholder="腾讯服"></el-input>
      </el-form-item>
      <el-form-item label="国际服">
        <el-input v-model="poeSession[2]" placeholder="国际服"></el-input>
      </el-form-item>
      <el-form-item label="国服E">
        <el-input v-model="exCode[1]" placeholder="国服E"></el-input>
      </el-form-item>
      <el-form-item label="国际服E">
        <el-input v-model="exCode[2]" placeholder="国际服E"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import store from "../store"

export default {
  components: {},
  props: {},
  data() {
    return {
      poeSession: {
        1: "",
        2: "",
      },
      exCode: {
        1: "",
        2: "",
      },
    }
  },
  watch: {
    poeSession: {
      handler(newData, oldData) {
        store.set("poeSession", newData)
      },
      deep: true,
    },
    exCode: {
      handler(newData, oldData) {
        store.set("exCode", newData)
      },
      deep: true,
    },
  },
  computed: {},
  methods: {},
  created() {
    if (store.has("poeSession")) {
      this.poeSession = store.get("poeSession")
    } else {
      this.poeSession = {
        1: "",
        2: "",
      }
      store.set("poeSession", this.poeSession)
    }

    if (store.has("exCode")) {
      this.exCode = store.get("exCode")
    } else {
      this.exCode = {
        1: "2Xb7pjUk",
        2: "NV6ofp",
      }
      store.set("exCode", this.exCode)
    }
  },
  mounted() {},
}
</script>
<style lang="scss" scoped>
.wrapper {
  margin-left: 20%;
  margin-right: 20%;
}
</style>
