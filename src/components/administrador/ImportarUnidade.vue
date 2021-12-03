<template>
  <div class="adicionarUnidade">
      <section class="wait-page loading" v-if="syncStatus.status === 'LOADING'">
            <font-awesome-icon :icon="['fas', 'sync']" size="6x" spin  />
            <h1 class="mt-5">Importando dados</h1>
            <h6 class="text-muted">Isso vai demorar um pouco...</h6> 

        <div class="import-log">
            <div class="statusSocket" :class="{'connected': socketConnected}"></div>
            <ul>
                <li v-for="log in syncStatusLogArray" :key="log">
                    {{log}}
                </li>
            </ul>
        </div>
            <!-- <pre>-{{syncStatusLogArray}}</pre> -->
      </section>
      <section class="wait-page success" v-else-if="syncStatus.status === 'SUCCESS'">
            <font-awesome-icon :icon="['far', 'check-circle']" size="6x"  />
            <h1 class="mt-5">Importação finalizada!</h1>
            <h6 class="text-muted">Alguns registros podem não ter sido importados corretamente.</h6>
            <h6 class="text-muted">Confira detalhes no relatório de falhas enviado por e-mail.</h6>
            <router-link :to="'/unidades/'+unidadeId" class="btn btn-success mt-3">acessar unidade</router-link>

            <div class="import-log">
                <div class="statusSocket" :class="{'connected': socketConnected}"></div>
                <ul>
                    <li v-for="log in syncStatusLogArray" :key="log">
                        {{log}}
                    </li>
                </ul>
            </div>
      </section>
      <section v-else>
        <Breadcrumb :path="[{text:'Dashboard', url:'/'}, {text:'Unidades', url:'/unidades'}, {text: 'Importar unidade'}]" />
        <h1>Importar unidade</h1>
        <b-alert show variant="warning">
            <h4 class="alert-heading">Atenção</h4>
            Antes de tudo, você deve compartilhar as planilhas com o email <code>autobot@frente-prevencao-covid-19-rn.iam.gserviceaccount.com</code> para que a sincronização dos dados possa ser efetuada.
        </b-alert>
        <b-form @submit="onSubmit">
            <b-form-group
                id="input-group-nome"
                label="Nome:"
                label-for="nome"
            >
                <b-form-input
                id="nome"
                v-model="form.nome"
                type="text"
                required
                placeholder="Nome da unidade"
                ></b-form-input>
            </b-form-group>

            <b-form-group id="input-group-distrito" label="Distrito:" label-for="distrito">
                <b-form-select
                id="distrito"
                v-model="form.distrito"
                :options="distritos"
                required
                ></b-form-select>
            </b-form-group>

            <b-form-group
                id="input-group-planilhaIdosos"
                label="Planilha de idosos:"
                label-for="planilhaIdosos"
            >
                <b-form-input
                id="planilhaIdosos"
                v-model="form.planilhaIdosos"
                type="text"
                required
                placeholder="Link para planilha de idosos"
                ></b-form-input>
            </b-form-group>

            <b-form-group
                id="input-group-planilhaGerenciamento"
                label="Planilha de gerenciamento:"
                label-for="planilhaGerenciamento"
            >
                <b-form-input
                id="planilhaGerenciamento"
                v-model="form.planilhaGerenciamento"
                type="text"
                required
                placeholder="Link para planilha de gerenciamento"
                ></b-form-input>
            </b-form-group>

            <b-form-group
                id="input-group-fichaVigilancia"
                label="Ficha de vigilância:"
                label-for="fichaVigilancia"
            >
                <b-form-input
                id="fichaVigilancia"
                v-model="form.fichaVigilancia"
                type="text"
                required
                placeholder="Link para ficha de vigilância"
                ></b-form-input>
            </b-form-group>

            <b-button type="submit" variant="primary">Importar</b-button>
        </b-form>

            <div class="import-log">
                <div class="statusSocket" :class="{'connected': socketConnected}"></div>
                <ul>
                    <li v-for="log in syncStatusLogArray" :key="log">
                        {{log}}
                    </li>
                </ul>
            </div>
      </section>
  </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Breadcrumb from '@/components/includes/Breadcrumb';
import { mapState } from 'vuex';

export default {
    name: 'ImportarUnidade',
    components: { Breadcrumb },
    computed: mapState(['syncStatus', 'syncStatusLogArray', 'user']),
    data: function() {
        return {
            socketConnected: false,
            form: {
                nome: '',
                distrito: null,
                _isDeleted: false,
                status: 'INATIVO',
                planilhaIdosos: '',
                planilhaGerenciamento: '',
                fichaVigilancia: '',
                /* TODO DEPRECATED ATTRIBUTES*/
                // idPlanilhaIdosos: '',
                // idPlanilhaGerenciamento: '',
                // idFichaVigilancia: '',
                // collectionPrefix: '',
                // ativo: true,
                // autoSync: false,
                // lastSyncDate: null,
                // vigilantes: [],
            },
            distritos: [ { text: 'Selecione...', value: null }, 'Norte I', 'Norte II', 'Sul', 'Leste', 'Oeste' ],
            unidadeId: null,
        }
    },
     methods: {
        onSubmit(evt) {
            evt.preventDefault();
            console.log(JSON.stringify(this.form));
            const url = `${baseApiUrl}/v2/importacao/unidades`;
            console.log(url);

            axios.post(url, this.form).then(res => {
                // this.$router.push({ name: 'unidade', params: { id: res.data } })
                this.unidadeId = res.data;
                console.log('unidade cadastrada ', this.unidadeId);
                if(this.unidadeId) {
                    this.importFromPlanilhaUnidade()
                }
                // this.$toasted.global.defaultSuccess();
            }).catch(showError)
        },
        importFromPlanilhaUnidade() {
          // $socket is socket.io-client instance
          console.log('emit importUnidadeEvent')
          this.$socket.emit('importUnidadeEvent', { idUnidade: this.unidadeId });
        },
    },
    mounted() {
        this.$store.commit('resetSyncStatusLogArray', null);
        // modo de edição
        // if(this.$route.query.id) {
        //     const url = `${baseApiUrl}/v2/unidades/${this.$route.query.id}`;
        //     axios.get(url).then(res => {
        //         this.form = res.data;
        //     }).catch(showError)
        // }
      setInterval(() => {
        //   console.log(this.$socket)
          this.socketConnected = this.$socket.connected
      }, 1500)
    }
}
</script>

<style>
    .wait-page {
        /* background: red; */
        height: 80vh;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        /* color: blue; */
        /* color: #49a7c1; */

    }
    .wait-page.loading {
        color: #1e469a;
    }
    .wait-page.success {
        color: rgb(39, 174, 96);
    }

    .import-log {
        max-width: 100%;
        margin-top: 30px;
    }

    .import-log ul {
        list-style: none;
        text-align: left;
        background: black;
        color: white;
        padding: 15px;
        width: 1000px;
        max-width: 100%;
        height: 300px;
        overflow-y: scroll;
        position: relative;
    }

    .import-log li {
        margin-bottom: 6px;
    }

    .import-log .statusSocket {
        text-align: left;
    }

    .import-log .statusSocket::after {
        position: relative;
        color: gray;
        content: 'desconectado'
    }
    .import-log .statusSocket.connected::after {
        content: 'conectado';
    }
    .import-log .statusSocket::before {
        position: relative;
        background: red;
        content: '';
        width: 12px;
        height: 12px;
        border-radius: 100%;
        display: inline-block;
        margin: -2px 5px;
    }
    .import-log .statusSocket.connected::before {
        background: #2ad82a;
    }
</style>