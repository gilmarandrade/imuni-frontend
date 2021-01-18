<template>
    <div class="anotacoes card mb-4">
        <div class="card-body p-0">
            <header class="">
                <h5 class="card-title text-left my-3 ml-3 d-inline-block">
                    Anotações
                </h5>
            <button @click="openModalAdicionarAnotacao()" class="btn btn-outline-primary mr-3 mt-2 float-right">Nova</button>
            </header>

            <ul class="lista">
                <li v-for="anotacao in anotacoes" :key="anotacao._id">
                    <div class="small text-muted mb-2">
                        {{anotacao.usuarioName}}
                            &#8226; 
                        {{anotacao.usuarioRole}}
                        &#8226; 
                        {{formatDate(anotacao.timestamp)}}
                    </div>
                    <p>{{anotacao.text}}</p>
                </li>
                <li v-if="primeiraAnotacao">
                    <div class="small text-muted mb-2">
                        Desconhecido &#8226; há muito tempo atrás
                    </div>
                    <p>{{primeiraAnotacao}}</p>
                </li>
            </ul>
            <div v-if="anotacoes.length == 0 && !primeiraAnotacao" class="p-3 text-muted">
                Não há anotações
            </div>
        </div>

        <!-- The modal -->
        <b-modal 
            id="modal-adicionar-anotacao"
            title="Adicionar anotação"
            @hidden="modalAdicionarAnotacaoReset"
            @ok="modalAdicionarAnotacaoHandleOk"
           >

            <form ref="form" @submit.stop.prevent="modalAdicionarAnotacaoHandleSubmit">
                <b-form-group
                    label=""
                    label-for="textarea"
                    :state="textState"
                    :invalid-feedback="textInvalidFeedback || 'A mensagem não pode estar vazia'"
                >

                    <b-form-textarea
                        id="textarea"
                        v-model="novaAnotacao.text"
                        placeholder="Escreva alguma coisa..."
                        rows="3"
                        max-rows="6"
                        required
                        :state="textState"
                        :invalid-feedback="textInvalidFeedback || 'A mensagem não pode estar vazia'"
                        ></b-form-textarea>
                </b-form-group>
            </form>

        </b-modal>

    </div>
</template>

<script>
import { baseApiUrl, showError, formatDate } from '@/global';
import axios from 'axios';
import { mapState } from 'vuex';

export default {
    name: 'Anotacoes',
    props: ['idosoId', 'primeiraAnotacao'],
    computed: mapState(['user']),
    data: function() {
        return {
            anotacoes: [],
            novaAnotacao: {
                idosoId: this.idosoId,
                usuarioId: null,
                usuarioName: '',
                usuarioRole: '',
                timestamp: null,
                text: '',
                 _isDeleted: false,
            },
            textState: null,
            textInvalidFeedback: '',
        }
    },
    methods: {
        formatDate,
        loadAnotacoes() {
            const url = `${baseApiUrl}/v2/idosos/${this.idosoId}/anotacoes`;
            console.log(url);

            axios.get(url).then(res => {
                this.anotacoes = res.data
            }).catch(function(e) {console.error(e);showError(e)})
        },
        openModalAdicionarAnotacao() {
            this.textState = null;
            this.textInvalidFeedback = '';
            this.novaAnotacao = {
                idosoId: this.idosoId,
                text: '',
                usuarioId: this.user.id,
                usuarioName: this.user.name,
                usuarioRole: this.user.role,
                timestamp: null,
                 _isDeleted: false,
            };
            this.$bvModal.show('modal-adicionar-anotacao');
        },
        modalAdicionarAnotacaoReset() {
            console.log('reset')
            this.novaAnotacao = {
                idosoId: this.idosoId,
                text: '',
                usuarioId: null,
                usuarioName: '',
                usuarioRole: '',
                timestamp: null,
                _isDeleted: false,
            };
            this.textState = null;
            this.textInvalidFeedback = '';
        },
        modalAdicionarAnotacaoHandleOk(bvModalEvt) {
          // // Prevent modal from closing
          bvModalEvt.preventDefault();
          console.log('ok')
          // // Trigger submit handler
          this.modalAdicionarAnotacaoHandleSubmit();
        },
        modalAdicionarAnotacaoHandleSubmit() {
            // Exit when the form isn't valid
            this.textState = this.$refs.form.checkValidity();
            if (!this.textState) {
                return
            }

            this.novaAnotacao.timestamp = new Date();
            //requisição para API
            const url = `${baseApiUrl}/v2/idosos/${this.novaAnotacao.idosoId}/anotacoes`;
            console.log(url);

            axios.post(url, this.novaAnotacao).then( (res) => {
                this.$toasted.global.defaultSuccess({msg: res.data});
                this.loadAnotacoes();
                // Hide the modal manually
                this.$nextTick(() => {
                    this.$bvModal.hide('modal-adicionar-anotacao');
                })
            }).catch(e => {
                if(e && e.response && e.response.data) {
                    this.textState = false;
                    this.textInvalidFeedback = e.response.data;
                } else {
                    showError(e);
                }
          });
        },
    },
    mounted() {
      this.loadAnotacoes();
    }
}
</script>

<style>
    .anotacoes {

    }

    .anotacoes .lista {
        list-style-type: none;
        padding: 0;
        margin: 0;
        overflow-y: scroll;
        max-height: 500px;
    }

    .anotacoes .lista li {
        margin: 0 15px;
        padding: 15px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.16);
    }
    .anotacoes .lista p {
        text-align: justify;
        margin-bottom: 0;
    }
</style>