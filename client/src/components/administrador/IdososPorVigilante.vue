<template>
    <div class="idososPorVigilante">
        <h6>{{ $route.params.unidadeNome }} / {{ $route.params.vigilanteNome }}</h6>
        <h1>Meus Idosos ({{idosos.length}})</h1> <span v-if="carregando">Carregando...</span>

        <b-row align-h="end" class="mb-3">
            <b-col cols="2">
                ordenar por 
                <b-form-select size="sm" v-model="orderBy" :options="sortOptions" @change="loadIdosos"></b-form-select>
            </b-col>
        </b-row>

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
                    <span v-else>
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
                                <i class="far fa-clock"></i> Não definido
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

export default {
    name: 'IdososPorVigilante',
    components: { Badge, 'popper': Popper },
    data: function() {
        return {
            carregando: true,
            orderBy: 'proximo-atendimento',
            sortOptions: [ 
                { value: 'score', text: 'Score' },
                { value: 'ultimo-atendimento', text: 'Último atendimento' },
                { value: 'proximo-atendimento', text: 'Próximo atendimento' },
                { value: 'nome', text: 'Nome' },
            ],
            idosos: [],
            fields: [ 
                { key: 'ultimaEscala.score', label: 'Score' },
                { key: 'col-1', label: 'Idoso' },
                { key: 'col-2', label: ' ' },
            ],
        }
    },
    methods: {
        loadIdosos() {
            const url = `${baseApiUrl}/unidades/${this.$route.params.unidadePrefix}/vigilantes/${this.$route.params.vigilanteNome}/idosos?sort=${this.orderBy}`;
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