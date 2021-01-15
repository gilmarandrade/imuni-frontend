<template>
    <div v-if="atendimentos">
         <h1>Atendimentos

          <router-link :to="'/avalins/novo'" target="_blank" class="btn btn-outline-primary">
                    Novo
        </router-link>
         </h1>

        <b-table :items="atendimentos" :fields="fields" primary-key="_id" :busy="carregandoAtendimentos" show-empty>
            <template v-slot:table-busy>
                <div class="text-center text-primary my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong> Carregando...</strong>
                </div>
            </template>
            <template v-slot:empty="">
                <div class="text-center text-muted">Não há registros</div>
            </template>
            <template v-slot:cell(col-data)="data">
                <router-link :to="'/avalins/detalhar/'+ data.item._id">
                    {{ formatDate(data.item.timestamp) }}
                </router-link>
            </template>
            <template v-slot:cell(col-score)="data">
                <Badge v-if="data.item.escalas" :value="data.item.escalas.risco" />
            </template>
        </b-table>
    </div>
</template>

<script>
    import { baseApiUrl, showError, formatDate } from '@/global';
    import axios from 'axios';
    import Badge from '@/components/template/Badge';

    export default {
        name: 'Listar',
        components: { Badge },
        data: function() {
            return {
                atendimentos: [],
                fields: [ 
                    { key: 'col-data', label: 'Data' },
                    { key: 'col-score', label: 'Score' },
                ],
                carregandoAtendimentos: false,
            }
        },
        methods: {
            formatDate,
            loadAtendimentos() {
                this.carregandoAtendimentos = true;
                const url = `${baseApiUrl}/v2/avalins/atendimentos/all`;
                console.log(url);

                axios.get(url).then(res => {
                    this.atendimentos = res.data
                    this.carregandoAtendimentos = false;
                    console.log(this.atendimentos)
                }).catch(function(e) {console.error(e);showError(e)})
            },
        },
        mounted() {
            this.loadAtendimentos();
        },
    }
</script>

<style>

</style>