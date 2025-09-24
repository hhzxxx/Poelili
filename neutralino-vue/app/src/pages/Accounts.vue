<template>
  <div style="padding:16px">
    <h2>账号与 Cookie</h2>
    <div style="margin:8px 0;">
      <input v-model="id" placeholder="账号ID" />
      <input v-model="name" placeholder="名称" />
      <input v-model="cookie" placeholder="Cookie" style="width:420px" />
      <button @click="save">保存</button>
    </div>
    <table border="1" cellspacing="0" cellpadding="6">
      <tr><th>ID</th><th>名称</th><th>状态</th><th>验证</th></tr>
      <tr v-for="a in accounts" :key="a.id">
        <td>{{ a.id }}</td>
        <td>{{ a.name }}</td>
        <td>{{ a.status }}</td>
        <td><button @click="verify(a.id)">验证</button></td>
      </tr>
    </table>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { saveCookie as apiSave, listAccounts, verifyAccount } from '../api/cookies';

const accounts = ref<any[]>([]);
const id = ref('');
const name = ref('');
const cookie = ref('');

async function load(){ accounts.value = await listAccounts(); }
async function save(){ await apiSave(id.value, name.value, cookie.value); id.value=''; name.value=''; cookie.value=''; await load(); }
async function verify(i:string){ const r = await verifyAccount(i); alert(r.ok ? '有效' : ('无效: '+(r.reason||''))); }

onMounted(load);
</script>
