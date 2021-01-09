<template>
  <div class="adicionarUnidade">
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
  </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Breadcrumb from '@/components/includes/Breadcrumb';

export default {
    name: 'MigrarUnidade',
    components: { Breadcrumb },
    data: function() {
        return {
            form: {
                nome: '',
                distrito: null,
                _isDeleted: false,
                status: 'ATIVO',
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
        }
    },
     methods: {
        onSubmit(evt) {
            evt.preventDefault();
            console.log(JSON.stringify(this.form));
            const url = `${baseApiUrl}/v2/migracao/unidades`;
            console.log(url);

            axios.post(url, this.form).then(res => {
                this.$router.push({ name: 'unidade', params: { id: res.data } })
                this.$toasted.global.defaultSuccess();
            }).catch(showError)
        },
    },
    mounted() {
        // modo de edição
        // if(this.$route.query.id) {
        //     const url = `${baseApiUrl}/v2/unidades/${this.$route.query.id}`;
        //     axios.get(url).then(res => {
        //         this.form = res.data;
        //     }).catch(showError)
        // }
    }
}
</script>

<style>

</style>