<template>
  <div class="adicionarIdoso">
      <Breadcrumb :path="[{text:'Dashboard', url:'/'}, {text: 'Adicionar idoso'}]" />
    <h1 v-if="$route.query.id">Editar Idoso</h1>
    <h1 v-else>Adicionar Idoso</h1>
    
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
            placeholder="Nome do idoso"
            ></b-form-input>
        </b-form-group>

        <b-form-group
            id="input-group-nascimento"
            label="Data de nascimento:"
            label-for="nascimento"
        >
            <b-form-input
            id="nascimento"
            v-model="form.dataNascimento"
            type="text"
            placeholder="Data de nascimento"
            ></b-form-input>
        </b-form-group>

        <b-form-group
            id="input-group-telefone1"
            label="Telefone 1:"
            label-for="telefone1"
        >
            <b-form-input
            id="telefone1"
            v-model="form.telefone1"
            type="text"
            placeholder="Telefone 1"
            ></b-form-input>
        </b-form-group>

        <b-form-group
            id="input-group-telefone2"
            label="Telefone 2:"
            label-for="telefone2"
        >
            <b-form-input
            id="telefone2"
            v-model="form.telefone2"
            type="text"
            placeholder="Telefone 2"
            ></b-form-input>
        </b-form-group>

        <b-form-group
            id="input-group-agenteSaude"
            label="Agente de saúde:"
            label-for="agenteSaude"
        >
            <b-form-input
            id="agenteSaude"
            v-model="form.agenteSaude"
            type="text"
            placeholder="Agente de saúde"
            ></b-form-input>
        </b-form-group>

        <b-form-group
            id="input-group-cns"
            label="CNS:"
            label-for="cns"
        >
            <b-form-input
            id="cns"
            v-model="form.CNS"
            type="text"
            placeholder="Cartão Nacional de Saúde"
            ></b-form-input>
        </b-form-group>

        <b-form-group
            id="input-group-anotacoes"
            label="Anotações:"
            label-for="anotacoes"
        >
            <b-form-input
            id="anotacoes"
            v-model="form.anotacoes"
            type="text"
            placeholder="Anotações"
            ></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-unidade" label="Unidade:" label-for="unidade">
            <b-form-select
            id="unidade"
            v-model="form.unidadeId"
            :options="unidades"
            required
            @change="onChangeUnidadeSelect"
            ></b-form-select>
        </b-form-group>

        <b-form-group id="input-group-vigilante" label="Vigilante:" label-for="vigilante">
            <b-form-select
            id="vigilante"
            v-model="form.vigilanteId"
            :options="vigilantes"
            :disabled="user.role === 'PRECEPTOR'"
            ></b-form-select>
        </b-form-group>

        <b-button type="submit" variant="primary">Salvar</b-button>
    </b-form>
  </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Breadcrumb from '@/components/includes/Breadcrumb';
import { mapState } from 'vuex';

export default {
    name: 'CadastrarIdoso',
    components: { Breadcrumb },
    computed: mapState(['user']),
    data: function() {
        return {
            form: {
                CNS: '',
                nome: '',
                dataNascimento: '',
                telefone1: '',
                telefone2: '',
                agenteSaude: '',
                anotacoes: '',
                unidadeId: this.$route.params.unidadeId,
                vigilanteId: '',
                row: '',
                _isDeleted: false,
            },
            unidades: [ { text: 'Selecione...', value: '' } ],
            vigilantes: [ { text: 'Selecione', value: '' } ],
        }
    },
     methods: {
        loadUnidades() {
            if(this.user.role === 'PRECEPTOR') { // carrega no select apenas a unidade do preceptor
                const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}`;
                console.log(url);

                axios.get(url).then(res => {
                    this.unidades = [ 
                        // { text: 'Selecione...', value: '' }, 
                        { text: res.data.nome, value: res.data._id }
                    ];
                }).catch(showError)
            } else { // carrega no select todas as unidades
                const url = `${baseApiUrl}/v2/unidades`;
                console.log(url);

                axios.get(url).then(res => {
                    this.unidades = [ 
                        { text: 'Selecione...', value: '' }, 
                        ...res.data.map(item => { return { text: item.nome, value: item._id } } ) 
                    ];
                }).catch(showError)
            }
        },
        loadVigilantes(unidadeId) {
            if(this.user.role !== 'PRECEPTOR') { // não carrega o select de vigilantes, caso o usuario cadastrando seja um preceptor
                const url = `${baseApiUrl}/v2/unidades/${unidadeId}/vigilantes`;
                console.log(url);

                axios.get(url).then(res => {
                    console.log(res.data)
                    this.vigilantes = [ 
                        { text: 'Selecione...', value: '' }, 
                        ...res.data.map(item => { return { text: item.name, value: item._id } } ) 
                    ];
                }).catch(showError)
            }
        },
        onSubmit(evt) {
            //TODO validação: a data de nascimento deve ter formato xx/xx/xxxx, usar um componente de calendário
            evt.preventDefault();
            console.log(JSON.stringify(this.form));
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}/idosos`;
            console.log(url, this.form);

            axios.post(url, this.form).then( (res) => {
                console.log(res.data)
                this.$router.push({ name: 'idoso', params: { unidadeId: res.data.unidadeId, idosoId: res.data._id } })
                // window.history.length > 1 ? this.$router.go(-1) : null;
                this.$toasted.global.defaultSuccess({ msg: 'Registro salvo com sucesso'});
            }).catch(showError)
        },
        onChangeUnidadeSelect(unidadeId) {
            this.form.vigilanteId = '';
            this.loadVigilantes(unidadeId);
        }
    },
    mounted() {
        this.loadUnidades();
        this.loadVigilantes(this.$route.params.unidadeId);

        //TODO deveria ter um spining loading 
        // modo de edição
        if(this.$route.query.id) {
            const url = `${baseApiUrl}/v2/idosos/${this.$route.query.id}`;
            axios.get(url).then(res => {
                this.form = res.data;
            }).catch(showError)

        }
    }
}
</script>

<style>

</style>