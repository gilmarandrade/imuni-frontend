<template>
    <div>
        <p>foram encontrados {{ items.length }} registros</p>
        <b-table hover :items="items" :fields="fields"></b-table>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';

export default {
    name: 'StatusAtendimentosPage',
    data: function() {
        return {
            items: [],
            fields: [
                { key: 'row', label: 'row', sortable: true },
                { key: 'vigilante', label: 'Vigilante', sortable: true },//não vai ordenar corretamente
                { key: 'nome', label: 'Nome', sortable: true },
                // { key: 'telefone1', label: 'Telefones', sortable: true },
                // { key: 'telefone2', label: 'Telefone 2', sortable: true },
                { key: 'agenteSaude', label: 'Agente de Saúde', sortable: true },
                // { key: 'tentativas', label: 'Tentativas', sortable: true },
                { key: 'atendimentosEfetuados', label: 'Atendimentos Efetuados', sortable: true },
                { key: 'escalaVulnerabilidade', label: 'Escala Vulnerabilidade', sortable: true },
                { key: 'escalaEpidemiologica', label: 'Escala Epidemiológica', sortable: true },
                { key: 'escalaRisco', label: 'Escala Risco COVID-19', sortable: true },
                { key: 'scoreOrdenacao', label: 'scoreOrdenacao', sortable: true },
                { key: 'dataUltimoAtendimento', label: 'Último Atendimento', sortable: true },
                // { key: 'horaUltimoAtendimento', label: 'Hora do último Atendimento', sortable: true },
                { key: 'sugestaoProximoAtendimento', label: 'Sugestão próximo atendimento', sortable: true },
            ]
        }
    },

    methods: {
        loadItems() {
            console.log('load items');
            const id = '1tBlFtcTlo1xtq4lU1O2Yq94wYaFfyL9RboX6mWjKhh4';
            const sheetName = 'Status Atendimentos';
            const range = 'A2:AI';
            const url = `${baseApiUrl}/docs/${id}/sheets/${sheetName}/range/${range}`;

            axios.get(url).then(res => {
                const array = [];
                res.data.forEach((item, index) => {
                    array.push({
                        row: 'A' + (index + 2),
                        vigilante: item[0],
                        nome: item[1],
                        telefone1: `${item[2]} ${item[3]}`,
                        // telefone2: item[3],
                        agenteSaude: item[4],
                        tentativas: item[5],
                        // atendimentosEfetuados: item[6],
                        atendimentosEfetuados: `${+item[6]}/${+item[5] + +item[6]}`,
                        escalaVulnerabilidade: item[7],
                        escalaEpidemiologica: item[8],
                        escalaRisco: item[9],
                        scoreOrdenacao: item[10],
                        dataUltimoAtendimento: `${item[11]} ${item[12]}`,
                        sugestaoProximoAtendimento: item[13],
                    });
                });
                this.items = array;
                console.log(this.items)
            }).catch(showError)
        },
    },
    mounted() {
        this.loadItems();
    }
}
</script>

<style>

</style>