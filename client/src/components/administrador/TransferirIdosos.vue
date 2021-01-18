<template>
  <div v-if="form && unidade">
    <Breadcrumb :path="[{text:'Dashboard', url:'/'}, {text: 'Unidades', url: '/unidades'}, {text: unidade.nome, url: '/unidades/' + unidade._id}, {text: 'Transferir Idosos'}]" />
    <h1>Transferir Idosos</h1>
    <h6 class="text-muted mb-3">Utilize essa funcionalidade para transferir todos os idosos de um vigilante para outro</h6>
    <b-alert show variant="warning">
        <h4 class="alert-heading">Atenção</h4>
        Só é possivel transferir idosos para vigilantes ativos.
    </b-alert>

    <b-form @submit="onSubmit">
        <b-form-group id="input-group-from" label="De" label-for="from">
            <b-form-select
            id="from"
            v-model="form.from"
            :options="fromOption"
            required
            disabled
            ></b-form-select>
        </b-form-group>
        <b-form-group id="input-group-to" label="Para" label-for="to">
            <b-form-select
            id="to"
            v-model="form.to"
            :options="vigilantesOption"
            required
            ></b-form-select>
        </b-form-group>

        <div class="mt-4">
            <b-button type="submit" variant="primary" >Transferir</b-button>
            <strong class="ml-3">
                Serão transferidos
                <CounterIdosos :idUnidade="$route.params.unidadeId" :idVigilante="$route.params.usuarioId" />
            </strong>
        </div>
    </b-form>

  </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import Breadcrumb from '@/components/includes/Breadcrumb';
import CounterIdosos from '@/components/includes/CounterIdosos';

export default {
    name: 'TransferirIdosos',
    components: { Breadcrumb, CounterIdosos },
    data: function() {
        return {
            form: {
                from: '',
                to: '',
            },
            unidade: null,
            vigilanteFrom: null,
            vigilanteTo: null,
            vigilantesOption: [{ text: 'Selecione...', value: '' }],
            fromOption: [{ text: 'Selecione...', value: '' }],
        }
    },
    methods: {
        loadUnidade() {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.unidade = res.data
            }).catch(showError)
        },
        loadVigilante() {
            const url = `${baseApiUrl}/v2/usuarios/${this.$route.params.usuarioId}`;
            console.log(url);

            axios.get(url).then(res => {
                this.form.from = res.data._id
                this.fromOption = [ 
                        { text: 'Selecione...', value: '' }, 
                        { text: res.data.name, value: res.data._id },
                    ];
            }).catch(showError)
        },
        loadVigilantesAtivos() {
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}/vigilantes`;
            console.log(url);

            axios.get(url).then(res => {
                this.vigilantesOption = [ 
                        { text: 'Selecione...', value: '' }, 
                        ...res.data.map(item => { return { text: item.name, value: item._id } } ) 
                    ];
                console.log(this.vigilantesOption)
            }).catch(showError)
        },
        onSubmit(evt) {
            evt.preventDefault();
            console.log(JSON.stringify(this.form));
            const url = `${baseApiUrl}/v2/unidades/${this.$route.params.unidadeId}/idosos/transferir`;
            console.log(url, this.form);

            axios.post(url, this.form).then( (res) => {
                console.log(res.data)
                this.$router.push({ path: `/unidades/${this.$route.params.unidadeId}`});
                // window.history.length > 1 ? this.$router.go(-1) : null;
                this.$toasted.global.defaultSuccess({ msg: 'Transferência realizada com sucesso'});
            }).catch(showError)
            console.log(evt)
        },
    },
    mounted() {
      this.loadUnidade();
      this.loadVigilante();
      this.loadVigilantesAtivos();
    }
}
</script>

<style>

</style>