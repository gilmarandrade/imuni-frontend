<template>
 <div class="unidades" v-if="unidade">
   <Breadcrumb :path="[{text:'Dashboard', url:'/'}, {text: 'Unidades', url: '/unidades'}, {text: unidade.nome}]" />
   <header class="header-page row justify-content-between">
     <div class="col-10">
        <h1>{{ unidade.nome }}</h1>
        <p>Distrito {{ unidade.distrito }}</p>
        <b-form-checkbox v-model="unidade.status" unchecked-value="INATIVO" value="ATIVO" name="check-button" switch @change="toggleStatus">
          {{ unidade.status == 'ATIVO' ? 'Unidade ativa' : 'Unidade inativa' }}
        </b-form-checkbox>
     </div>
     <div class="col-2 text-right">
        <!-- <button @click="importFromPlanilhaUnidade" class="btn btn-primary" :disabled="syncStatus.status==='LOADING'">reimportar</button>
        <router-link :to="'/adicionarUnidade?id='+unidade._id" class="btn btn-outline-primary">
          editar
        </router-link>
        <b-button class="btn btn-danger ml-2">excluir</b-button> -->

        <b-dropdown right no-caret variant="light" title="Opções">
            <template #button-content>
                <font-awesome-icon :icon="['fas', 'ellipsis-v']"  />
            </template>
            <b-dropdown-item :href="'/adicionarUnidade?id='+unidade._id">Editar</b-dropdown-item>
            <b-dropdown-item  @click="confirmDeletion(unidade._id)">Excluir</b-dropdown-item>
            <b-dropdown-item :href="`${baseApiUrl}/v2/exportacao/unidades/${unidade._id}/idosos`">Exportar idosos (csv)</b-dropdown-item>
            <b-dropdown-item :href="`${baseApiUrl}/v2/exportacao/unidades/${unidade._id}/atendimentos`">Exportar atendimentos (csv)</b-dropdown-item>
            <!-- <b-dropdown-item  @click="importFromPlanilhaUnidade" :disabled="!unidade.idPlanilhaGerenciamento || syncStatus.status==='LOADING'">Reimportar de planilhas</b-dropdown-item> -->
        </b-dropdown>
     </div>


        <div v-if="loading">carregando...</div>
        
   </header>
   <div class="container">
      <div class="card mb-4">
         <div class="card-body">
            <span class="display-4">{{qtdIdosos}}</span> <strong>Idosos</strong>
            <router-link :to="'/unidades/'+unidade._id+'/usuarios/'+ user.id +'/idosos/all'" class="btn btn-primary float-right mt-3">Ver todos</router-link>
          </div>
      </div>

       <div class="card mb-4">
         <div class="card-body">
            <h5 class="card-title">
              Usuários
              <router-link :to="'/unidades/'+unidade._id+'/addUsuario'" class="btn btn-primary float-right mb-3">Convidar</router-link>
            </h5>
            
            <h6 class="card-subtitle">Ativos</h6>
            <b-table :items="usuariosAtivos" :fields="fieldsUsuarios">
              <template v-slot:cell(link)="data">
                <router-link :to="'/unidades/'+unidade._id+'/usuarios/'+ data.item._id +'/idosos/com-escalas'" title="Clique para ver os idosos do usuário">{{ data.item.name }}</router-link>
                <div class="text-muted">
                  {{data.item.role}} 
                  <span v-if="data.item.role === 'VIGILANTE'">
                    &#8226; <CounterIdosos :idUnidade="data.item.unidadeId" :idVigilante="data.item._id" class="small" />
                  </span>
                </div>
              </template>
              <template v-slot:cell(status)="data">
                <span v-if="data.item.status == 'INCOMPLETO'">
                  <b-form-checkbox v-model="data.item.status" value="ATIVO" unchecked-value="INATIVO" name="check-button" switch :disabled="true" class="d-inline-block">
                  </b-form-checkbox>
                  INCOMPLETO
                  <!-- <button @click="openModalCompletarCadastroUsuario(data.item)" class="btn btn-outline-primary">Completar</button> -->
                </span>
                <span v-else-if="data.item.status == 'CONVIDADO'">
                  <b-form-checkbox v-model="data.item.status" value="ATIVO" unchecked-value="INATIVO" name="check-button" switch :disabled="true" class="d-inline-block">
                  </b-form-checkbox>
                   CONVITE ENVIADO 
                  <!-- <button @click="resendInvite(data.item._id)" class="btn btn-outline-primary">reenviar</button> -->
                </span>
                <span v-else>
                  <b-form-checkbox v-model="data.item.status" value="ATIVO" unchecked-value="INATIVO" name="check-button" switch @change="toggleAtivo(data.item)" :disabled="data.item._id == user.id" class="d-inline-block">
                  </b-form-checkbox>
                  {{ data.item.status }}
                </span>
              </template>
              <template v-slot:cell(acoes)="data">
                <!-- <b-button @click="deleteUsuario(data.item._id)" :disabled="data.item._id == user.id" class="btn btn-danger ml-2">excluir</b-button> -->
                <b-dropdown right no-caret variant="light" title="Opções">
                    <template #button-content>
                        <font-awesome-icon :icon="['fas', 'ellipsis-v']"  />
                    </template>
                    <b-dropdown-item v-if="data.item.status == 'INCOMPLETO'" @click="openModalCompletarCadastroUsuario(data.item)">Enviar convite</b-dropdown-item>
                    <b-dropdown-item v-else-if="data.item.status == 'CONVIDADO'" @click="resendInvite(data.item._id)">Reenviar convite</b-dropdown-item>
                    <b-dropdown-item :disabled="data.item.role !== 'VIGILANTE'" :href="'/unidades/'+data.item.unidadeId+'/usuarios/'+ data.item._id +'/transferirIdosos'">Transferir idosos</b-dropdown-item>
                </b-dropdown>
              </template>
            </b-table>

            <h6 class="card-subtitle">Inativos</h6>
            <b-table :items="usuariosInativos" :fields="fieldsUsuarios">
              <template v-slot:cell(link)="data">
                <router-link :to="'/unidades/'+unidade._id+'/usuarios/'+ data.item._id +'/idosos/com-escalas'" title="Clique para ver os idosos do usuário">{{ data.item.name }}</router-link>
                <div class="text-muted">
                  {{data.item.role}} 
                  <span v-if="data.item.role === 'VIGILANTE'">
                    &#8226; <CounterIdosos  :idUnidade="data.item.unidadeId" :idVigilante="data.item._id" class="small" />
                  </span>
                </div>
              </template>
              <template v-slot:cell(status)="data">
                <span v-if="data.item.status == 'INCOMPLETO'">
                  <b-form-checkbox v-model="data.item.status" value="ATIVO" unchecked-value="INATIVO" name="check-button" switch :disabled="true" class="d-inline-block">
                  </b-form-checkbox>
                  INCOMPLETO
                  <!-- <button @click="openModalCompletarCadastroUsuario(data.item)" class="btn btn-outline-primary">Completar</button> -->
                </span>
                <span v-else-if="data.item.status == 'CONVIDADO'">
                  <b-form-checkbox v-model="data.item.status" value="ATIVO" unchecked-value="INATIVO" name="check-button" switch :disabled="true" class="d-inline-block">
                  </b-form-checkbox>
                   CONVITE ENVIADO 
                  <!-- <button @click="resendInvite(data.item._id)" class="btn btn-outline-primary">reenviar</button> -->
                </span>
                <span v-else>
                  <b-form-checkbox v-model="data.item.status" value="ATIVO" unchecked-value="INATIVO" name="check-button" switch @change="toggleAtivo(data.item)" :disabled="data.item._id == user.id" class="d-inline-block">
                  </b-form-checkbox>
                  {{ data.item.status }}
                </span>
              </template>
              <template v-slot:cell(acoes)="data">
                <!-- <b-button @click="deleteUsuario(data.item._id)" :disabled="data.item._id == user.id" class="btn btn-danger ml-2">excluir</b-button> -->
                 
                <b-dropdown right no-caret variant="light" title="Opções">
                    <template #button-content>
                        <font-awesome-icon :icon="['fas', 'ellipsis-v']"  />
                    </template>
                    <b-dropdown-item v-if="data.item.status == 'INCOMPLETO'" @click="openModalCompletarCadastroUsuario(data.item)">Enviar convite</b-dropdown-item>
                    <b-dropdown-item v-else-if="data.item.status == 'CONVIDADO'" @click="resendInvite(data.item._id)">Reenviar convite</b-dropdown-item>
                    <b-dropdown-item :disabled="data.item.role !== 'VIGILANTE'" :href="'/unidades/'+data.item.unidadeId+'/usuarios/'+ data.item._id +'/transferirIdosos'">Transferir idosos</b-dropdown-item>
                </b-dropdown>
              </template>
            </b-table>
         </div>
      </div>
   </div>

  <!-- The modal -->
  <b-modal 
    id="modal-completar-cadastro-usuario"
    title="Completar cadastro"
    @hidden="modalCompletarCadastroUsuarioReset"
    @ok="modalCompletarCadastroUsuarioHandleOk">

    <form ref="form" @submit.stop.prevent="modalCompletarCadastroUsuarioHandleSubmit">
      <b-alert show variant="info">Um email será enviado para que o usuário possa completar o cadastro e ter acesso ao sistema</b-alert>
      <b-form-group
        label="Nome"
        label-for="nome-input"
      >
        <b-form-input
          id="nome-input"
          v-model="completarCadastroUsuario.nome"
          disabled
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label="E-mail"
        label-for="email-input"
        :state="completarCadastroUsuario.emailState"
        :invalid-feedback="completarCadastroUsuario.emailInvalidFeedback || 'Email inválido'"
      >
        <b-form-input
          id="email-input"
          type="email"
          v-model="completarCadastroUsuario.email"
          required
          :state="completarCadastroUsuario.emailState"
        ></b-form-input>
      </b-form-group>
    </form>

  </b-modal>
 </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import Breadcrumb from '@/components/includes/Breadcrumb';
