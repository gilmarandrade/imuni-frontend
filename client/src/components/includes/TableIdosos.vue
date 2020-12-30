<template>
    <div class="tableIdosos">
        <pre>

        {{ teste }}
        </pre>
        <b-row align-h="end" class="mb-3" align-v="end">
            <b-col cols="2" class="text-right text-muted">
                {{ tableInfo.totalRows }} resultados
            </b-col>
            <b-col cols="2">
                ordenar por 
                <b-form-select size="sm" v-model="order" :options="sortOptions" @change="loadIdosos(0)"></b-form-select>
            </b-col>
        </b-row>
        <b-table :items="idosos" :fields="fields"  primary-key="_id" :busy="carregando" show-empty>
            <template v-slot:table-busy>
                <div class="text-center text-primary my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong> Carregando...</strong>
                </div>
            </template>
            <template v-slot:empty="">
                <div class="text-center text-muted">Não há registros</div>
            </template>
            <template v-slot:cell(col-1)="data">
                <div>
                    <router-link :to="'/unidades/'+data.item.unidade+'/idosos/'+ data.item._id">{{ data.item.nome }}</router-link>
                </div>
                <div class="badges" v-if="data.item.estatisticas && data.item.estatisticas.ultimaEscala">
                     <popper v-if="data.item.estatisticas.ultimaEscala.vulnerabilidade"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Escala de Vulnerabilidade
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.estatisticas.ultimaEscala.vulnerabilidade" />
                        </span>
                    </popper>
                    <popper v-if="data.item.estatisticas.ultimaEscala.epidemiologica"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Escala Epidemiológica
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.estatisticas.ultimaEscala.epidemiologica" />
                        </span>
                    </popper>
                    <popper v-if="data.item.estatisticas.ultimaEscala.riscoContagio"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Risco de Contágio por COVID-19
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.estatisticas.ultimaEscala.riscoContagio" />
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
                                <font-awesome-icon :icon="['fas', 'headset']"  /> {{ data.item.estatisticas ? data.item.estatisticas.count.qtdAtendimentosEfetuados : 0 }}/{{ (data.item.estatisticas ? data.item.estatisticas.count.qtdTotal : 0) }}
                            </span>
                        </popper>
                    </span>

                    <span class="statusUltimoAtendimento" v-if="data.item.estatisticas && data.item.estatisticas.ultimoAtendimento" :class="{ 'atendido' : data.item.estatisticas.ultimoAtendimento.efetuado }">
                        <popper
                            trigger="hover"
                            :options="{
                             placement: 'top',
                             modifiers: { offset: { offset: '0,10px' } }
                            }">
                            <div class="popper">
                               Último atendimento: 
                                <span v-if="data.item.estatisticas.ultimoAtendimento.efetuado">Ligação atendida</span>
                                <span v-if="!data.item.estatisticas.ultimoAtendimento.efetuado">Não atendeu a ligação</span>
                            </div>

                            <span slot="reference">
                                <span v-show="data.item.estatisticas.ultimoAtendimento.efetuado">
                                    <font-awesome-icon :icon="['far', 'check-circle']"  />
                                </span>
                                <span v-show="!data.item.estatisticas.ultimoAtendimento.efetuado">
                                    <font-awesome-icon :icon="['far', 'times-circle']" />
                                </span>
                                {{ formatDate(data.item.estatisticas.ultimoAtendimento.timestamp) }}
                            </span>
                        </popper>
                    </span>

                    <span class="statusUltimoAtendimento atencao" v-show="!data.item.estatisticas || !data.item.estatisticas.ultimoAtendimento">
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

                    <span class="dataProximoAtendimento" v-if="data.item.estatisticas && data.item.estatisticas.ultimaEscala && data.item.estatisticas.ultimaEscala.dataProximoAtendimento">
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
                                <font-awesome-icon :icon="['far', 'clock']" /> {{ formatDate(data.item.estatisticas.ultimaEscala.dataProximoAtendimento) }}
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

        <div class="pagination">
            <b-button-group>
                <button class="prev btn btn-light" 
                    :disabled="tableInfo.currentPage == 0" 
                    @click="loadIdosos(tableInfo.currentPage - 1)">&lt;</button>
                <button class="btn btn-light"
                        :class="{ 'current' : n == tableInfo.currentPage + 1 }" 
                        v-for="n in Math.ceil(tableInfo.totalRows / tableInfo.rowsPerPage)" :key="n"
                        @click="loadIdosos(n - 1)">{{ n }} </button>
                <button class="next btn btn-light" 
                    :disabled="tableInfo.currentPage + 1 >= Math.ceil(tableInfo.totalRows / tableInfo.rowsPerPage)"
                    @click="loadIdosos(tableInfo.currentPage + 1)">&gt;</button>
            </b-button-group>
        </div>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Badge from '@/components/template/Badge';
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';
import { mapState } from 'vuex';

