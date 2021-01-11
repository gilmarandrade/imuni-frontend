<template>
  <div v-if="atendimento">
      detalhar
      {{atendimento}}
  </div>
</template>

<script>
import { baseApiUrl, showError, formatDate } from '@/global';
import axios from 'axios';

export default {
    name: 'Detalhar',
    data: function() {
        return {
            atendimento: null
        }
    },
    methods: {
        formatDate,
        loadAtendimento() {
            const url = `${baseApiUrl}/v2/avalins/atendimentos/detalhar/${this.$route.params.atendimentoId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.atendimento = res.data
                console.log(this.atendimento)
            }).catch(function(e) {console.error(e);showError(e)})
        },
    },
    mounted() {
        this.loadAtendimento();
    },
}
</script>

<style>

</style>