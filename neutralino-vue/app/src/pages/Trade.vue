<template>
  <div style="padding:16px">
    <h2>市集监听</h2>
    <button @click="poll">手动轮询一次</button>
    <ul>
      <li v-for="r in results" :key="r.k">{{ r.text }}</li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { off, on } from '../api/events';
import { pollOnce } from '../api/trade';

const results = ref<{k:string,text:string}[]>([]);

async function poll(){ await pollOnce(); }

function onNew(e:any){
  results.value.unshift({ k: Math.random().toString(36), text: JSON.stringify(e.item) });
  if(results.value.length > 100) results.value.pop();
}

onMounted(()=>{ on('trade:new-item', onNew); });
onBeforeUnmount(()=>{ off('trade:new-item', onNew); });
</script>
