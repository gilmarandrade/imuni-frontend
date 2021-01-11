<template>
  <div v-if="atendimento">
      <!-- {{atendimento}} -->
    <h1>Atendimento</h1>
    <h6 class="text-muted">{{ formatDate(atendimento.timestamp) }}</h6>

     <div class="row mt-5">
         <div class="col">
            <b-card
                    title="Respostas"
                    class="mb-4"
                >
                <b-card-text>
                    <FormResponse v-for="item in atendimento.raw['S02']" :key="item.question" :item="item" />
                </b-card-text>
            </b-card>
         </div>
     </div>
  </div>
</template>

<script>
import { baseApiUrl, showError, formatDate } from '@/global';
import axios from 'axios';
import FormResponse from '@/components/template/FormResponse';

export default {
    name: 'Detalhar',
    components: { FormResponse },
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