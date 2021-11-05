<template>
  <div>Poelili</div>

  <div id="nav">
    <router-link to="/PoeSession"> PoeSession</router-link> |
    <router-link to="/Main"> Main</router-link> |
    <router-link to="/Proxy"> proxy</router-link>
  </div>

  <router-view></router-view>
</template>

<script>
export default {
  name: "App",
  components: {},
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
