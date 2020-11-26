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
              <template v-slot:cell(status)="data">
                <span v-if="data.item.invitationToken">
                  convite enviado
                  <button @click="resendInvite(data.item._id)" class="btn btn-outline-primary">reenviar</button>
                </span>
                <span v-else>
                  ativo
                </span>
              </template>
                <template v-slot:cell(acoes)="data">
                  <b-button @click="deleteUsuario(data.item._id)" :disabled="data.item._id == user.id" class="btn btn-danger ml-2">excluir</b-button>
              </template>
            </b-table>
         </div>
       </div>
 </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import { mapState } from 'vuex';

export default {
    name: 'Administradores',
    data: function() {
        return {
            usuarios: [],
            fieldsUsuarios: [ 
                { key: 'name', label: 'nome' },
                { key: 'email', label: 'email' },
                { key: 'status', label: 'status' },
                { key: 'acoes', label: 'ações' },
            ],
        }
    },
    computed: mapState(['user']),
    methods: {
        loadUsuarios() {
            const url = `${baseApiUrl}/v2/administradores`;
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
        deleteUsuario(id) {
          this.$bvModal.msgBoxConfirm('Deseja realmente excluir o usuário? Todos os dados serão perdidos!', {
            okVariant: 'danger',
            okTitle: 'excluir',
            cancelTitle: 'cancelar',
          })
            .then(value => {
              console.log(value);
              if(value === true) {
                  const url = `${baseApiUrl}/v2/administradores/${id}`;
                  console.log(url);

                  axios.delete(url).then(res => {
                      console.log(res)
                      this.$toasted.global.defaultSuccess({ msg: 'Usuário removido com sucesso'});
                      this.loadUsuarios();
                  }).catch(showError)
              }
            })
            .catch(err => {
              // An error occurred
              console.error(err.toString())
            })
        },
    },
    mounted() {
      this.loadUsuarios();
    }
}
</script>

<style>

</style>