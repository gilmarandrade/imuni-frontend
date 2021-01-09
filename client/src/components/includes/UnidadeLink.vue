<template>
  <span class="unidadeLink">
    <router-link v-if="user.role == 'ADMINISTRADOR'" :to="`/unidades/${id}`">{{ unidadeName }}</router-link>
    <span v-else>{{ unidadeName }}</span>
  </span>
</template>

<script>
import { baseApiUrl } from '@/global';
import axios from 'axios';
import { mapState } from 'vuex';

export default {
    name: 'UnidadeLink',
    props: ['id'],
    computed: mapState(['user']),
    data: function() {
        return {
            unidadeName: null,
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
            } catch (error) {
                this.unidadeName = this.id;
                console.error(error);
            }
        },
    },
    mounted() {
      this.getUnidadeName();
    }
}
</script>

<style>
    .unidadeLink {
        /* background-color: darkgray; */
    }
</style>