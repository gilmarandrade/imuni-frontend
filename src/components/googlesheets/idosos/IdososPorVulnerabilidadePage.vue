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
    name: 'IdososPorVulnerabilidadePage',
    data: function() {
        return {
            idosos: [],
            fields: [
                { key: 'row', label: 'row', sortable: true },
                { key: 'nome', label: 'Nome', sortable: true },
                { key: 'escalaVulnerabilidade', label: 'Escala de Vulnerabilidade', sortable: true },//nem essa?
                { key: 'escalaEpidemiologica', label: 'Escala Epidemiológica', sortable: true },//nem essa ordenação vai funcinar
                { key: 'escalaRisco', label: 'Escala de Risco COVID-19', sortable: true },//escala epidemiológica não vai ordenar corretamente, pois se baseia em string ordem alfabética
                { key: 'scoreOrdenacao', label: 'Score de Ordenacao', sortable: true },//nem essa
            ]
        }
    },

    methods: {
        loadIdosos() {
            console.log('load idosos');
            const id = '1sP1UegbOnv5dVoO6KMtk2nms6HqjFs3vuYN5FGMWasc';
            const sheetName = 'Idosos por vulnerabilidade';
            const range = 'A2:E';
            const url = `${baseApiUrl}/docs/${id}/sheets/${sheetName}/range/${range}`;

            axios.get(url).then(res => {
                const array = [];
                res.data.forEach((item, index) => {
                    array.push({
                        row: 'A' + (index + 2),
                        nome: item[0],
                        escalaVulnerabilidade: item[1],
                        escalaEpidemiologica: item[2],
                        escalaRisco: item[3],
                        scoreOrdenacao: item[4],
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