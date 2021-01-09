<template>
    <div class="tableIdosos">
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
                    <router-link :to="'/unidades/'+data.item.unidadeId+'/idosos/'+ data.item._id">{{ data.item.nome }}</router-link>
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
                <div class="group-col" >
                    <section>
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
                    </section>
                    <div class="table-actions ml-2" >
                        <a class="btn btn-light" target="_blank" title="Novo atendimento" 
                            :href="novoAtendimentoURL(data.item, user)">
                            <font-awesome-icon :icon="['fas', 'comment-medical']" />
                        </a>
                    </div>
                    <div class="table-actions ml-2" v-if="user.role == 'ADMINISTRADOR'">
                        <b-dropdown right no-caret variant="light" title="Opções">
                            <template #button-content>
                                <font-awesome-icon :icon="['fas', 'ellipsis-v']"  />
                            </template>
                            <b-dropdown-item :href="'/unidades/'+unidadeId+'/cadastrarIdoso?id='+data.item._id">Editar</b-dropdown-item>
                            <b-dropdown-item @click="deleteIdoso(data.item._id)">Excluir</b-dropdown-item>
                        </b-dropdown>
                    </div>
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
import { baseApiUrl, showError, novoAtendimentoURL, formatDate } from '@/global';
import axios from 'axios';
import Badge from '@/components/template/Badge';
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';
import { mapState } from 'vuex';

export default {
    name: 'TableIdosos',
    props: ['unidadeId', 'userId', 'filter', 'orderBy'],
    components: { Badge, 'popper': Popper },
    computed: mapState(['pageParamsMap', 'user']),
    data: function() {
        return {
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
        novoAtendimentoURL,
        formatDate,
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
                console.log(res.data);
            }).catch(function(e) {console.error(e);showError(e)})
        },
        deleteIdoso(id) {
          this.$bvModal.msgBoxConfirm('Deseja realmente excluir o idoso? Todos os dados serão perdidos!', {
            okVariant: 'danger',
            okTitle: 'excluir',
            cancelTitle: 'cancelar',
          })
            .then(value => {
              console.log(value);
              if(value === true) {
                  const url = `${baseApiUrl}/v2/idosos/${id}`;
                  console.log(url);

                  axios.delete(url).then(res => {
                      console.log(res)
                      this.$toasted.global.defaultSuccess({ msg: 'Idoso removido com sucesso'});
                      this.loadIdosos();
                  }).catch(showError)
              }
            })
            .catch(err => {
              // An error occurred
              console.error(err.toString())
            })
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

    .tableIdosos {
        /* position: relative; */
    }

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

    .tableIdosos .table-actions {
        /* float: right; */
        /* position: absolute; */
        /* right: 0; */
    }

    .tableIdosos .group-col {
        display: flex;
        /* background: red; */
        justify-content: flex-end;
    }
</style>