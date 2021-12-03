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
    name: 'EscalasPage',
    data: function() {
        return {
            items: [],
            fields: [
                { key: 'row', label: 'row', sortable: true },
                { key: 'nome', label: 'nome', sortable: true },//não vai ordenar corretamente
                { key: 'idade', label: 'idade', sortable: true },//não vai ordenar corretamente
                { key: 'escalaVulnerabilidade', label: 'Escala Vulnerabilidade', sortable: true },
                { key: 'escalaEpidemiologica', label: 'Escala Epidemiologica', sortable: true },
                { key: 'escalaRisco', label: 'Escala de Risco', sortable: true },
                { key: 'scoreOrdenacao', label: 'Score de Ordenacao', sortable: true },
                { key: 'data', label: 'data', sortable: true },
            ]
        }
    },

    methods: {
        loadItems() {
            console.log('load items');
            const id = '1tBlFtcTlo1xtq4lU1O2Yq94wYaFfyL9RboX6mWjKhh4';
            const sheetName = 'Escalas';
            const range = 'A2:AI';
            const url = `${baseApiUrl}/docs/${id}/sheets/${sheetName}/range/${range}`;

            axios.get(url).then(res => {
                const array = [];
                res.data.forEach((item, index) => {
                    array.push({
                        row: 'A' + (index + 2),
                        nome: item[0],
                        idade: item[1],
                        escalaVulnerabilidade: item[2],
                        escalaEpidemiologica: item[3],
                        escalaRisco: item[4],
                        scoreOrdenacao: item[5],
                        data: item[6],
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