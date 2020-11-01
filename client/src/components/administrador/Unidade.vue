<template>
 <div class="unidades" v-if="unidade">
   <h6><router-link :to="'/'">Home</router-link> / <router-link :to="'/unidades'">Unidades</router-link></h6>
   <header class="header-page">
        <div v-if="unidade.lastSyncDate" class="sync-state" :class="{ 'ativo' : unidade.autoSync }">
          <popper
              trigger="hover"
              :options="{
                placement: 'top'
              }">
              <div class="popper">
                Última sincronização
              </div>

              <span slot="reference">
                <!-- TODO fazer o icone de sincronização rodar durante a sincronização? -->
                  <font-awesome-icon :icon="['fas', 'sync']" /> {{ formatDate(unidade.lastSyncDate) }}
              </span>
          </popper>
        </div>
        <h1>{{ unidade.nome }}</h1>
        <p>Distrito {{ unidade.distrito }}</p>

        <b-checkbox v-model="unidade.autoSync" name="check-button" switch @change="toggleSync">
          {{ unidade.autoSync ? 'Sincronização automática ativada': 'Sincronização automática desativada' }}
        <popper
              trigger="hover"
              :options="{
                placement: 'right'
              }">
              <div class="popper">
                A sincronização automática acontece diariamente as 22:00 
              </div>

              <span slot="reference">
                <span class="text-muted">
                  <font-awesome-icon :icon="['fas', 'info-circle']" />
                </span>
              </span>
          </popper>
        </b-checkbox>
        <button @click="manualSync" class="btn btn-primary" :disabled="syncStatus.status==='LOADING'">sincronizar agora</button>
        <button @click="manualReset" class="btn btn-secondary ml-2" :disabled="syncStatus.status==='LOADING'">resetar</button>
        <router-link :to="'/adicionarUnidade?id='+unidade._id" class="btn btn-outline-primary ml-2">
          editar
        </router-link>
        <b-button @click="confirmDeletion(unidade._id)" class="btn btn-danger ml-2">excluir</b-button>

        <div v-if="loading">carregando...</div>
        
   </header>
   <div class="container">
       <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Planilhas</h5>
          <div>
            <b>Planilha de idosos:</b> <a :href="`https://docs.google.com/spreadsheets/d/${unidade.idPlanilhaIdosos}/edit?usp=sharing`" target="_blank">{{ unidade.idPlanilhaIdosos }}</a>
          </div>
          <div>
            <b>Planilha de gerenciamento:</b> <a :href="`https://docs.google.com/spreadsheets/d/${unidade.idPlanilhaGerenciamento}/edit?usp=sharing`" target="_blank">{{ unidade.idPlanilhaGerenciamento }}</a>
          </div>
          <div>
            <b>Ficha de vigilância:</b> <a :href="`https://docs.google.com/forms/d/${unidade.idFichaVigilancia}/edit?usp=sharing`" target="_blank">{{ unidade.idFichaVigilancia }}</a>
          </div>
        </div>
       </div>

       <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Vigilantes</h5>
            <ul>
                <li v-for="vigilante in unidade.vigilantes" :key="vigilante.nome">
                    <router-link :to="'/unidades/' + unidade.collectionPrefix+'/' + unidade.nome + '/' + unidade._id + '/usuarios/undefined/' + vigilante.nome + '/com-escalas'">{{ vigilante.nome }}</router-link>
                </li>
            </ul>
         </div>
       </div>
       <div class="card mb-4">
         <div class="card-body">
            <h5 class="card-title">
              Usuários
              <router-link :to="'/unidades/'+unidade._id+'/'+unidade.nome+'/addUsuario'" class="btn btn-primary float-right mb-3">convidar</router-link>
            </h5>
            
            <b-table :items="usuarios" :fields="fieldsUsuarios">
              <template v-slot:cell(link)="data">
                <router-link :to="'/unidades/'+unidade.collectionPrefix+'/'+unidade.nome+'/'+unidade._id+'/usuarios/'+ data.item._id +'/'+data.item.name + '/com-escalas'">{{ data.item.name }}</router-link>
              </template>
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
       <div class="card mb-4">
         <div class="card-body">
            <h5 class="card-title">
              Idosos
              <router-link :to="'/unidades/'+unidade._id+'/cadastrarIdoso'" class="btn btn-primary float-right mb-3">cadastrar</router-link>
            </h5>
            
            <b-table :items="idosos" :fields="fieldsIdosos">
              <template v-slot:cell(acoes)="data">
                  <router-link :to="'/unidades/'+unidade._id+'/cadastrarIdoso?id='+data.item._id" class="btn btn-outline-primary">editar</router-link>           
                  <b-button @click="deleteIdoso(data.item._id)" class="btn btn-danger ml-2">excluir</b-button>
              </template>
            </b-table>
         </div>
       </div>
   </div>

 </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';
import { mapState } from 'vuex';

