<template>
    <div class="idososPorVigilante">
        <h6>{{ $route.params.unidadeNome }} / {{ $route.params.nome }}</h6>

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

        <h1>Meus Idosos</h1>
        <button @click="manualSync" class="btn btn-primary mb-2" :disabled="syncStatus.isSyncing">sincronizar agora</button>


        <b-tabs content-class="mt-3">
            <b-tab title="Com escalas" active lazy>
                <TableIdosos :collectionPrefix="$route.params.unidadePrefix" :userId="$route.params.usuarioId" filter="com-escalas" orderBy="score"></TableIdosos>
            </b-tab>
            <b-tab title="Sem escalas" lazy>
                <TableIdosos :collectionPrefix="$route.params.unidadePrefix" :userId="$route.params.usuarioId" filter="sem-escalas"  orderBy="score"></TableIdosos>
            </b-tab>
            <b-tab title="Todos" lazy>
                <TableIdosos :collectionPrefix="$route.params.unidadePrefix" :userId="$route.params.usuarioId" filter="all"  orderBy="score"></TableIdosos>
            </b-tab>
        </b-tabs>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import TableIdosos from '@/components/includes/TableIdosos';
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';
import { mapState } from 'vuex';

export default {
    name: 'IdososPorVigilante',
    components: { TableIdosos, 'popper': Popper },
    computed: mapState(['syncStatus']),
    data: function() {
        return {
            carregando: true,
            unidade: null,
        }
    },
    methods: {
        loadUnidade() {
            const url = `${baseApiUrl}/unidades/${this.$route.params.unidadeId}`;
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
          console.log('emit syncEvent')
          this.$socket.emit('syncEvent', { idUnidade: this.$route.params.unidadeId });
        },
    },
    mounted() {
        this.loadUnidade();
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