<template>
    <div v-if="atendimentos">
         <h1>Atendimentos</h1>
          <router-link :to="'/avalins/novo'" target="_blank">
                    Novo
        </router-link>

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
                <router-link :to="'/unidades/atendimentos/'+ data.item._id">
                    {{ formatDate(data.item.timestamp) }}
                </router-link>
            </template>
        </b-table>
    </div>
</template>

<script>
    import { baseApiUrl, showError, formatDate } from '@/global';
    import axios from 'axios';

    export default {
        name: 'Listar',
        data: function() {
            return {
                atendimentos: [],
                fields: [ 
                    { key: 'col-data', label: 'Data' },
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