<template>
  <div style="padding:16px">
    <h2>自动化调试</h2>
    <div>
      <button @click="clickTest">点击(100,100)</button>
      <button @click="typeTest">输入 'hello'</button>
    </div>
    <div style="margin-top:8px;">{{ msg }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { clickAt, keypress } from '../api/automationBridge';

const msg = ref('');

async function clickTest(){ const r = await clickAt(100,100); msg.value = JSON.stringify(r); }
async function typeTest(){ const r = await keypress('hello'); msg.value = JSON.stringify(r); }
</script>