export default {
    name: 'Unidade',
    components: { 'popper': Popper },
    data: function() {
        return {
            unidade: null,
            loading: false,
            usuarios: [],
            fieldsUsuarios: [ 
                { key: 'link', label: '' },
                // { key: 'name', label: 'nome' },
                { key: 'email', label: 'email' },
                { key: 'role', label: 'tipo' },
                { key: 'status', label: 'status' },
            ],
            idosos: [],
            fieldsIdosos: [ 
                { key: 'nome', label: 'nome' },
                { key: 'dataNascimento', label: 'data de nascimento' },
                { key: 'telefone1', label: 'telefone 1' },
                { key: 'telefone2', label: 'telefone 2' },
                { key: 'agenteSaude', label: 'agente de saúde' },
                { key: 'vigilanteId', label: 'vigilante' },
                { key: 'anotacoes', label: 'anotações' },
                { key: 'acoes', label: 'ações' },
            ],
        }
    },
    computed: mapState(['syncStatus']),
    methods: {
        loadUnidade() {
            const url = `${baseApiUrl}/unidades/${this.$route.params.id}`;
            console.log(url);

            axios.get(url).then(res => {
                this.unidade = res.data
                console.log(this.unidade)
            }).catch(showError)
        },
        loadUsuarios() {
            const url = `${baseApiUrl}/unidades/${this.$route.params.id}/usuarios`;
            console.log(url);

            axios.get(url).then(res => {
                this.usuarios = res.data
                console.log(this.usuarios)
            }).catch(showError)
        },
        loadIdosos() {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.id}/idosos`;
            console.log(url);

            axios.get(url).then(res => {
                this.idosos = res.data
                // console.log(this.idosos)
            }).catch(showError)
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
        toggleSync(e) {
          //TODO escolher se vai usar o this.loading ou this.$store para mostrar um loading no sistema (ou usar silhouete)
          this.loading = true;
          this.$store.commit('setIsLoadingApp', true); 
          const url = `${baseApiUrl}/unidades/${this.$route.params.id}/autosync/${e}`;
          console.log(url);

          axios.get(url).then(res => {
            console.log(res)
            this.$router.go();//refresh page

          }).catch((err) => {
                console.log(err);
                this.loading = false;
                this.$store.commit('setIsLoadingApp', false);
                showError(err);
          })
        },
        manualSync() {
          // $socket is socket.io-client instance
          console.log('emit syncEvent')
          this.$socket.emit('syncEvent', { idUnidade: this.unidade._id });
        },
        manualReset() {
          // $socket is socket.io-client instance
          console.log('emit resetEvent')
          this.$socket.emit('resetEvent', { idUnidade: this.unidade._id });
        },
        resendInvite(userId) {
            const url = `${baseApiUrl}/users/resendInvitation/${userId}`;
            console.log(url);

            axios.post(url).then( (res) => {
                console.log(res)
                this.$toasted.global.defaultSuccess({msg: res.data});
            }).catch(showError)
        },
        confirmDeletion(id) {
          this.$bvModal.msgBoxConfirm('Deseja realmente excluir a unidade? Todos os dados serão perdidos!', {
            okVariant: 'danger',
            okTitle: 'excluir',
            cancelTitle: 'cancelar',
          })
            .then(value => {
              console.log(value);
              if(value === true) {
                  const url = `${baseApiUrl}/v2/unidades/${id}`;
                  console.log(url);

                  axios.delete(url).then(res => {
                      console.log(res)
                      this.$router.push({ name: 'unidades' })
                      this.$toasted.global.defaultSuccess({ msg: 'Unidade removida com sucesso'});
                  }).catch(showError)
              }
            })
            .catch(err => {
              // An error occurred
              console.error(err.toString())
            })
        },
        deleteIdoso(id) {
          this.$bvModal.msgBoxConfirm('Deseja realmente excluir o idoso? Todos os dados serão perdidos!', {
            okVariant: 'danger',
            okTitle: 'excluir',
            cancelTitle: 'cancelar',
          })
            .then(value => {
              console.log(value);
              if(value === true) {
                  const url = `${baseApiUrl}/v2/unidades/${this.unidade._id}/idosos/${id}`;
                  console.log(url);

                  axios.delete(url).then(res => {
                      console.log(res)
                      this.$toasted.global.defaultSuccess({ msg: 'Idoso removido com sucesso'});
                      this.loadIdosos();
                  }).catch(showError)
              }
            })
            .catch(err => {
              // An error occurred
              console.error(err.toString())
            })
        },
    },
    sockets: {
      connect: function () {
        console.log('socket connected');
      },
    },
    mounted() {
      this.loadUnidade();
      this.loadUsuarios();
      this.loadIdosos();
    }
}
</script>

<style>
  .header-page {
    padding-bottom: 30px;
    
  }
  .header-page h1 {
    margin: 0;
    font-weight: 600;
    font-size: 22px;
  }


  .header-page .sync-state {
    margin: 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.54);
  }

  .header-page .sync-state.ativo {
    color: #27AE60;
  }

  .header-page p {
    margin: 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.54);
  }

  .card .card-title {
    font-weight: 600;
  }
</style>