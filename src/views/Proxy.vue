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
        <el-button type="primary" @click="test(index)">test</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="deleteProxy(index)">delete</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-button type="primary" @click="addProxy">Add</el-button>
      <el-button type="primary" @click="getProxy">Get</el-button>
    </el-row>
  </div>
</template>

<script>
import store from "../store";
const spider = require("../utils/spider");
import { ElMessage } from "element-plus";

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
          if (element.address.length>8) {
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
        address: "http://",
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
    getProxy() {
      spider.getProxy().then(
        (res) => {
          ElMessage("获取中，测试连接");
          console.log(res.data);
          if (res.data.proxy) {
            let address = "http://" + res.data.proxy;
            spider.checkProxyOut(address).then(
              (res) => {
                let flag = true;
                this.formData.forEach((proxy) => {
                  if (proxy.address.indexOf(address) >= 0) {
                    flag = false;
                  }
                });
                if (flag) {
                  ElMessage("新增代理");
                  this.formData.push({
                    address: address,
                    username: "",
                    password: "",
                    active: true,
                  });
                }
              },
              (rej) => {
                ElMessage("代理不可用");
              }
            );
          }
        },
        (rej) => {
          ElMessage("获取失败");
        }
      );
    },
    test(index) {
      let that = this;
      let proxy = this.formData[index];
      let address = proxy.address;
      if (proxy.username && proxy.password) {
        address =
          "http://" +
          proxy.username +
          ":" +
          proxy.password +
          "@" +
          proxy.address.replace("http://", "");
      }
      spider.checkProxyOut(address).then(
        (res) => {
          ElMessage("代理可用");
        },
        (rej) => {
          ElMessage("代理不可用");
          that.formData[index].active = false;
        }
      );
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
<style lang="scss" scoped></style>
