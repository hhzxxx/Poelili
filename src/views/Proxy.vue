<template>
  <div class="common-layout">
    <el-form
      v-for="(data, index) in formData"
      :key="index"
      :inline="true"
      :model="formInline"
      label-width="0px"
      size="mini"
      class="demo-form-inline"
    >
      <el-form-item label="">
        <el-input
          input-style="min-width:120px;max-width:160px"
          v-model="data.address"
          placeholder="http://address:port"
        ></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-input
          input-style="min-width:60px;max-width:90px"
          v-model="data.username"
          placeholder="username"
        ></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-input
          input-style="min-width:60px;max-width:90px"
          v-model="data.password"
          placeholder="password"
        ></el-input>
      </el-form-item>
      <el-form-item label="">
        <el-switch v-model="data.active" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="deleteProxy(index)">delete</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-button type="primary" @click="addProxy">Add</el-button>
    </el-row>
  </div>
</template>

<script>
import store from "../store";

export default {
  components: {},
  props: {},
  data() {
    return {
      formData: [
        {
          address: "http://127.0.0.1:10809",
          username: "",
          password: "",
        },
      ],
    };
  },
  watch: {
    formData: {
      handler(newData, oldData) {
        let saveData = [];
        newData.forEach((element) => {
          if (element.address) {
            saveData.push(element);
          }
        });
        console.log(saveData);
        store.set("proxyList", saveData);
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    addProxy() {
      this.formData.push({
        address: "",
        username: "",
        password: "",
      });
    },
    deleteProxy(index) {
      if (this.formData.length == 1) {
        this.formData = [
          {
            address: "",
            username: "",
            password: "",
          },
        ];
      } else {
        this.formData.splice(index, 1);
      }
    },
    saveProxy() {
      store.set("proxyList", this.formData);
    },
  },
  created() {
    if (store.has("proxyList")) {
      this.formData = store.get("proxyList");
    } else {
      this.formData = [
        {
          address: "",
          username: "",
          password: "",
        },
      ];
      store.set("proxyList", this.formData);
    }
  },
  mounted() {},
};
</script>
<style lang="scss" scoped>
</style>