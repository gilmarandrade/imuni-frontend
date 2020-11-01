<template>
  <div class="adicionarIdoso">
    <h1>Cadastrar/Editar Idoso</h1>

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
            ></b-form-select>
        </b-form-group>

        <b-form-group id="input-group-vigilante" label="Vigilante:" label-for="vigilante">
            <b-form-select
            id="vigilante"
            v-model="form.vigilanteId"
            :options="vigilantes"
            ></b-form-select>
        </b-form-group>

        <b-button type="submit" variant="primary">Salvar</b-button>
    </b-form>
  </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';

export default {
    name: 'CadastrarIdoso',
    data: function() {
        return {
            form: {
                nome: '',
                dataNascimento: '',
                telefone1: '',
                telefone2: '',
                agenteSaude: '',
                anotacoes: '',
                unidadeId: this.$route.params.unidadeId,
                vigilanteId: '',
                row: '',
            },
            //TODO preencher a lista de unidades com a lista vinda do bd
            unidades: [ { text: this.$route.params.unidadeId, value: this.$route.params.unidadeId } ],
            vigilantes: [ { text: '', value: '' }, { text: 'Carlos', value: '5f9dc89e0a136c35bc73b0a8' } ],//TODO 
        }
    },
     methods: {
        onSubmit(evt) {
            evt.preventDefault();
            console.log(JSON.stringify(this.form));
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}/idosos`;
            console.log(url, this.form);

            axios.post(url, this.form).then( () => {
                this.$router.push({ name: 'unidade', params: { id: this.$route.params.unidadeId } })
                this.$toasted.global.defaultSuccess({ msg: 'Idoso salvo com sucesso'});
            }).catch(showError)
        },
    },
    mounted() {
        //TODO deveria ter um spining loading 
        // modo de edição
        if(this.$route.query.id) {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.id}/idosos/${this.$route.query.id}`;
            axios.get(url).then(res => {
                this.form = res.data;
            }).catch(showError)
        }
    }
}
</script>

<style>

</style>