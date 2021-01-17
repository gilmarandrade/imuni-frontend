<template>
  <footer class="footer">
      <span>Sistema IMUNI | Inteligência de Monitoramento Unificado | {{appVersion}} </span>
      <span v-if="appMode == 'TEST'" class="badge bg-danger ml-2">MODO TESTE</span> 
      <span v-if="appMode == 'BETA'" class="badge bg-info ml-2">VERSÃO BETA</span> 
  </footer>
</template>

<script>
import { appMode } from '@/global';

export default {
    name: 'Footer',
    data: function() {
        return {
            appMode: appMode,
        }
    },
    computed: {
        appVersion() {
            return this.$store.getters.appVersion;
        },
    }
}
</script>

<style>
    .footer {
        grid-area: footer;
        background-color: #f1f1f1;
        color: rgba(0, 0, 0, 0.5);

        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 10px;
        font-size: 12px;
    }
</style>