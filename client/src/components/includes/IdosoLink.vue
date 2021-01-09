<template>
  <span class="idosoLink">
    <router-link v-if="user.role == 'ADMINISTRADOR'" :to="urlIdoso">{{ nomeIdoso }}</router-link>
    <span v-else>{{ nomeIdoso }}</span>
  </span>
</template>

<script>
import { baseApiUrl } from '@/global';
import axios from 'axios';
import { mapState } from 'vuex';

export default {
    name: 'IdosoLink',
    props: ['id', 'nome', 'url'],
    computed: mapState(['user']),
    data: function() {
        return {
            nomeIdoso: 'asas',
            urlIdoso: 'fsf',
        };
    },
    methods: {
        async getIdoso() {
            const url = `${baseApiUrl}/v2/idosos/${this.id}`;
            console.log(url);

            try {
                const response = await axios.get(url);
                this.nomeIdoso = response.data.nome;
                this.urlIdoso = `/unidades/${response.data.unidadeId}/idosos/${response.data._id}`;
            } catch (error) {
                console.error(error);
            }
        },
    },
    mounted() {
        if(this.nome && this.url) {
            console.log('já definido')
            this.nomeIdoso = this.nome;
            this.urlIdoso = this.url;
        } else {
            console.log('não definido')
            this.getIdoso();
        }
    }
}
</script>

<style>
    .idosoLink {
        /* background-color: darkgray; */
    }
</style>