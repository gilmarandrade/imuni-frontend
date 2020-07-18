<template>
    <div>
        <p>foram encontrados {{ idosos.length }} registros</p>
        <b-table hover :items="idosos" :fields="fields"></b-table>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';

export default {
    name: 'IdososOrdemAlfabeticaPage',
    data: function() {
        return {
            idosos: [],
            fields: [
                { key: 'row', label: 'row', sortable: true },
                { key: 'nome', label: 'Nome', sortable: true },
            ]
        }
    },

    methods: {
        loadIdosos() {
            console.log('load idosos');
            const id = '1sP1UegbOnv5dVoO6KMtk2nms6HqjFs3vuYN5FGMWasc';
            const sheetName = 'Idosos em ordem alfabética';
            const range = 'A2:A';
            const url = `${baseApiUrl}/docs/${id}/sheets/${sheetName}/range/${range}`;

            axios.get(url).then(res => {
                const array = [];
                res.data.forEach((item, index) => {
                    array.push({
                        row: 'A' + (index + 2),
                        nome: item[0],
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