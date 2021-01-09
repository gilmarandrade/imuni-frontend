<template>
  <span class="unidadeName">
    <router-link :to="`/unidades/${unidadeId}`">{{ unidadeName }}</router-link> // TODO desativar o link se o usuario não tiver permissao
  </span>
</template>

<script>
import { baseApiUrl } from '@/global';
import axios from 'axios';

export default {
    name: 'UnidadeName',
    props: ['unidadeId'],
    data: function() {
        return {
            unidadeName: null,
        };
    },
    methods: {
        async getUnidadeName() {
            const url = `${baseApiUrl}/v2/names/unidades/${this.unidadeId}`;
            console.log(url);

            try {
                const response = await axios.get(url);
                console.log(response);
                this.unidadeName = response.data;
            } catch (error) {
                this.unidadeName = this.unidadeId;
                console.error(error);
                return error
            }
        },
    },
    mounted() {
      this.getUnidadeName();
    }
}
</script>

<style>
    .unidadeName {
        /* background-color: darkgray; */
    }
</style>