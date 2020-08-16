<template>
    <div class="tableIdosos">
        <div v-if="carregando">Carregando...</div>

        <b-row align-h="end" class="mb-3" align-v="end">
            <b-col cols="2" class="text-right text-muted">
                {{ idosos.length }} resultados
            </b-col>
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
                                <font-awesome-icon :icon="['fas', 'headset']"  /> {{ data.item.ultimaEscala ? data.item.ultimaEscala.qtdAtendimentosEfetuados : 0 }}/{{ (data.item.ultimoAtendimento ? data.item.ultimoAtendimento.qtdTentativas : 0) }}
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
                                <span v-show="data.item.ultimoAtendimento.efetuado">
                                    <font-awesome-icon :icon="['far', 'check-circle']"  />
                                </span>
                                <span v-show="!data.item.ultimoAtendimento.efetuado">
                                    <font-awesome-icon :icon="['far', 'times-circle']" />
                                </span>
                                {{ formatDate(data.item.ultimoAtendimento.data) }}
                            </span>
                        </popper>
                    </span>

                    <span class="statusUltimoAtendimento atencao" v-show="!data.item.ultimoAtendimento">
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
                                <font-awesome-icon :icon="['fas', 'exclamation-circle']" /> pendente
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
                                <font-awesome-icon :icon="['far', 'clock']" /> {{ formatDate(data.item.ultimaEscala.dataProximoAtendimento) }}
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
                                <font-awesome-icon :icon="['far', 'clock']" /> Não definido
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
    name: 'TableIdosos',
    props: ['collectionPrefix', 'vigilanteNome', 'userId', 'filter', 'orderBy'],
    components: { Badge, 'popper': Popper },
    data: function() {
        return {
            carregando: true,
            unidade: null,
            sortOptions: [ 
                { value: 'nome', text: 'Nome' },
                { value: 'proximo-atendimento', text: 'Próximo atendimento' },
                { value: 'score', text: 'Score' },
                { value: 'ultimo-atendimento', text: 'Último atendimento' },
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
            let url;
            // se o vigilante ainda não possui um usuario cadastrado, busca os idosos pelo nome do vigilante
            if(this.userId != 'undefined') {
                console.log('user id', this.userId)
                url = `${baseApiUrl}/unidades/${this.collectionPrefix}/usuarios/${this.userId}/idosos?filter=${this.filter}&sort=${this.orderBy}`;
            } else if(this.vigilanteNome) {
                console.log('vigilanteNome', this.vigilanteNome)
                url = `${baseApiUrl}/unidades/${this.collectionPrefix}/vigilantes/${this.vigilanteNome}/idosos?filter=${this.filter}&sort=${this.orderBy}`;
            }
            console.log(url);
            axios.get(url).then(res => {
                this.idosos = res.data;
                console.log(this.idosos)
                this.carregando = false;
            }).catch(function(e) {console.error(e);showError(e)})
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

    .tableIdosos td:nth-child(1){
        /* background: red; */
        width: 10%;
    }

    .tableIdosos td:nth-child(2) {
        /* background: red; */
        width: 50%;
    }

    .tableIdosos td:nth-child(3) {
        text-align: right;
        /* background: blue; */
        width: 40%;
    }

    .tableIdosos .badges .badge {
        margin-right: 8px;
    }

    .tableIdosos .statusAtendimentos > span {
        margin-left: 15px;
    }

    .tableIdosos .statusUltimoAtendimento {
        /* background: red; */
        color: rgb(235, 87, 87);
    }

    .tableIdosos .statusUltimoAtendimento.atendido {
        color: rgb(39, 174, 96);
    }

    .tableIdosos .statusUltimoAtendimento.atencao {
        /* background: yellow; */
        color: rgb(235, 87, 87);
    }

    .tableIdosos .dataProximoAtendimento {
        /* background: blue; */
    }

    .tableIdosos .dataProximoAtendimento.atencao {
        color: rgb(235, 87, 87);
    }

</style>