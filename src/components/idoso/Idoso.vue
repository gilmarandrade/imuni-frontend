<template>
    <div class="idoso"  v-if="idoso">
        <Breadcrumb v-if="user.role !== 'ADMINISTRADOR'" :path="[{text:'Dashboard', url:'/'}, {text: 'Meus idosos', url:'/meusIdosos/com-escalas'}, {text: idoso.nome}]" />
        <Breadcrumb v-if="user.role === 'ADMINISTRADOR' && unidade" :path="[{text:'Dashboard', url:'/'}, {text: 'Unidades', url: '/unidades'}, {text: unidade.nome, url: `/unidades/${idoso.unidadeId}`}, {text: 'Idosos', url: `/unidades/${idoso.unidadeId}/usuarios/${user.id}/idosos/com-escalas`}, {text: idoso.nome}]" />


        <div class="row">
            <div class="col-12">
                <b-alert v-if="idoso._isDeleted" show variant="danger">Este item foi deletado</b-alert>
            </div>
            <div class="col-10">
                <h1>
                    {{ idoso.nome }}
                </h1>
            </div>
            <div class="col-2 text-right">
                <b-dropdown right no-caret variant="light" title="Opções">
                    <template #button-content>
                        <font-awesome-icon :icon="['fas', 'ellipsis-v']"  />
                    </template>
                    <b-dropdown-item :href="'/unidades/'+idoso.unidadeId+'/cadastrarIdoso?id='+idoso._id">Editar</b-dropdown-item>
                    <b-dropdown-item v-if="user.role === 'ADMINISTRADOR'" @click="deleteIdoso(idoso._id)">Excluir</b-dropdown-item>
                </b-dropdown>
            </div>
        </div>

        <div class="badges" v-if="idoso.estatisticas && idoso.estatisticas.ultimaEscala">
                <popper v-if="idoso.estatisticas.ultimaEscala.escalas.vulnerabilidade"
                trigger="hover"
                :options="{
                    placement: 'top'
                }">
                <div class="popper">
                    Escala de Vulnerabilidade
                </div>

                <span slot="reference">
                    <Badge :value="idoso.estatisticas.ultimaEscala.escalas.vulnerabilidade" />
                </span>
            </popper>
            <popper v-if="idoso.estatisticas.ultimaEscala.escalas.epidemiologica"
                trigger="hover"
                :options="{
                    placement: 'top'
                }">
                <div class="popper">
                    Escala Epidemiológica
                </div>

                <span slot="reference">
                    <Badge :value="idoso.estatisticas.ultimaEscala.escalas.epidemiologica" />
                </span>
            </popper>
            <popper v-if="idoso.estatisticas.ultimaEscala.escalas.riscoContagio"
                trigger="hover"
                :options="{
                    placement: 'top'
                }">
                <div class="popper">
                    Risco de Contágio por COVID-19
                </div>

                <span slot="reference">
                    <Badge :value="idoso.estatisticas.ultimaEscala.escalas.riscoContagio" />
                </span>
            </popper>
            <small class="text-muted ml-2">Score {{ idoso.estatisticas.ultimaEscala.escalas.scoreOrdenacao }}</small>
        </div>
        
        <div class="row mt-4">
            <div class="col-12 col-md-6 col-lg-7 mb-3">
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-12 mb-3">
                                <div>
                                    <strong>Unidade: </strong>
                                    <UnidadeLink v-if="unidade" :nome="unidade.nome" :url="`/unidades/${unidade._id}`" />
                                </div>
                                <div>
                                    <strong>Agente de saúde:</strong> {{ idoso.agenteSaude }} 
                                </div>
                                <div>
                                    <strong>CNS:</strong> {{ idoso.CNS }} 
                                </div>
                                <div>
                                    <strong>Data de Nascimento:</strong> {{ idoso.dataNascimento }} 
                                </div>
                                <div>
                                    <strong>Telefones:</strong> {{ idoso.telefone1 }} {{ idoso.telefone2 ? '/ ' + idoso.telefone2 : '' }} 
                                </div>
                            </div>
                            <div class="col-12">
                                <div>
                                    <strong>Vigilante: </strong>
                                    <UsuarioLink v-if="idoso.vigilanteId" :id="idoso.vigilanteId" />
                                    <span v-else class="atencao">Sem vigilante</span>
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
                                                {{ idoso.estatisticas ? idoso.estatisticas.qtdAtendimentosEfetuados : 0 }}/{{ (idoso.estatisticas ? idoso.estatisticas.qtdTotal : 0) }}
                                            </span>
                                        </popper>
                                    </span>
                                </div>
                                <div>
                                    <strong>Último atendimento:</strong>
                                    <span class="statusUltimoAtendimento" v-if="idoso.estatisticas && idoso.estatisticas.ultimoAtendimento" :class="{ 'atendido' : idoso.estatisticas.ultimoAtendimento.atendeu }">
                                        <popper
                                            trigger="hover"
                                            :options="{
                                                placement: 'top',
                                                modifiers: { offset: { offset: '0,10px' } }
                                            }">
                                            <div class="popper">
                                                Último atendimento: 
                                                <span v-if="idoso.estatisticas.ultimoAtendimento.atendeu">Ligação atendida</span>
                                                <span v-if="!idoso.estatisticas.ultimoAtendimento.atendeu">Não atendeu a ligação</span>
                                            </div>

                                            <span slot="reference">
                                                <span v-show="idoso.estatisticas.ultimoAtendimento.atendeu">
                                                    <font-awesome-icon :icon="['far', 'check-circle']"  />
                                                </span>
                                                <span v-show="!idoso.estatisticas.ultimoAtendimento.atendeu">
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
                                                <font-awesome-icon :icon="['far', 'clock']" /> {{ formatDate(idoso.estatisticas.ultimaEscala.escalas.dataProximoAtendimento) }}
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
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-6 col-lg-5 mb-3">
                <Anotacoes :idosoId="idoso._id" :primeiraAnotacao="idoso.anotacoes"></Anotacoes>
            </div>
        </div>
        <!-- <div class="row mt-3">
            <div class="col">
                 <div>
                    <strong>Anotações do vigilante:</strong>
                    <p>{{ idoso.anotacoes ? idoso.anotacoes : '-' }}</p>
                </div>
            </div>
        </div> -->

        <div class="row mt-5 mb-3">
            <div class="col">
                <h2 class="">Histórico de atendimentos</h2>
            </div>
            <div class="col text-right">
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
                <span class="statusUltimoAtendimento" :class="{ 'atendido' : data.item.atendeu }">
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
            <template v-slot:cell(col-vigilante)="data">
                <UsuarioLink :id="data.item.vigilanteId"></UsuarioLink>
            </template>
        </b-table>
    </div>
