<template>
    <div class="idoso"  v-if="idoso">
        <h6 v-if="user.role !== 'ADMINISTRADOR'"> <router-link :to="'/'">Home</router-link> / <router-link :to="'/meusIdosos/'">Meus Idosos</router-link></h6>
        <h6 v-if="user.role === 'ADMINISTRADOR'"><router-link :to="'/'">Home</router-link> / <router-link :to="'/unidades'">Unidades</router-link> / {{ idoso.unidadeId }} / {{ idoso.vigilanteId}}</h6>
        <h1>
            {{ idoso.nome }}
        </h1>

        <div class="badges" v-if="idoso.estatisticas && idoso.estatisticas.ultimaEscala">
                <popper v-if="idoso.estatisticas.ultimaEscala.vulnerabilidade"
                trigger="hover"
                :options="{
                    placement: 'top'
                }">
                <div class="popper">
                    Escala de Vulnerabilidade
                </div>

                <span slot="reference">
                    <Badge :value="idoso.estatisticas.ultimaEscala.vulnerabilidade" />
                </span>
            </popper>
            <popper v-if="idoso.estatisticas.ultimaEscala.epidemiologica"
                trigger="hover"
                :options="{
                    placement: 'top'
                }">
                <div class="popper">
                    Escala Epidemiológica
                </div>

                <span slot="reference">
                    <Badge :value="idoso.estatisticas.ultimaEscala.epidemiologica" />
                </span>
            </popper>
            <popper v-if="idoso.estatisticas.ultimaEscala.riscoContagio"
                trigger="hover"
                :options="{
                    placement: 'top'
                }">
                <div class="popper">
                    Risco de Contágio por COVID-19
                </div>

                <span slot="reference">
                    <Badge :value="idoso.estatisticas.ultimaEscala.riscoContagio" />
                </span>
            </popper>
            <small class="text-muted ml-2">Score {{ idoso.estatisticas.ultimaEscala.scoreOrdenacao }}</small>
        </div>
        
        <div class="row mt-4">
            <div class="col">
                <div>
                    <strong>Unidade:</strong> {{ $route.params.unidadeId }} // TODO
                </div>
                <div>
                    <strong>Agente de saúde:</strong> {{ idoso.agenteSaude }} 
                </div>
                <div>
                    <strong>Data de Nascimento:</strong> {{ idoso.dataNascimento }} 
                </div>
                <div>
                    <strong>Telefones:</strong> {{ idoso.telefone1 }} {{ idoso.telefone2 ? '/ ' + idoso.telefone2 : '' }} 
                </div>
            </div>
            <div class="col">
                <div>
                    <strong>Vigilante:</strong> {{ idoso.vigilanteId }} // TODO 
                </div>
                <div>
                    <strong>Atendimentos efetuados:</strong> 
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
                                {{ idoso.estatisticas ? idoso.estatisticas.count.qtdAtendimentosEfetuados : 0 }}/{{ (idoso.estatisticas ? idoso.estatisticas.count.qtdTotal : 0) }}
                            </span>
                        </popper>
                    </span>
                </div>
                <div>
                    <strong>Último atendimento:</strong>
                    <span class="statusUltimoAtendimento" v-if="idoso.estatisticas && idoso.estatisticas.ultimoAtendimento" :class="{ 'atendido' : idoso.estatisticas.ultimoAtendimento.efetuado }">
                        <popper
                            trigger="hover"
                            :options="{
                                placement: 'top',
                                modifiers: { offset: { offset: '0,10px' } }
                            }">
                            <div class="popper">
                                Último atendimento: 
                                <span v-if="idoso.estatisticas.ultimoAtendimento.efetuado">Ligação atendida</span>
                                <span v-if="!idoso.estatisticas.ultimoAtendimento.efetuado">Não atendeu a ligação</span>
                            </div>

                            <span slot="reference">
                                <span v-show="idoso.estatisticas.ultimoAtendimento.efetuado">
                                    <font-awesome-icon :icon="['far', 'check-circle']"  />
                                </span>
                                <span v-show="!idoso.estatisticas.ultimoAtendimento.efetuado">
                                    <font-awesome-icon :icon="['far', 'times-circle']" />
                                </span>
                                {{ formatDate(idoso.estatisticas.ultimoAtendimento.timestamp) }}
                            </span>
                        </popper>
                    </span>

                    <span class="statusUltimoAtendimento atencao" v-show="!idoso.estatisticas || !idoso.estatisticas.ultimoAtendimento">
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
                </div>
                <div>
                    <strong>Sugestão de próximo atendimento:</strong>
                    <span class="dataProximoAtendimento" v-if="idoso.estatisticas && idoso.estatisticas.ultimaEscala">
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
                                <font-awesome-icon :icon="['far', 'clock']" /> {{ formatDate(idoso.estatisticas.ultimaEscala.dataProximoAtendimento) }}
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
            </div>
        </div>
        <div class="row mt-3">
            <div class="col">
                 <div>
                    <strong>Anotações do vigilante:</strong>
                    <p>{{ idoso.anotacoes ? idoso.anotacoes : '-' }}</p>
                </div>
            </div>
        </div>

        <div class="row mt-5 mb-3">
            <div class="col">
                <h2 class="">Histórico de atendimentos</h2>
            </div>
            <div class="col text-right" v-if="user.role == 'VIGILANTE'">
                <a class="btn btn-primary" target="_blank" title="Novo atendimento" 
                    :href="novoAtendimentoURL(idoso, user)">
                    <font-awesome-icon :icon="['fas', 'comment-medical']" /> Novo atendimento
                </a>
            </div>
        </div>

        <b-table :items="atendimentos" :fields="fields" primary-key="_id" :busy="carregandoAtendimentos" show-empty>
            <template v-slot:table-busy>
                <div class="text-center text-primary my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong> Carregando...</strong>
                </div>
            </template>
            <template v-slot:empty="">
                <div class="text-center text-muted">Não há registros</div>
            </template>
            <template v-slot:cell(col-data)="data">
                <router-link :to="'/unidades/'+$route.params.unidadeId+'/atendimentos/'+ data.item._id">
                    {{ formatDate(data.item.timestamp) }}
                </router-link>
            </template>
            <template v-slot:cell(col-status)="data">
                <span class="statusUltimoAtendimento" v-if="data.item.atendeu" :class="{ 'atendido' : data.item.atendeu }">
                    <span v-show="data.item.atendeu">
                        <font-awesome-icon :icon="['far', 'check-circle']"  /> Ligação atendida
                    </span>
                    <span v-show="!data.item.atendeu">
                        <font-awesome-icon :icon="['far', 'times-circle']" /> Ligação não atendida
                    </span>
                </span>
            </template>
            <template v-slot:cell(col-escalas)="data">
                <div class="badges" v-if="data.item.escalas">
                     <popper v-if="data.item.escalas.vulnerabilidade"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Escala de Vulnerabilidade
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.escalas.vulnerabilidade" />
                        </span>
                    </popper>
                    <popper v-if="data.item.escalas.epidemiologica"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Escala Epidemiológica
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.escalas.epidemiologica" />
                        </span>
                    </popper>
                    <popper v-if="data.item.escalas.riscoContagio"
                        trigger="hover"
                        :options="{
                            placement: 'top'
                        }">
                        <div class="popper">
                            Risco de Contágio por COVID-19
                        </div>

                        <span slot="reference">
                            <Badge :value="data.item.escalas.riscoContagio" />
                        </span>
                    </popper>
                </div>
            </template>
        </b-table>
    </div>
