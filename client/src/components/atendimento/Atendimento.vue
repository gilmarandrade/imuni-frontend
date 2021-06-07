<template>
    <div class="atendimento" v-if="atendimento">
        <Breadcrumb v-if="user.role !== 'ADMINISTRADOR' && idoso" :path="[{text:'Dashboard', url:'/'}, {text: 'Meus idosos', url:'/meusIdosos/com-escalas'}, {text: idoso.nome, url: `/unidades/${idoso.unidadeId}/idosos/${idoso._id}`}, {text: formatDate(atendimento.timestamp)}]" />
        <Breadcrumb v-if="user.role === 'ADMINISTRADOR' && idoso && unidade" :path="[{text:'Dashboard', url:'/'}, {text: 'Unidades', url: '/unidades'}, {text: unidade.nome, url: `/unidades/${idoso.unidadeId}`}, {text: 'Idosos', url: `/unidades/${idoso.unidadeId}/usuarios/${user.id}/idosos/com-escalas`}, {text: idoso.nome, url: `/unidades/${idoso.unidadeId}/idosos/${idoso._id}`}, {text: formatDate(atendimento.timestamp)}]" />

        <h1>Atendimento</h1>
        <h6 class="text-muted">{{ formatDate(atendimento.timestamp) }}</h6>
        <b-alert v-if="atendimento._isDeleted" show variant="danger">Este item foi deletado</b-alert>

        <div class="row mt-5">
            <div class="col-lg-7">
                <b-card
                    title="Idoso"
                    class="mb-4"
                >
                    <b-card-text v-if="idoso">
                        <div class="row">
                            <div class="col-lg-6">
                                <div>
                                    <b>Nome: </b>
                                    <IdosoLink :nome="idoso.nome" :url="`/unidades/${idoso.unidadeId}/idosos/${idoso._id}`" />
                                    <!-- <IdosoLink :id="idoso._id" /> -->
                                </div>
                                <div>
                                    <b>Data de nascimento:</b> {{ idoso.dataNascimento }}
                                </div>
                                <div>
                                    <b>Telefones:</b> {{ idoso.telefone1 }} {{ idoso.telefone2 ? '/ ' + idoso.telefone2 : '' }}
                                </div>
                            </div>
                            <div class="col-lg-6">
                                <div>
                                    <b>Unidade: </b>
                                    <UnidadeLink v-if="unidade" :nome="unidade.nome" :url="`/unidades/${unidade._id}`" />
                                </div>
                                <div>
                                    <b>Agente de saúde:</b> {{ idoso.agenteSaude }}
                                </div>
                                <div>
                                    <b>CNS:</b> {{ idoso.CNS }}
                                </div>
                                <div>
                                    <b>Vigilante: </b>
                                    <UsuarioLink :id="idoso.vigilanteId"></UsuarioLink>
                                </div>
                            </div>
                        </div>
                    </b-card-text>
                </b-card>

                <b-card
                    title="Sintomas do idoso"
                    class="mb-4"
                    v-if="atendimento.atendeu"
                >
                    <b-card-text>
                        <FormResponse v-for="item in atendimento.raw['S05']" :key="item.question" :item="item" />
                    </b-card-text>
                </b-card>

                <b-card
                    title="Comorbidades"
                    class="mb-4"
                    v-if="atendimento.atendeu"
                >
                    <b-card-text>
                        <FormResponse v-for="item in atendimento.raw['S06']" :key="item.question" :item="item" />
                    </b-card-text>
                </b-card>

                <b-card
                    title="Acompanhantes no domicílio"
                    class="mb-4"
                    v-if="atendimento.atendeu"
                >
                    <b-card-text>
                        <FormResponse v-for="item in atendimento.raw['S09']" :key="item.question" :item="item" />
                        <FormResponse v-for="item in atendimento.raw['S10']" :key="item.question" :item="item" />
                        <FormResponse v-for="item in atendimento.raw['S11']" :key="item.question" :item="item" />
                    </b-card-text>
                </b-card>

                <b-card
                    title="Identificação de vulnerabilidades"
                    class="mb-4"
                    v-if="atendimento.atendeu"
                >
                    <b-card-text>
                        <FormResponse v-for="item in atendimento.raw['S12']" :key="item.question" :item="item" />
                    </b-card-text>
                </b-card>
            </div>
            <div class="col-lg-5">
                <b-card
                    title="Ficha do atendimento"
                    class="mb-4"
                >
                    <b-card-text>
                        <div>
                            <b>Data de realização:</b> 
                             {{ formatDate(atendimento.timestamp) }}
                        </div>
                        <div>
                            <b>Status da chamada: </b>
                            <span class="statusUltimoAtendimento" :class="{ 'atendido' : atendimento.atendeu }">
                                <span v-show="atendimento.atendeu">
                                    <font-awesome-icon :icon="['far', 'check-circle']"  /> Ligação atendida
                                </span>
                                <span v-show="!atendimento.atendeu">
                                    <font-awesome-icon :icon="['far', 'times-circle']" /> Ligação não atendida
                                </span>
                            </span>
                        </div>
                        <div>
                            <b>Atendente: </b>
                             <UsuarioLink :id="atendimento.vigilanteId"></UsuarioLink>
                        </div>
                        <div>
                            <b>Tipo de atendimento:</b> 
                            {{ atendimento.tipo }}
                        </div>
                        <div>
                            <b>Fonte das informações:</b> 
                            {{ atendimento.fonte }}
                        </div>
                        <div>
                            <b>Idade:</b> 
                            {{ atendimento.idadeIdoso }} anos
                        </div>
                        <div>
                            <b>Duração da chamada:</b> 
                            {{ atendimento.duracaoChamada }}
                        </div>
                    </b-card-text>
                </b-card>

                <b-card
                    title="Resultado do atendimento"
                    class="mb-4"
                    v-if="atendimento.atendeu"
                >
                    <b-card-text>
                        <div>
                            <b>Escala de vulnerabilidade</b> 
                            <div v-if="atendimento.escalas.vulnerabilidade">
                                <Badge :value="atendimento.escalas.vulnerabilidade" />
                            </div>
                        </div>
                        <br/>
                        <div>
                            <b>Escala epidemiológica</b> 
                            <div v-if="atendimento.escalas.epidemiologica">
                                <Badge :value="atendimento.escalas.epidemiologica" />
                            </div>
                        </div>
                        <br/>
                        <div>
                            <b>Escala de Risco COVID</b> 
                            <div v-if="atendimento.escalas.riscoContagio">
                                <Badge :value="atendimento.escalas.riscoContagio" />
                            </div>
                        </div>
                        <br/>
                        <div>
                            <b>Score de ordenação</b> 
                            <div v-if="atendimento.escalas.scoreOrdenacao">
                                {{ atendimento.escalas.scoreOrdenacao }}
                            </div>
                        </div>
                    </b-card-text>
                </b-card>

                <b-card
                    title="Epidemiologia"
                    class="mb-4"
                    v-if="atendimento.raw['S08']"
                >
                    <b-card-text>
                         <FormResponse v-for="item in atendimento.raw['S08']" :key="item.question" :item="item" />
                    </b-card-text>
                </b-card>

                <b-card
                    title="Epidemiologia"
                    class="mb-4"
                    v-if="!atendimento.raw['S08']"
                >
                    <b-card-text>
                        O idoso ainda não possui atendimentos efetuados. A epidemiologia é colhida no primeiro atendimento.
                    </b-card-text>
                </b-card>
            </div>
        </div>

    </div>
