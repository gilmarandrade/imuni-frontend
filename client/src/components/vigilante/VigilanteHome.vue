<template>
    <div class="listaIdosos">
        <h6>{{ user.nomeUnidade }} / {{ user.name }}</h6>

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
                    <i class="fas fa-sync"></i> {{ formatDate(unidade.lastSyncDate) }}
                </span>
            </popper>
            </div>
            <!-- <h1>{{ unidade.nome }}</h1>
            <p>Distrito {{ unidade.distrito }}</p> -->
        </div>

        <h1>Meus Idosos ({{idosos.length}})</h1>
        <button @click="manualSync" class="btn btn-primary mb-2" :disabled="syncStatus.isSyncing">sincronizar agora</button>
        <div v-if="carregando">Carregando...</div>
        <b-table :items="idosos" :fields="fields">
            <template v-slot:cell(col-1)="data">
                <div>
                    <b>{{ data.item.nome }}</b>
                </div>
                <div class="badges" v-if="data.item.ultimaEscala">
                     <popper v-if="data.item.ultimaEscala.vulnerabilidade"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Escala de Vulnerabilidade
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.ultimaEscala.vulnerabilidade" />
                        </span>
                    </popper>
                    <popper v-if="data.item.ultimaEscala.epidemiologica"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Escala Epidemiológica
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.ultimaEscala.epidemiologica" />
                        </span>
                    </popper>
                    <popper v-if="data.item.ultimaEscala.riscoContagio"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Risco de Contágio por COVID-19
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.ultimaEscala.riscoContagio" />
                        </span>
                    </popper>
                </div>
            </template>
            <template v-slot:cell(col-2)="data">
                <div class="statusAtendimentos">
                    <span>
                        <popper
                            trigger="hover"
                            :options="{
                             placement: 'top',
                             modifiers: { offset: { offset: '0,10px' } }
                            }">
                            <div class="popper">
                               Atendimentos efetuados / total de tentativas
                            </div>

                            <span slot="reference">
                                <i class="fas fa-headset"></i> {{ data.item.ultimaEscala ? data.item.ultimaEscala.qtdAtendimentosEfetuados : 0 }}/{{ (data.item.ultimoAtendimento ? data.item.ultimoAtendimento.qtdTentativas : 0) }}
                            </span>
                        </popper>
                    </span>

                    <span class="statusUltimoAtendimento" v-if="data.item.ultimoAtendimento" :class="{ 'atendido' : data.item.ultimoAtendimento.efetuado }">
                        <popper
                            trigger="hover"
                            :options="{
                             placement: 'top',
                             modifiers: { offset: { offset: '0,10px' } }
                            }">
                            <div class="popper">
                               Último atendimento: 
                               <span v-if="data.item.ultimoAtendimento.efetuado">Ligação atendida</span>
                               <span v-if="!data.item.ultimoAtendimento.efetuado">Não atendeu a ligação</span>
                            </div>

                            <span slot="reference">
                                <i class="far fa-check-circle" v-show="data.item.ultimoAtendimento.efetuado"></i>
                                <i class="far fa-times-circle" v-show="!data.item.ultimoAtendimento.efetuado"></i>
                                {{ formatDate(data.item.ultimoAtendimento.data) }}
                            </span>
                        </popper>
                    </span>

                    <span class="statusUltimoAtendimento atencao" v-if="!data.item.ultimoAtendimento">
                        <popper
                            trigger="hover"
                            :options="{
                             placement: 'top',
                             modifiers: { offset: { offset: '0,10px' } }
                            }">
                            <div class="popper">
                               Último atendimento: não há registros
                            </div>

                            <span slot="reference">
                                <i class="fas fa-exclamation-circle"></i> pendente
                            </span>
                        </popper>
                    </span>

                    <span class="dataProximoAtendimento" v-if="data.item.ultimaEscala && data.item.ultimaEscala.dataProximoAtendimento">
                        <popper
                            trigger="hover"
                            :options="{
                             placement: 'top',
                             modifiers: { offset: { offset: '0,10px' } }
                            }">
                            <div class="popper">
                               Sugestão de próximo atendimento
                            </div>

                            <span slot="reference">
                                <i class="far fa-clock"></i> {{ formatDate(data.item.ultimaEscala.dataProximoAtendimento) }}
                            </span>
                        </popper>
                    </span>
                </div>
                <div>
                    Telefones: {{ data.item.telefone1 }} {{ data.item.telefone2 }}
                </div>
          </template>
        </b-table>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Badge from '@/components/template/Badge';
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';
// import { userKey } from '@/global';
import { mapState } from 'vuex';

export default {
    name: 'VigilanteHome',
    components: { Badge, 'popper': Popper },
    computed: mapState(['user', 'syncStatus']),
    data: function() {
        return {
            carregando: true,
            unidade: null,
            idosos: [],
            fields: [ 
                { key: 'ultimaEscala.score', label: 'Score' },
                { key: 'col-1', label: 'Idoso' },
                { key: 'col-2', label: ' ' },
            ],
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
        loadIdosos() {
            const url = `${baseApiUrl}/unidades/${this.user.collectionPrefix}/vigilantes/${this.user.name}/idosos`;
            console.log(url);
            axios.get(url).then(res => {
                this.idosos = res.data;
                console.log(this.idosos)
                this.carregando = false;
            }).catch(showError)
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
        manualSync() {
          // $socket is socket.io-client instance
          console.log('emit syncEvent')
          this.$socket.emit('syncEvent', { idUnidade: this.user.unidadeId });
        },
    },
    mounted() {
        this.loadIdosos();
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

    /* table thead {
        display: none;
    } */

    .listaIdosos td:nth-child(1){
        /* background: red; */
        width: 10%;
    }

    .listaIdosos td:nth-child(2) {
        /* background: red; */
        width: 50%;
    }

    .listaIdosos td:nth-child(3) {
        text-align: right;
        /* background: blue; */
        width: 40%;
    }

    .listaIdosos .badges .badge {
        margin-right: 8px;
    }

    .listaIdosos .statusAtendimentos > span {
        margin-left: 15px;
    }

    .listaIdosos .statusUltimoAtendimento {
        /* background: red; */
        color: rgb(235, 87, 87);
    }

    .listaIdosos .statusUltimoAtendimento.atendido {
        color: rgb(39, 174, 96);
    }

    .listaIdosos .statusUltimoAtendimento.atencao {
        /* background: yellow; */
        color: rgb(235, 87, 87);
    }

    .listaIdosos .dataProximoAtendimento {
        /* background: blue; */
    }

    .listaIdosos .dataProximoAtendimento.atencao {
        color: rgb(235, 87, 87);
    }

</style>