<template>
  <div class="row mt-4" v-if="atendimento">
      <!-- <h1>Atendimento - Escala de Equilibrio de Berg</h1>
      <p>{{formatDate(atendimento.timestamp)}}</p> -->
         <div class="col-xs-12 col-lg-8">
            <b-card
                    title="Respostas"
                    class="mb-4"
                >
                <b-card-text>
                    <FormResponse v-for="item in atendimento.raw['S02']" :key="item.question" :item="item" />
                </b-card-text>
            </b-card>
            
         </div>
         <div class="col-xs-12 col-lg-4">
            <b-card
                title="Resultado"
                class="mb-4"
                v-if="atendimento.escalas"
            >
                <b-card-text>
                    <strong>Risco de Queda: </strong>
                    <Badge :value="atendimento.escalas.risco" /> 
                    <br/>
                    <strong>Score: </strong>
                    {{ atendimento.escalas.score }}
                </b-card-text>
            </b-card>
            <b-card
                class="mb-4"
                v-if="atendimento.descricao"
            >
                <b-card-text>
                    <div v-html="atendimento.descricao"></div>
                </b-card-text>
            </b-card>
         </div>
  </div>
</template>

<script>
import { formatDate } from '@/global';
import Badge from '@/components/template/Badge';
import FormResponse from '@/components/template/FormResponse';

export default {
    name: 'EscalaEquilibrioBerg',
    props: ['atendimento'],
    components: { Badge, FormResponse },
    data: function() {
        return {
        }
    },
    methods: {
        formatDate,
    },
    mounted() {
    },
}
</script>

<style>

</style>