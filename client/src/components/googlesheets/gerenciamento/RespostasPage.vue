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
    name: 'RespostasPage',
    data: function() {
        return {
            items: [],
            fields: [
                { key: 'row', label: 'row', sortable: true },
                { key: 'data', label: 'data', sortable: true },//não vai ordenar corretamente
                { key: 'vigilante', label: 'vigilante', sortable: true },//não vai ordenar corretamente
                { key: 'nome', label: 'Nome', sortable: true },
                { key: 'atendeu', label: 'Atendeu ao telefonema', sortable: true },
                { key: 'idade', label: 'Idade', sortable: true },
            ]
        }
    },

    methods: {
        loadItems() {
            console.log('load items');
            const id = '1tBlFtcTlo1xtq4lU1O2Yq94wYaFfyL9RboX6mWjKhh4';
            const sheetName = 'Respostas';
            const range = 'A2:AI';
            const url = `${baseApiUrl}/docs/${id}/sheets/${sheetName}/range/${range}`

            axios.get(url).then(res => {
                const array = [];
                res.data.forEach((item, index) => {
                    array.push({
                        row: 'A' + (index + 2),
                        data: item[0],
                        vigilante: item[1],
                        nome: item[2],
                        atendeu: item[3],
                        idade: item[4],
                    });
                });
                this.items = array;
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