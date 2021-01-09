<template>
<!-- TODO Renomear componente para IdososPorUsuario-->
    <div class="idososPorVigilante" v-if="unidade">
        <Breadcrumb :path="[{text:'Dashboard', url:'/'}, {text: 'Unidades', url: '/unidades'}, {text: unidade.nome, url: `/unidades/${unidade._id}`}, {text: 'Idosos'}]" />
        <!-- <Breadcrumb :path="[{text: 'Unidades', url: '/unidades'}, {text: unidade.nome, url: `/unidades/${unidade._id}`}, {text: 'Idosos', url: `/unidades/${unidade.nome}/${unidade._id}/usuarios/${$route.params.usuarioId}/${$route.params.nome}/com-escalas`}]" /> -->

         <!-- <div v-if="unidade">
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
                    <font-awesome-icon :icon="['fas', 'sync']" /> {{ formatDate(unidade.lastSyncDate) }}
                </span>
            </popper>
            </div>
            <h1>{{ unidade.nome }}</h1>
            <p>Distrito {{ unidade.distrito }}</p>
        </div> -->

        <h5>{{ unidade.nome }}</h5>
        <h1 v-if="usuario">Idosos de {{ usuario.name }}</h1>
        <button @click="manualSync" class="btn btn-secondary mb-2" :disabled="syncStatus.status==='LOADING'">sincronizar agora</button>
        <router-link :to="'/unidades/'+unidade._id+'/cadastrarIdoso'" class="btn btn-primary float-right">cadastrar</router-link>
        <b-tabs content-class="mt-3" v-model="tabIndex" v-on:activate-tab="tabActivated">
            <b-tab title="Com escalas" lazy>
                <TableIdosos :unidadeId="$route.params.unidadeId" :userId="$route.params.usuarioId" filter="com-escalas" orderBy="score"></TableIdosos>
            </b-tab>
            <b-tab title="Sem escalas" lazy>
                <TableIdosos :unidadeId="$route.params.unidadeId" :userId="$route.params.usuarioId" filter="sem-escalas"  orderBy="score"></TableIdosos>
            </b-tab>
            <b-tab title="Todos" lazy>
                <TableIdosos :unidadeId="$route.params.unidadeId" :userId="$route.params.usuarioId" filter="all"  orderBy="score"></TableIdosos>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script>
import { baseApiUrl, showError, formatDate } from '@/global';
import axios from 'axios';
import TableIdosos from '@/components/includes/TableIdosos';
import Breadcrumb from '@/components/includes/Breadcrumb';
// import Popper from 'vue-popperjs';
// import 'vue-popperjs/dist/vue-popper.css';
import { mapState } from 'vuex';

export default {
    name: 'IdososPorVigilante',
    components: { TableIdosos, Breadcrumb },
    computed: mapState(['syncStatus']),
    data: function() {
        return {
            carregando: true,
            unidade: null,
            usuario: null,
            tabIndex: 0,
            tabs: ['com-escalas', 'sem-escalas', 'todos']
        }
    },
    methods: {
        formatDate,
        loadUnidade() {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.unidade = res.data
                console.log(this.unidade)
            }).catch(showError)
        },
        loadUsuario() {
            const url = `${baseApiUrl}/v2/names/usuarios/${this.$route.params.usuarioId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.usuario = res.data
            }).catch(showError)
        },
        manualSync() {
          // $socket is socket.io-client instance
          console.log('emit syncEvent')
          this.$socket.emit('syncEvent', { idUnidade: this.$route.params.unidadeId });
        },
        tabActivated(newTabIndex, oldTabIndex, event){
            console.log('tab activated',newTabIndex,oldTabIndex, event)
            console.log(location.search)
            const params = this.$route.params;
            params.tab = this.tabs[newTabIndex];
            
            this.$router.replace({name: this.$route.name, params: params })
        }
    },
    mounted() {
        this.tabIndex = this.tabs.findIndex(tab => tab === this.$route.params.tab)
        // this.tabIndex = +this.$route.params.tab || 0,
        this.loadUnidade();
        this.loadUsuario();
    }
}
</script>

<style>
  .idososPorVigilante .sync-state {
    margin: 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.54);
  }

  .idososPorVigilante .sync-state.ativo {
    color: #27AE60;
  }

    /* table thead {
        display: none;
    } */

    .idososPorVigilante td:nth-child(1){
        /* background: red; */
        width: 10%;
    }
    .idososPorVigilante td:nth-child(2) {
        /* background: red; */
        width: 50%;
    }

    .idososPorVigilante td:nth-child(3) {
        text-align: right;
        /* background: blue; */
        width: 40%;
    }

    .idososPorVigilante .badges .badge {
        margin-right: 8px;
    }

    .idososPorVigilante .statusAtendimentos > span {
        margin-left: 15px;
    }

    .idososPorVigilante .statusUltimoAtendimento {
        /* background: red; */
        color: rgb(235, 87, 87);
    }

    .idososPorVigilante .statusUltimoAtendimento.atendido {
        color: rgb(39, 174, 96);
    }

    .idososPorVigilante .statusUltimoAtendimento.atencao {
        /* background: yellow; */
        color: rgb(235, 87, 87);
    }

    .idososPorVigilante .dataProximoAtendimento {
        /* background: blue; */
    }

    .idososPorVigilante .dataProximoAtendimento.atencao {
        color: rgb(235, 87, 87);
    }

</style>