<template>
  <div class="adicionarUsuario">
    <h1>Convidar Usuário</h1>

    <!-- obs: caso o usuario seja um vigilante, seu nome deve ser informado da mesma forma que foi usado nas planilhas (incluido letras maiúsculas, acentos e abreviações).  -->
    <b-form @submit="onSubmit">
        <b-form-group
            id="input-group-nome"
            label="Nome:"
            label-for="nome"
        >
            <b-form-input
            id="nome"
            v-model="form.name"
            type="text"
            required
            placeholder="Nome do usuário"
            ></b-form-input>
        </b-form-group>

        <b-form-group
            id="input-group-email"
            label="Email:"
            label-for="email"
        >
            <b-form-input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="E-mail"
            ></b-form-input>
        </b-form-group>

        <!-- <b-form-group
            id="input-group-senha"
            label="Senha:"
            label-for="senha"
        >
            <b-form-input
            id="senha"
            v-model="form.password"
            type="password"
            required
            placeholder="senha"
            ></b-form-input>
        </b-form-group> -->
<!-- 
        <b-form-group
            id="input-group-confirmarSenha"
            label="Confirmar senha:"
            label-for="confirmarSenha"
        >
            <b-form-input
            id="confirmarSenha"
            v-model="form.confirmPassword"
            type="password"
            required
            placeholder="repetir senha"
            ></b-form-input>
        </b-form-group> -->

        <b-form-group id="input-group-permissao" label="Permissão:" label-for="permissao">
            <b-form-select
            id="permissao"
            v-model="form.role"
            :options="permissoes"
            required
            ></b-form-select>
        </b-form-group>

        <b-form-group id="input-group-unidade" label="Unidade:" label-for="unidade">
            <b-form-select
            id="unidade"
            v-model="form.unidadeId"
            :options="unidades"
            required
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
    name: 'ConvidarUsuario',
    data: function() {
        return {
            form: {
                name: '',
                email: '',
                role: 'VIGILANTE',
                unidadeId: this.$route.params.unidadeId,
                status: 'CONVIDADO',
                _isDeleted: false,
            },
            permissoes: [ { text: 'Preceptor', value: 'PRECEPTOR' }, { text: 'Vigilante', value: 'VIGILANTE' } ],
            unidades: [ { text: this.$route.params.unidadeId, value: this.$route.params.unidadeId } ],
        }
    },
     methods: {
        loadUnidades() {
            const url = `${baseApiUrl}/v2/unidades`;
            console.log(url);

            axios.get(url).then(res => {
                this.unidades = [ 
                    { text: 'Selecione...', value: '' }, 
                    ...res.data.map(item => { return { text: item.nome, value: item._id } } ) 
                ];
            }).catch(showError)
        },
        onSubmit(evt) {
            evt.preventDefault();
            console.log(JSON.stringify(this.form));
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}/usuarios`;
            console.log(url);

            axios.post(url, this.form).then( () => {
                this.$router.push({ name: 'unidade', params: { id: this.$route.params.unidadeId } })
                this.$toasted.global.defaultSuccess();
            }).catch(showError)
        },
    },
    mounted() {
      this.loadUnidades();
    }
}
</script>

<style>

</style>