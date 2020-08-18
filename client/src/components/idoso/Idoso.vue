<template>
    <div class="idoso"  v-if="idoso">
        <h1>
            {{ idoso.nome }}
        </h1>

        <div class="badges" v-if="idoso.ultimaEscala">
                <popper v-if="idoso.ultimaEscala.vulnerabilidade"
                trigger="hover"
                :options="{
                    placement: 'top'
                }">
                <div class="popper">
                    Escala de Vulnerabilidade
                </div>

                <span slot="reference">
                    <Badge :value="idoso.ultimaEscala.vulnerabilidade" />
                </span>
            </popper>
            <popper v-if="idoso.ultimaEscala.epidemiologica"
                trigger="hover"
                :options="{
                    placement: 'top'
                }">
                <div class="popper">
                    Escala Epidemiológica
                </div>

                <span slot="reference">
                    <Badge :value="idoso.ultimaEscala.epidemiologica" />
                </span>
            </popper>
            <popper v-if="idoso.ultimaEscala.riscoContagio"
                trigger="hover"
                :options="{
                    placement: 'top'
                }">
                <div class="popper">
                    Risco de Contágio por COVID-19
                </div>

                <span slot="reference">
                    <Badge :value="idoso.ultimaEscala.riscoContagio" />
                </span>
            </popper>
            <small class="text-muted ml-2">Score {{ idoso.ultimaEscala.score }}</small>
        </div>
        
        <div class="row mt-4">
            <div class="col">
                <div>
                    <strong>Unidade:</strong> {{ $route.params.unidadeId }} 
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
                <div>
                    <strong>Key:</strong> {{ idoso.row }} 
                </div>
            </div>
            <div class="col">
                <div>
                    <strong>Vigilante:</strong> {{ idoso.vigilante }} 
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
                                {{ idoso.ultimaEscala ? idoso.ultimaEscala.qtdAtendimentosEfetuados : 0 }}/{{ (idoso.ultimoAtendimento ? idoso.ultimoAtendimento.qtdTentativas : 0) }}
                            </span>
                        </popper>
                    </span>
                </div>
                <div>
                    <strong>Último atendimento:</strong>
                    <span class="statusUltimoAtendimento" v-if="idoso.ultimoAtendimento" :class="{ 'atendido' : idoso.ultimoAtendimento.efetuado }">
                        <popper
                            trigger="hover"
                            :options="{
                                placement: 'top',
                                modifiers: { offset: { offset: '0,10px' } }
                            }">
                            <div class="popper">
                                Último atendimento: 
                                <span v-if="idoso.ultimoAtendimento.efetuado">Ligação atendida</span>
                                <span v-if="!idoso.ultimoAtendimento.efetuado">Não atendeu a ligação</span>
                            </div>

                            <span slot="reference">
                                <span v-show="idoso.ultimoAtendimento.efetuado">
                                    <font-awesome-icon :icon="['far', 'check-circle']"  />
                                </span>
                                <span v-show="!idoso.ultimoAtendimento.efetuado">
                                    <font-awesome-icon :icon="['far', 'times-circle']" />
                                </span>
                                {{ formatDate(idoso.ultimoAtendimento.data) }}
                            </span>
                        </popper>
                    </span>

                    <span class="statusUltimoAtendimento atencao" v-show="!idoso.ultimoAtendimento">
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
                    <span class="dataProximoAtendimento" v-if="idoso.ultimaEscala && idoso.ultimaEscala.dataProximoAtendimento">
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
                                <font-awesome-icon :icon="['far', 'clock']" /> {{ formatDate(idoso.ultimaEscala.dataProximoAtendimento) }}
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



        

        {{ $route.params.unidadeId }}
        {{ $route.params.idosoId }}
        {{ idoso }}
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Badge from '@/components/template/Badge';
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';

export default {
    name: 'Idoso',
    components: { Badge, 'popper': Popper },
    data: function() {
        return {
            idoso: null,
            loading: false,
        }
    },
    methods: {
        loadIdoso() {
            const url = `${baseApiUrl}/unidades/${this.$route.params.unidadeId}/idosos/${this.$route.params.idosoId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.idoso = res.data
                console.log(this.idoso)
            }).catch(showError)
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
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