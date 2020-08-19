<template>
    <div class="atendimento" v-if="atendimento">
        <h1>Atendimento</h1>
        <h6 class="text-muted">{{ formatDate(atendimento.fichaVigilancia.data) }}</h6>

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
                                    <b>Nome:</b> {{ idoso.nome }}
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
                                    <b>Unidade:</b> {{ idoso.unidade }}
                                </div>
                                <div>
                                    <b>Agente de saúde:</b> {{ idoso.agenteSaude }}
                                </div>
                                <div>
                                    <b>Vigilante:</b> {{ idoso.vigilante }}
                                </div>
                            </div>
                        </div>
                    </b-card-text>
                </b-card>

                <b-card
                    title="Sintomas do idoso"
                    class="mb-4"
                    v-if="atendimento.fichaVigilancia.dadosIniciais.atendeu"
                >
                    <b-card-text>
                        <div>
                            <b>O idoso apresenta sintomas de gripe/COVID?</b> 
                            <div v-if="!atendimento.fichaVigilancia.sintomasIdoso.apresentaSintomasGripeCOVID">Não</div>
                            <ul>
                                <li v-for="sintoma in atendimento.fichaVigilancia.sintomasIdoso.sintomas" :key="sintoma">{{ sintoma }}</li>
                            </ul>
                        </div>
                        <div>
                            <b>Apresenta também outros sintomas?</b> 
                            <div v-if="atendimento.fichaVigilancia.sintomasIdoso.outrosSintomas.length == 0">Não</div>
                            <ul>
                                <li v-for="sintoma in atendimento.fichaVigilancia.sintomasIdoso.outrosSintomas" :key="sintoma">{{ sintoma }}</li>
                            </ul>
                        </div>
                        <div v-if="atendimento.fichaVigilancia.sintomasIdoso.detalhesAdicionais">
                            <b>Detalhes adicionais a respeito dos sintomas</b>
                            <div>{{ atendimento.fichaVigilancia.sintomasIdoso.detalhesAdicionais }} </div>
                        </div>
                        <div v-if="atendimento.fichaVigilancia.sintomasIdoso.haQuantosDiasIniciaram > 0">
                            <b>Se estiver apresentando sintomas, há quantos dias eles iniciaram?</b>
                            <div>{{ atendimento.fichaVigilancia.sintomasIdoso.haQuantosDiasIniciaram }} </div>
                        </div>
                        <div>
                            <b>Esteve em contato com algum caso confirmado de coronavírus?</b>
                            <div>{{ atendimento.fichaVigilancia.sintomasIdoso.contatoComCasoConfirmado ? 'Sim' : 'Não' }} </div>
                        </div>
                    </b-card-text>
                </b-card>

                <b-card
                    title="Comorbidades"
                    class="mb-4"
                    v-if="atendimento.fichaVigilancia.dadosIniciais.atendeu"
                >
                    <b-card-text>
                        <div>
                            <b>Tem alguma condição de saúde?</b> 
                            <div v-if="!atendimento.fichaVigilancia.comorbidades.condicoesSaude">Não</div>
                            <ul>
                                <li v-for="comorbidade in atendimento.fichaVigilancia.comorbidades.condicoesSaude" :key="comorbidade">{{ comorbidade }}</li>
                            </ul>
                        </div>
                        <div>
                            <b>Tem alguma medicação que toma todos os dias?</b> 
                            <div v-if="!atendimento.fichaVigilancia.comorbidades.medicacaoDiaria.deveTomar">Não</div>
                            <ul>
                                <li v-for="medicacao in atendimento.fichaVigilancia.comorbidades.medicacaoDiaria.medicacoes" :key="medicacao">{{ medicacao }}</li>
                            </ul>
                        </div>
                        <div v-if="atendimento.fichaVigilancia.comorbidades.medicacaoDiaria.deveTomar">
                            <b>Se toma medicação diariamente, está conseguindo adquiri-las?</b> 
                            <div>{{ !atendimento.fichaVigilancia.comorbidades.medicacaoDiaria.acessoMedicacao ? 'Sim' : 'Não' }}</div>
                        </div>
                    </b-card-text>
                </b-card>

                <b-card
                    title="Acompanhantes no domicílio"
                    class="mb-4"
                    v-if="atendimento.fichaVigilancia.dadosIniciais.atendeu"
                >
                    <b-card-text>
                        <div>
                            <b>Quantas pessoas moram na casa do idoso?</b> 
                            <div> {{ atendimento.fichaVigilancia.qtdAcompanhantesDomicilio }}</div>
                        </div>
                        <div v-if="atendimento.fichaVigilancia.qtdAcompanhantesDomicilio > 0">
                            <b>Na casa do idoso, alguém apresenta sintomas de gripe/COVID?</b> 
                            <div v-if="atendimento.fichaVigilancia.sintomasDomicilio.length == 0">Não</div>
                            <ul>
                                <li v-for="sintomas in atendimento.fichaVigilancia.sintomasDomicilio" :key="sintomas">{{ sintomas }}</li>
                            </ul>
                        </div>
                        <div v-if="atendimento.fichaVigilancia.qtdAcompanhantesDomicilio > 0">
                            <b>As pessoas que moram com o idoso têm saído de casa?</b> 
                            <div> {{ atendimento.fichaVigilancia.habitosDomiciliaresAcompanhantes.saiDeCasa ? 'Sim' : 'Não' }}</div>
                        </div>
                        <div v-if="atendimento.fichaVigilancia.qtdAcompanhantesDomicilio > 0">
                            <b>As pessoas que moram com o idoso têm feito a higienização frequente das mãos com água e sabão ou álcool gel?</b> 
                            <div> {{ atendimento.fichaVigilancia.habitosDomiciliaresAcompanhantes.higienizacaoMaos ? 'Sim' : 'Não' }}</div>
                        </div>
                        <div v-if="atendimento.fichaVigilancia.qtdAcompanhantesDomicilio > 0">
                            <b>O idoso costuma compartilhar utensílios com as pessoas da sua casa? Ex: copos, talheres.</b> 
                            <div> {{ atendimento.fichaVigilancia.habitosDomiciliaresAcompanhantes.compartilhamentoUtensilios ? 'Sim' : 'Não' }}</div>
                        </div>
                        <div v-if="atendimento.fichaVigilancia.qtdAcompanhantesDomicilio > 0">
                            <b>Todos em casa usam máscara ao falar com o idoso?</b> 
                            <div> {{ atendimento.fichaVigilancia.habitosDomiciliaresAcompanhantes.usoMascara ? 'Sim' : 'Não' }}</div>
                        </div>
                    </b-card-text>
                </b-card>

                <b-card
                    title="Identificação de vulnerabilidades"
                    class="mb-4"
                    v-if="atendimento.fichaVigilancia.dadosIniciais.atendeu"
                >
                    <b-card-text>
                        <div>
                            <b>Após a sondagem, como você identifica o convívio do idoso com sua família?</b> 
                            <div> {{ atendimento.fichaVigilancia.vulnerabilidades.convivioFamilia }}</div>
                        </div>
                        <div>
                            <b>Após a sondagem, você identificou algum sinal de vulnerabilidade alimentar?</b> 
                            <div> {{ atendimento.fichaVigilancia.vulnerabilidades.alimentar ? 'Sim' : 'Não' }}</div>
                        </div>
                        <div>
                            <b>Após a sondagem, você identificou algum sinal de vulnerabilidade financeira ou abuso financeiro por parte de terceiros?</b> 
                            <div> {{ atendimento.fichaVigilancia.vulnerabilidades.financeira ? 'Sim' : 'Não' }}</div>
                        </div>
                        <div>
                            <b>Após a sondagem, você identificou algum sinal de violência sofrida pelo idoso, seja ela física ou psicológica?</b> 
                            <div> {{ atendimento.fichaVigilancia.vulnerabilidades.violencia ? 'Sim' : 'Não' }}</div>
                        </div>
                        <div>
                            <b>Observações e outras informações importantes</b> 
                            <div> {{ atendimento.fichaVigilancia.vulnerabilidades.observacoes || '-'}}</div>
                        </div>
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
                             {{ formatDate(atendimento.fichaVigilancia.data) }}
                        </div>
                        <div>
                            <b>Status da chamada: </b> 
                            <span class="statusUltimoAtendimento" :class="{ 'atendido' : atendimento.fichaVigilancia.dadosIniciais.atendeu }">
                                <span v-show="atendimento.fichaVigilancia.dadosIniciais.atendeu">
                                    <font-awesome-icon :icon="['far', 'check-circle']"  /> Ligação atendida
                                </span>
                                <span v-show="!atendimento.fichaVigilancia.dadosIniciais.atendeu">
                                    <font-awesome-icon :icon="['far', 'times-circle']" /> Ligação não atendida
                                </span>
                            </span>
                        </div>
                        <div>
                            <b>Vigilante responsável:</b> 
                             {{ atendimento.fichaVigilancia.vigilante }}
                        </div>
                        <div>
                            <b>Tipo de atendimento:</b> 
                             {{ atendimento.fichaVigilancia.primeiroAtendimento ? 'Primeiro atendimento' : 'Acompanhamento'}}
                        </div>
                        <div>
                            <b>Fonte das informações:</b> 
                             {{ atendimento.fichaVigilancia.fonte }}
                        </div>
                        <div>
                            <b>Idade:</b> 
                             {{ atendimento.fichaVigilancia.idade }} anos
                        </div>
                        <div>
                            <b>Duração da chamada:</b> 
                             {{ atendimento.fichaVigilancia.duracaoChamada }}
                        </div>
                    </b-card-text>
                </b-card>

                <b-card
                    title="Resultado do atendimento"
                    class="mb-4"
                    v-if="atendimento.fichaVigilancia.dadosIniciais.atendeu"
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
                >
                    <b-card-text>
                        // TODO
                    </b-card-text>
                </b-card>
            </div>
        </div>

    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Badge from '@/components/template/Badge';

export default {
    name: 'Atendimento',
    components: { Badge },
    data: function() {
        return {
            atendimento: null,
            idoso: null,
            loading: false,
        }
    },
    methods: {
        loadAtendimento() {
            const url = `${baseApiUrl}/unidades/${this.$route.params.unidadeId}/atendimentos/${this.$route.params.atendimentoId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.atendimento = res.data
                console.log(this.atendimento);
                this.loadIdoso();
                console.log(this.atendimento.fichaVigilancia.dadosIniciais.nomeLower)
            }).catch(showError)
        },
        loadIdoso() {
            const url = `${baseApiUrl}/unidades/${this.$route.params.unidadeId}/idosos/${this.atendimento.fichaVigilancia.dadosIniciais.nomeLower}`;
            console.log(url);

            axios.get(url).then(res => {
                this.idoso = res.data
                console.log(this.idoso);
            }).catch(showError)
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
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