import CounterIdosos from '@/components/includes/CounterIdosos';
import axios from 'axios';
import 'vue-popperjs/dist/vue-popper.css';
import { mapState } from 'vuex';

export default {
    name: 'Unidade',
    components: { Breadcrumb, CounterIdosos },
    data: function() {
        return {
            unidade: null,
            loading: false,
            usuarios: [],
            usuariosAtivos: [],
            usuariosInativos: [],
            fieldsUsuarios: [ 
                { key: 'link', label: 'nome' },
                { key: 'email', label: 'email' },
                // { key: 'role', label: 'tipo' },
                { key: 'status', label: 'status' },
                { key: 'acoes', label: 'ações' },
            ],
            completarCadastroUsuario: {
              nome: '',
              id: '',
              email: '',
              emailState: null,
              emailInvalidFeedback: '',
            },
            qtdIdosos: 0,
        }
    },
    computed: {
        baseApiUrl() { return baseApiUrl },
        ...mapState(['syncStatus', 'user'])
      },
    methods: {
        loadUnidade() {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.id}`;
            console.log(url);

            axios.get(url).then(res => {
                this.unidade = res.data
                console.log(this.unidade)
                this.countIdososByUnidade();
            }).catch(showError)
        },
        countIdososByUnidade() {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.id}/idosos/count`;
            console.log(url);

            axios.get(url).then(res => {
                this.qtdIdosos = res.data
            }).catch(showError)
        },
        loadUsuarios() {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.id}/usuarios`;
            console.log(url);

            axios.get(url).then(res => {
                this.usuarios = res.data
                this.usuariosAtivos = res.data.filter((user) => user.status === 'ATIVO')
                this.usuariosInativos = res.data.filter((user) => user.status != 'ATIVO')
                console.log(this.usuarios)
            }).catch(showError)
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
        toggleStatus(e) {

          console.log(JSON.stringify(this.unidade));
          const url = `${baseApiUrl}/v2/unidades`;
          console.log(url, e);

          axios.post(url, this.unidade).then(res => {
              console.log(res)
              // this.$router.push({ name: 'unidade', params: { id: res.data } })
              this.$toasted.global.defaultSuccess({msg: 'Status da unidade alterado com sucesso!'});
          }).catch(showError)
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
        importFromPlanilhaUnidade() {
          // $socket is socket.io-client instance
          console.log('emit importUnidadeEvent')
          this.$socket.emit('importUnidadeEvent', { idUnidade: this.unidade._id });
        },
        manualReset() {
          // $socket is socket.io-client instance
          console.log('emit resetEvent')
          this.$socket.emit('resetEvent', { idUnidade: this.unidade._id });
        },
        resendInvite(userId) {
            const url = `${baseApiUrl}/v2/usuarios/resendInvitation/${userId}`;
            console.log(url);

            axios.post(url).then( (res) => {
                console.log(res)
                this.$toasted.global.defaultSuccess({msg: res.data});
            }).catch(showError)
        },
        modalCompletarCadastroUsuarioReset() {
          this.completarCadastroUsuario.id = '';
          this.completarCadastroUsuario.nome = '';
          this.completarCadastroUsuario.email = '';
          this.completarCadastroUsuario.emailState = null;
        },
        openModalCompletarCadastroUsuario(user) {
            this.completarCadastroUsuario.id = user._id;
            this.completarCadastroUsuario.nome = user.name;
            this.completarCadastroUsuario.email = user.email;
            this.$bvModal.show('modal-completar-cadastro-usuario');
        },
        modalCompletarCadastroUsuarioHandleSubmit() {
          // Exit when the form isn't valid
          this.completarCadastroUsuario.emailState = this.$refs.form.checkValidity();
          if (!this.completarCadastroUsuario.emailState) {
            return
          }

          //requisição para API
          const url = `${baseApiUrl}/v2/usuarios/${this.completarCadastroUsuario.id}/completar`;
          console.log(url);

          axios.post(url, { email: this.completarCadastroUsuario.email }).then( (res) => {
              // console.log(res)
              this.$toasted.global.defaultSuccess({msg: res.data});

              this.loadUsuarios();

              // Hide the modal manually
              this.$nextTick(() => {
                this.$bvModal.hide('modal-completar-cadastro-usuario');
              })
          }).catch(e => {
            if(e && e.response && e.response.data) {
              this.completarCadastroUsuario.emailState = false;
              this.completarCadastroUsuario.emailInvalidFeedback = e.response.data;
            } else {
              showError(e);
            }
          })
        },
        modalCompletarCadastroUsuarioHandleOk(bvModalEvt) {
          // // Prevent modal from closing
          bvModalEvt.preventDefault();
          // // Trigger submit handler
          this.modalCompletarCadastroUsuarioHandleSubmit();
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
        download() {
          console.log('download')
          const url = `${baseApiUrl}/v2/unidades/${this.$route.params.id}/exportacao`;
            console.log(url);

            axios.get(url).then(res => {
                console.log(res.data)
            }).catch(showError)
        }
    },
    mounted() {
      this.loadUnidade();
      this.loadUsuarios();
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
  .card .card-subtitle {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 18px;
    margin: 28px 0;
    opacity: .85;
  }
</style>