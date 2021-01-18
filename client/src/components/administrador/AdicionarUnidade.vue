<template>
  <div class="adicionarUnidade">
    <Breadcrumb :path="[{text:'Dashboard', url:'/'}, {text:'Unidades', url:'/unidades'}, {text: 'Adicionar Unidade'}]" />
    <h1 v-if="$route.query.id">Editar Unidade</h1>
    <h1 v-else>Adicionar Unidade</h1>
  
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

        <!-- <b-form-group
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
        </b-form-group> -->

        <b-button type="submit" variant="primary">Salvar</b-button>
    </b-form>
  </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Breadcrumb from '@/components/includes/Breadcrumb';

export default {
    name: 'AdicionarUnidade',
    components: { Breadcrumb },
    data: function() {
        return {
            form: {
                nome: '',
                distrito: null,
                status: 'ATIVO',
                _isDeleted: false,
            },
            distritos: [ { text: 'Selecione...', value: null }, 'Norte I', 'Norte II', 'Sul', 'Leste', 'Oeste' ],
        }
    },
     methods: {
        onSubmit(evt) {
            evt.preventDefault();
            console.log(JSON.stringify(this.form));
            const url = `${baseApiUrl}/v2/unidades`;
            console.log(url);

            axios.post(url, this.form).then(res => {
                this.$router.push({ name: 'unidade', params: { id: res.data } })
                this.$toasted.global.defaultSuccess();
            }).catch(showError)
        },
    },
    mounted() {
        //TODO deveria ter um spining loading 
        // modo de edição
        if(this.$route.query.id) {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.query.id}`;
            axios.get(url).then(res => {
                this.form = res.data;
            }).catch(showError)
        }
    }
}
</script>

<style>

</style>