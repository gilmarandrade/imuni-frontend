<template>
 <div class="administradores">
        <h6><router-link :to="'/'">Home</router-link></h6>
        <h1>Administradores</h1>
        <div class="card mb-4">
         <div class="card-body">
            <h5 class="card-title">
              Usuários
              <router-link :to="'/administradores/addUsuario'" class="btn btn-primary float-right mb-3">convidar</router-link>
            </h5>
            
            <b-table :items="usuarios" :fields="fieldsUsuarios">
              <!-- <template v-slot:cell(link)="data">
                <router-link :to="'/unidades/'+unidade.collectionPrefix+'/'+unidade.nome+'/vigilantes/'+data.item.name">{{ data.item.name }}</router-link>
              </template> -->
              <template v-slot:cell(status)="data">
                <span v-if="data.item.invitationToken">
                  convite enviado
                  <button @click="resendInvite(data.item._id)" class="btn btn-outline-primary">reenviar</button>
                </span>
                <span v-else>
                  ativo
                </span>
              </template>
            </b-table>
         </div>
       </div>
 </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';

export default {
    name: 'Administradores',
    data: function() {
        return {
            usuarios: [],
            fieldsUsuarios: [ 
                { key: 'name', label: 'nome' },
                { key: 'email', label: 'email' },
                { key: 'status', label: 'status' },
            ],
        }
    },
    methods: {
        loadUsuarios() {
            const url = `${baseApiUrl}/administradores`;
            console.log(url);

            axios.get(url).then(res => {
                this.usuarios = res.data
                console.log(this.usuarios)
            }).catch(showError)
        },
        resendInvite(userId) {
            const url = `${baseApiUrl}/users/resendInvitation/${userId}`;
            console.log(url);

            axios.post(url).then( (res) => {
                console.log(res)
                this.$toasted.global.defaultSuccess({msg: res.data});
            }).catch(showError)
        },
    },
    mounted() {
      this.loadUsuarios();
    }
}
</script>

<style>

</style>