</template>

<script>
import { baseApiUrl, showError, formatDate } from '@/global';
import axios from 'axios';
import Badge from '@/components/template/Badge';
import { mapState } from 'vuex';
import FormResponse from '@/components/template/FormResponse';
import UnidadeLink from '@/components/includes/UnidadeLink';
import UsuarioLink from '@/components/includes/UsuarioLink';
import IdosoLink from '@/components/includes/IdosoLink';
import Breadcrumb from '@/components/includes/Breadcrumb';

export default {
    name: 'Atendimento',
    components: { Badge, FormResponse, UnidadeLink, UsuarioLink, IdosoLink, Breadcrumb },
    computed: mapState(['user']),
    data: function() {
        return {
            atendimento: null,
            idoso: null,
            loading: false,
            unidade: null,
        }
    },
    methods: {
        formatDate,
        loadAtendimento() {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}/atendimentos/${this.$route.params.atendimentoId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.atendimento = res.data
                console.log(this.atendimento);
                this.loadIdoso();
                this.loadUnidade();
            }).catch(showError)
        },
        loadIdoso() {
            if(this.atendimento.idosoId){
                const url = `${baseApiUrl}/v2/idosos/${this.atendimento.idosoId}`;
                console.log(url);
    
                axios.get(url).then(res => {
                    this.idoso = res.data
                    console.log(this.idoso);
                }).catch(showError)
            } else {
                console.error('atendimento.idosoId null');
            }
        },
        loadUnidade() {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.unidade = res.data
                console.log(this.unidade)
            }).catch(showError)
        },
    },
    mounted() {
      this.loadAtendimento();
    }
}
</script>

<style>
    .atendimento .statusUltimoAtendimento {
        /* background: red; */
        color: rgb(235, 87, 87);
    }

    .atendimento .statusUltimoAtendimento.atendido {
        color: rgb(39, 174, 96);
    }

    .atendimento .statusUltimoAtendimento.atencao {
        /* background: yellow; */
        color: rgb(235, 87, 87);
    }
</style>