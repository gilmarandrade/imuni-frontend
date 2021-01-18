<template>
 <div class="administradores">
      <Breadcrumb :path="[{text:'Dashboard', url:'/'}, {text: 'Administradores'}]" />
        <h1>Administradores</h1>
        <div class="card mb-4">
         <div class="card-body">
            <h5 class="card-title">
              Usuários
              <router-link :to="'/administradores/addUsuario'" class="btn btn-primary float-right mb-3">convidar</router-link>
            </h5>
            
            <b-table :items="usuarios" :fields="fieldsUsuarios">
              <template v-slot:cell(status)="data">
                <span v-if="data.item.status == 'INCOMPLETO'">
                  INCOMPLETO
                </span>
                <span v-else-if="data.item.status == 'CONVIDADO'">
                  CONVITE ENVIADO 
                  <button @click="resendInvite(data.item._id)" class="btn btn-outline-primary">reenviar</button>
                </span>
                <span v-else>
                  <b-form-checkbox v-model="data.item.status" value="ATIVO" unchecked-value="INATIVO" name="check-button" switch @change="toggleAtivo(data.item)" :disabled="data.item._id == user.id">
                  </b-form-checkbox>
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
import Breadcrumb from '@/components/includes/Breadcrumb';

export default {
    name: 'Administradores',
    components: { Breadcrumb },
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
            const url = `${baseApiUrl}/v2/usuarios/resendInvitation/${userId}`;
            console.log(url);

            axios.post(url).then( (res) => {
                console.log(res)
                this.$toasted.global.defaultSuccess({msg: res.data});
            }).catch(showError)
        },
        toggleAtivo(user) {
            const url = `${baseApiUrl}/v2/usuarios/${user._id}/status/${user.status == 'ATIVO' ? 'INATIVO' : (user.status == 'INATIVO' ? 'ATIVO' : user.status)}`;
            console.log(url);

            axios.post(url).then( (res) => {
                this.$toasted.global.defaultSuccess({msg: res.data});
            }).catch(e => {
              user.status = user.status == 'ATIVO' ? 'INATIVO' : (user.status == 'INATIVO' ? 'ATIVO' : user.status)
              showError(e)
            })
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
                  const url = `${baseApiUrl}/v2/usuarios/${id}`;
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