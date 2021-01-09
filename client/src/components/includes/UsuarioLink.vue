<template>
  <span class="usuarioLink">
    <router-link v-if="user.role == 'ADMINISTRADOR' && usuarioUrl" :to="usuarioUrl">{{ usuarioName }}</router-link>
    <span v-else>{{ usuarioName }}</span>
  </span>
</template>

<script>
import { baseApiUrl } from '@/global';
import axios from 'axios';
import { mapState } from 'vuex';

export default {
    name: 'UsuarioLink',
    props: ['id'],
    computed: mapState(['user']),
    data: function() {
        return {
            usuarioName: '',
            usuarioUrl: '',
        };
    },
    methods: {
        async getUsuarioName() {
            const url = `${baseApiUrl}/v2/names/usuarios/${this.id}`;
            console.log(url);

            try {
                const response = await axios.get(url);
                console.log('USUARIOLINK', response);
                // this.usuario = response.data;
                this.usuarioName = response.data.name;
                if(response.data.unidadeId) {
                    this.usuarioUrl = `/unidades/${response.data.unidadeId}/usuarios/${this._id}/idosos/com-escalas`;
                }
            } catch (error) {
                this.usuarioName = this.id;
                console.error(error);
            }
        },
    },
    mounted() {
      this.getUsuarioName();
    }
}
</script>

<style>
    .usuarioLink {
        /* background-color: darkgray; */
    }
</style>