</template>

<script>
import { baseApiUrl, showError, novoAtendimentoURL, formatDate } from '@/global';
import axios from 'axios';
import { mapState } from 'vuex';
import Badge from '@/components/template/Badge';
import UnidadeLink from '@/components/includes/UnidadeLink';
import UsuarioLink from '@/components/includes/UsuarioLink';
import Breadcrumb from '@/components/includes/Breadcrumb';
import Anotacoes from '@/components/idoso/Anotacoes';
import Popper from 'vue-popperjs';
import 'vue-popperjs/dist/vue-popper.css';

export default {
    name: 'Idoso',
    components: { Badge, 'popper': Popper, UnidadeLink, UsuarioLink, Breadcrumb, Anotacoes },
    computed: mapState(['user']),
    data: function() {
        return {
            idoso: null,
            unidade: null,
            atendimentos: [],
            fields: [ 
                { key: 'col-data', label: 'Data' },
                { key: 'col-status', label: 'Status' },
                { key: 'col-escalas', label: 'Escalas' },
                { key: 'col-vigilante', label: 'Atendente' },
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
        loadUnidade() {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.unidade = res.data
                console.log(this.unidade)
            }).catch(showError)
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
                      console.log(res.data)
                      console.log(`/unidades/${this.unidade._id}/usuarios/${this.user._id}/idosos/all`)
                      this.$router.push({ path: `/unidades/${this.unidade._id}/usuarios/${this.user.id}/idosos/all` })
                      this.$toasted.global.defaultSuccess({ msg: 'Idoso removido com sucesso'});
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
      this.loadIdoso();
      this.loadUnidade();
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
    
    .atencao {
        color: rgb(235, 87, 87);
    }
</style>