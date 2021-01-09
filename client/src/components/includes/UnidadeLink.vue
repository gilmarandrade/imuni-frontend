<template>
  <span class="unidadeLink">
    <router-link v-if="user.role == 'ADMINISTRADOR'" :to="unidadeUrl">{{ unidadeName }}</router-link>
    <span v-else>{{ unidadeName }}</span>
  </span>
</template>

<script>
import { baseApiUrl } from '@/global';
import axios from 'axios';
import { mapState } from 'vuex';

export default {
    name: 'UnidadeLink',
    props: ['id', 'nome', 'url'],
    computed: mapState(['user']),
    data: function() {
        return {
            unidadeName: '',
            unidadeUrl: '',
        };
    },
    methods: {
        async getUnidadeName() {
            const url = `${baseApiUrl}/v2/names/unidades/${this.id}`;
            console.log(url);

            try {
                const response = await axios.get(url);
                console.log(response);
                this.unidadeName = response.data;
                this.unidadeUrl = `/unidades/${this.id}`;
            } catch (error) {
                this.unidadeName = this.id;
                console.error(error);
            }
        },
    },
    mounted() {
         if(this.nome && this.url) {
            console.log('já definido')
            this.unidadeName = this.nome;
            this.unidadeUrl = this.url;
        } else {
            console.log('não definido')
            this.getUnidadeName();
        }
    }
}
</script>

<style>
    .unidadeLink {
        /* background-color: darkgray; */
    }
</style>