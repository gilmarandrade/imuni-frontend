<template>
  <div v-if="atendimento">
      <h1>Atendimento - Escala de Equilibrio de Berg</h1>
      <p>{{formatDate(atendimento.timestamp)}}</p>
    <!-- <h6 class="text-muted">{{atendimento.tipo}}</h6> -->

    <div class="row mt-5">
        <div class="col-12">
            <b-card
                title="Paciente"
                    class=""
                >
                <b-card-text>
                    <div>
                        <strong>Nome:</strong> Seu João
                    </div>
                    <div>
                        <strong>Idade:</strong> 76 anos
                    </div>
                </b-card-text>
            </b-card>
            
        </div>
    </div>

    <EscalaEquilibrioBerg v-if="atendimento.tipo === 'EscalaEquilibrioBerg'" :atendimento="atendimento" />
    <div v-else>Escala não encontrada!</div>
  </div>
</template>

<script>
import { baseApiUrl, showError, formatDate } from '@/global';
import axios from 'axios';
import EscalaEquilibrioBerg from '@/components/avalins/escalas/EscalaEquilibrioBerg';

export default {
    name: 'Detalhar',
    components: { EscalaEquilibrioBerg },
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