export default {
    name: 'TableIdosos',
    props: ['unidadeId', 'userId', 'filter', 'orderBy'],
    components: { Badge, 'popper': Popper },
    computed: mapState(['pageParamsMap']),
    data: function() {
        return {
            teste: null,
            carregando: true,
            unidade: null,
            order: this.orderBy,// por padrão ele aplica a ordem recebida como parâmetro do componente
            sortOptions: [ 
                { value: 'nome', text: 'Nome' },
                { value: 'proximo-atendimento', text: 'Próximo atendimento' },
                { value: 'score', text: 'Score' },
                { value: 'ultimo-atendimento', text: 'Último atendimento' },
            ],
            tableInfo: {
                totalRows: 0,
                currentPage: 0,// por padrão é 0
                rowsPerPage: 25,// por padrao é 25
            },
            idosos: [],
            fields: [ 
                { key: 'estatisticas.ultimaEscala.scoreOrdenacao', label: 'Score' },
                { key: 'col-1', label: 'Idoso' },
                { key: 'col-2', label: ' ' },
            ],
        }
    },
    methods: {
        loadIdosos(page) {
            this.carregando = true;
            
            this.$store.commit('setPageParamsMap', 
                {
                    userId: this.userId,
                    filter: this.filter,
                    order: this.order,
                    page: page,
                    rowsPerPage: this.tableInfo.rowsPerPage,
                }
            )
          
            let url;
            // se o vigilante ainda não possui um usuario cadastrado, busca os idosos pelo nome do vigilante
            // if(this.userId != 'undefined') {
            url = `${baseApiUrl}/v2/unidades/${this.unidadeId}/usuarios/${this.userId}/idosos?filter=${this.filter}&sort=${this.order}&page=${page}&rowsPerPage=${this.tableInfo.rowsPerPage}`;
            // } else if(this.vigilanteNome) {
            //     console.log('vigilanteNome', this.vigilanteNome)
            //     url = `${baseApiUrl}/unidades/${this.unidadeId}/vigilantes/${this.vigilanteNome}/idosos?filter=${this.filter}&sort=${this.order}&page=${page}&rowsPerPage=${this.tableInfo.rowsPerPage}`;
            // }
            console.log(url);
            axios.get(url).then(res => {
                this.tableInfo =  res.data.info;
                this.idosos = res.data.data;
                this.carregando = false;
                this.teste = res.data
                console.log(res.data);
            }).catch(function(e) {console.error(e);showError(e)})
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
    },
    mounted() {
        let page = 0;
        const userParams = this.$store.state.pageParamsMap.get(this.userId);
        if(userParams) {
            const tableParams = userParams.find(element => element.filter == this.filter);
            if(tableParams) {
                this.order = tableParams.order;
                this.tableInfo.rowsPerPage = tableParams.rowsPerPage;
                this.tableInfo.currentPage = tableParams.page;
                page = tableParams.page;
            }
        }
        this.loadIdosos(page);
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

    .tableIdosos .pagination {
        display: flex;
        justify-content: center;
    }

    .tableIdosos .pagination .current {
        background: #49a7c1;
        color: white;
        pointer-events: none;
    }
</style>