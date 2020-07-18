<template>
    <div>
        <p>foram encontrados {{ idosos.length }} registros</p>
        <b-table hover :items="idosos" :fields="fields"></b-table>
    </div>
</template>

<script>
import { baseApiUrl, node_env, showError } from '@/global';
import axios from 'axios';

export default {
    name: 'IdososPage',
    data: function() {
        return {
            idosos: [],
            fields: [
                { key: 'row', label: 'row', sortable: true },
                { key: 'dataNascimento', label: 'Data de Nascimento', sortable: true },//não vai ordenar corretamente
                { key: 'nome', label: 'Nome', sortable: true },
                { key: 'telefone1', label: 'Telefone 1', sortable: true },
                { key: 'telefone2', label: 'Telefone 2', sortable: true },
                { key: 'agenteSaude', label: 'Agente de Saúde', sortable: true },
            ]
        }
    },

    methods: {
        loadIdosos() {
            console.log('load idosos');
            const id = '1sP1UegbOnv5dVoO6KMtk2nms6HqjFs3vuYN5FGMWasc';
            const sheetName = 'Idosos';
            const range = 'A2:E';
            console.log('idosos base api url', baseApiUrl, node_env);
            const url = `${baseApiUrl}/docs/${id}/sheets/${sheetName}/range/${range}`;

            axios.get(url).then(res => {
                const array = [];
                res.data.forEach((item, index) => {
                    array.push({
                        row: 'A' + (index + 2),
                        dataNascimento: item[0],
                        nome: item[1],
                        telefone1: item[2],
                        telefone2: item[3],
                        agenteSaude: item[4],
                    });
                });
                this.idosos = array;
                console.log(this.idosos)
            }).catch(showError)
        },
    },
    mounted() {
        this.loadIdosos();
    }
}
</script>

<style>

</style>