</template>

<script>
import { baseApiUrl, showError, novoAtendimentoURL, formatDate } from '@/global';
import axios from 'axios';
import { mapState } from 'vuex';
import Badge from '@/components/template/Badge';
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';

export default {
    name: 'Idoso',
    components: { Badge, 'popper': Popper },
    computed: mapState(['user']),
    data: function() {
        return {
            idoso: null,
            atendimentos: [],
            fields: [ 
                { key: 'col-data', label: 'Data' },
                { key: 'col-status', label: 'Status' },
                { key: 'col-escalas', label: 'Escalas' },
                { key: 'vigilanteId', label: 'Vigilante' },
            ],
            carregandoAtendimentos: false,
        }
    },
    methods: {
        novoAtendimentoURL,
        formatDate,
        loadIdoso() {
            const url = `${baseApiUrl}/v2/idosos/${this.$route.params.idosoId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.idoso = res.data
                console.log(this.idoso);
                this.loadAtendimentos();
            }).catch(showError)
        },
        loadAtendimentos() {
            this.carregandoAtendimentos = true;
            const url = `${baseApiUrl}/v2/idosos/${this.$route.params.idosoId}/atendimentos`;
            console.log(url);

            axios.get(url).then(res => {
                this.atendimentos = res.data
                this.carregandoAtendimentos = false;
                console.log(this.atendimentos)
            }).catch(function(e) {console.error(e);showError(e)})
        },
    },
    mounted() {
      this.loadIdoso();
    }
}
</script>

<style>
    .idoso .statusUltimoAtendimento {
        /* background: red; */
        color: rgb(235, 87, 87);
    }

    .idoso .statusUltimoAtendimento.atendido {
        color: rgb(39, 174, 96);
    }

    .idoso .statusUltimoAtendimento.atencao {
        /* background: yellow; */
        color: rgb(235, 87, 87);
    }

    .idoso .dataProximoAtendimento {
        /* background: blue; */
    }

    .idoso .dataProximoAtendimento.atencao {
        color: rgb(235, 87, 87);
    }
</style>