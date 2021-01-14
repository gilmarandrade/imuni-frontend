<!-- Vigilante ou Preceptor Home -->
<template>
    <div class="listaIdosos" v-if="unidade">
        <Breadcrumb :path="[{text:'Dashboard', url:'/'}, {text: 'Meus idosos'}]" />
        <!-- <div v-if="unidade"> -->
            <!-- <div v-if="unidade.lastSyncDate" class="sync-state" :class="{ 'ativo' : unidade.autoSync }">
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
            </div> -->
            <!-- <h1>{{ unidade.nome }}</h1>
            <p>Distrito {{ unidade.distrito }}</p> -->
        <!-- </div> -->

        <h5>{{ unidade.nome }}</h5>
        <h1>Meus Idosos</h1>
        <!-- <button @click="manualSync" class="btn btn-outline-primary mb-4" :disabled="syncStatus.status==='LOADING'">sincronizar agora</button> -->
        <!-- <a disabled v-if="user.role === 'VIGILANTE'" class="btn btn-primary mb-4 ml-3" :href="`https://google.com?`" target="_blank">Novo atendimento</a> -->


         <b-tabs content-class="mt-3" v-model="tabIndex" v-on:activate-tab="tabActivated">
            <b-tab title="Com escalas" lazy>
                <TableIdosos :unidadeId="user.unidadeId" :userId="user.id" filter="com-escalas" :orderBy="user.role == 'VIGILANTE' ? 'proximo-atendimento' : 'score'"></TableIdosos>
            </b-tab>
            <b-tab title="Sem escalas" lazy>
                <TableIdosos :unidadeId="user.unidadeId" :userId="user.id" filter="sem-escalas" :orderBy="user.role == 'VIGILANTE' ? 'proximo-atendimento' : 'score'"></TableIdosos>
            </b-tab>
            <b-tab title="Todos" lazy>
                <TableIdosos :unidadeId="user.unidadeId" :userId="user.id" filter="all" :orderBy="user.role == 'VIGILANTE' ? 'proximo-atendimento' : 'score'"></TableIdosos>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
// import Badge from '@/components/template/Badge';
import TableIdosos from '@/components/includes/TableIdosos';
import Breadcrumb from '@/components/includes/Breadcrumb';
// import { userKey } from '@/global';
import { mapState } from 'vuex';

export default {
    name: 'VigilanteHome',
    components: { TableIdosos, Breadcrumb },
    computed: mapState(['user', 'syncStatus']),
    data: function() {
        return {
            carregando: true,
            unidade: null,
            tabIndex: 0,
            tabs: ['com-escalas', 'sem-escalas', 'todos']
        }
    },
    methods: {
        loadUnidade() {
            const url = `${baseApiUrl}/v2/unidades/${this.user.unidadeId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.unidade = res.data
                console.log(this.unidade)
            }).catch(showError)
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
        manualSync() {
          // $socket is socket.io-client instance
          // TODO SONFTSYNC NÃO EXISTE MAIS
          console.log('emit softSyncEvent')
          if(this.user.role === 'VIGILANTE') {
              this.$socket.emit('softSyncEvent', { idUnidade: this.user.unidadeId, nomeVigilante: this.user.name });
          } else {
              this.$socket.emit('softSyncEvent', { idUnidade: this.user.unidadeId });
          }
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
        this.loadUnidade();
    }
}
</script>

<style>

  .listaIdosos .sync-state {
    margin: 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.54);
  }

  .listaIdosos .sync-state.ativo {
    color: #27AE60;
  }

</style>