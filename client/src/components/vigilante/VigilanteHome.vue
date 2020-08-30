<template>
    <div class="listaIdosos">
        <h6><router-link :to="'/'">Home</router-link></h6>

        <div v-if="unidade">
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
            <!-- <h1>{{ unidade.nome }}</h1>
            <p>Distrito {{ unidade.distrito }}</p> -->
        </div>

        <h5>{{ user.nomeUnidade }}</h5>
        <h1>Meus Idosos</h1>
        <button @click="manualSync" class="btn btn-outline-primary mb-4" :disabled="syncStatus.status==='LOADING'">sincronizar agora</button>
        <a v-if="unidade && user.role === 'VIGILANTE' || user.role === 'ADMINISTRADOR'" class="btn btn-primary mb-4 ml-3" :href="`https://docs.google.com/forms/d/${unidade.idFichaVigilancia}/edit?usp=sharing`" target="_blank">Novo atendimento</a>


         <b-tabs content-class="mt-3">
            <b-tab title="Com escalas" active lazy>
                <TableIdosos :collectionPrefix="user.collectionPrefix" :userId="user.id" filter="com-escalas" :orderBy="user.role == 'VIGILANTE' ? 'proximo-atendimento' : 'score'"></TableIdosos>
            </b-tab>
            <b-tab title="Sem escalas" lazy>
                <TableIdosos :collectionPrefix="user.collectionPrefix" :userId="user.id" filter="sem-escalas" :orderBy="user.role == 'VIGILANTE' ? 'proximo-atendimento' : 'score'"></TableIdosos>
            </b-tab>
            <b-tab title="Todos" lazy>
                <TableIdosos :collectionPrefix="user.collectionPrefix" :userId="user.id" filter="all" :orderBy="user.role == 'VIGILANTE' ? 'proximo-atendimento' : 'score'"></TableIdosos>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
// import Badge from '@/components/template/Badge';
import TableIdosos from '@/components/includes/TableIdosos';
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';
// import { userKey } from '@/global';
import { mapState } from 'vuex';

export default {
    name: 'VigilanteHome',
    components: { TableIdosos, 'popper': Popper },
    computed: mapState(['user', 'syncStatus']),
    data: function() {
        return {
            carregando: true,
            unidade: null,
        }
    },
    methods: {
        loadUnidade() {
            const url = `${baseApiUrl}/unidades/${this.user.unidadeId}`;
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
          console.log('emit softSyncEvent')
          if(this.user.role === 'VIGILANTE') {
              this.$socket.emit('softSyncEvent', { idUnidade: this.user.unidadeId, nomeVigilante: this.user.name });
          } else {
              this.$socket.emit('softSyncEvent', { idUnidade: this.user.unidadeId });
          }
        },
    },
    mounted() {
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