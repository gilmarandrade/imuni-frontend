<template>
  <span class="usuarioLink" v-if="usuario">
    <router-link v-if="user.role == 'ADMINISTRADOR'" :to="'/unidades/'+'unidade.nome'+'/'+usuario.unidadeId+'/usuarios/'+ usuario._id +'/'+usuario.name + '/com-escalas'">{{ usuario.name }}</router-link>
    <span v-else>{{ usuario.name }}</span>
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
            usuario: null,
        };
    },
    methods: {
        async getUsuarioName() {
            const url = `${baseApiUrl}/v2/names/usuarios/${this.id}`;
            console.log(url);

            try {
                const response = await axios.get(url);
                console.log(response);
                this.usuario = response.data;
            } catch (error) {
                this.usuario = this.id;
                console.error(error);
                return error
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