<template>
    <div class="listaIdosos">
        <h6>{{ user.nomeUnidade }} / {{ user.name }}</h6>
        <h1>Meus Idosos ({{idosos.length}})</h1> <span v-if="carregando">Carregando...</span>
        <b-table :items="idosos" :fields="fields">
            <template v-slot:cell(col-1)="data">
                <div>
                    <b>{{ data.item.nome }}</b>
                </div>
                <div class="badges" v-if="data.item.stats.ultimaEscala">
                     <popper v-if="data.item.stats.ultimaEscala.vulnerabilidade"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Escala de Vulnerabilidade
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.stats.ultimaEscala.vulnerabilidade" />
                        </span>
                    </popper>
                    <popper v-if="data.item.stats.ultimaEscala.epidemiologica"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Escala Epidemiológica
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.stats.ultimaEscala.epidemiologica" />
                        </span>
                    </popper>
                    <popper v-if="data.item.stats.ultimaEscala.riscoContagio"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Risco de Contágio por COVID-19
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.stats.ultimaEscala.riscoContagio" />
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
                                <i class="fas fa-headset"></i> {{ data.item.stats.qtdAtendimentosEfetuados }}/{{ data.item.stats.qtdAtendimentosEfetuados + data.item.stats.qtdAtendimentosNaoEfetuados }}
                            </span>
                        </popper>
                    </span>

                    <span class="statusUltimoAtendimento" v-if="data.item.stats.ultimoAtendimento" :class="{ 'atendido' : data.item.stats.ultimoAtendimento.efetuado }">
                        <popper
                            trigger="hover"
                            :options="{
                             placement: 'top',
                             modifiers: { offset: { offset: '0,10px' } }
                            }">
                            <div class="popper">
                               Último atendimento: 
                               <span v-if="data.item.stats.ultimoAtendimento.efetuado">Ligação atendida</span>
                               <span v-if="!data.item.stats.ultimoAtendimento.efetuado">Não atendeu a ligação</span>
                            </div>

                            <span slot="reference">
                                <i class="far fa-check-circle" v-show="data.item.stats.ultimoAtendimento.efetuado"></i>
                                <i class="far fa-times-circle" v-show="!data.item.stats.ultimoAtendimento.efetuado"></i>
                                {{ formatDate(data.item.stats.ultimoAtendimento.data) }}
                            </span>
                        </popper>
                    </span>

                    <span class="statusUltimoAtendimento atencao" v-if="!data.item.stats.ultimoAtendimento">
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

                    <span class="dataProximoAtendimento" v-if="data.item.stats.ultimaEscala && data.item.stats.ultimaEscala.dataProximoAtendimento">
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
                                <i class="far fa-clock"></i> {{ formatDate(data.item.stats.ultimaEscala.dataProximoAtendimento) }}
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
    computed: mapState(['user']),
    data: function() {
        return {
            carregando: true,
            idosos: [],
            fields: [ 
                { key: 'score', label: 'Score' },
                { key: 'col-1', label: 'Idoso' },
                { key: 'col-2', label: ' ' },
            ],
        }
    },
    methods: {
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
    },
    mounted() {
        this.loadIdosos();
    }
}
</script>

<style>
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