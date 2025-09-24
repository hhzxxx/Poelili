<template>
  <div style="padding:16px">
    <h2>设置</h2>
    <p>版本：{{ version }}</p>
    <router-link to="/">返回仪表盘</router-link>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAppStore } from '../store';

const app = useAppStore();
const { version } = storeToRefs(app);
</script>
