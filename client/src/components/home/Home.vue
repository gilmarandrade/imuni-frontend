<template>
    <div class="home">
        <PageTitle icon="" main="Home" sub="Bem vindo ao sistema de monitoramento" />
        <!-- <h2>Planilhas</h2>
        <ul>
            <li>
                <router-link to="/googlesheets/idosos">Idosos Spreadsheet</router-link>
            </li>
            <li>
                <router-link to="/googlesheets/gerenciamento">Gerenciamento Spreadsheet</router-link>
            </li>
        </ul> -->
        <div v-if="user.role === 'ADMINISTRADOR'">
            <ul>
                <li><router-link to="/unidades">unidades</router-link></li>
                <li><router-link to="/administradores">administradores</router-link></li>
            </ul>
        </div>
        <div v-if="user.role === 'VIGILANTE'">
            <h2>Seja bem vindo vigilante</h2>
            <router-link :to="'/meusIdosos/com-escalas'">Meus idosos</router-link>
        </div>
        <div v-if="user.role === 'PRECEPTOR'">
            <h2>Seja bem vindo preceptor</h2>
            <router-link :to="'/meusIdosos/com-escalas'">Meus idosos</router-link>
        </div>
    </div>
</template>

<script>
import PageTitle from '../template/PageTitle';
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
import { mapState } from 'vuex';

export default {
    name: 'Home',
    components: { PageTitle },
    data: function() {
        return {
            vigilantes: [],
            unidades: [],
        }
    },
    methods: {
        loadVigilantes() {
            const url = `${baseApiUrl}/unidades/idunidade/vigilantes`;
            console.log(url);

            axios.get(url).then(res => {
                this.vigilantes = res.data
                console.log(this.vigilantes)
            }).catch(showError)
        },
        loadUnidades() {
            const url = `${baseApiUrl}/unidades`;
            console.log(url);

            axios.get(url).then(res => {
                this.unidades = res.data
                console.log(this.unidades)
            }).catch(showError)
        }
    },
    computed: mapState(['user']),
    mounted() {
        if(this.user.role === 'ADMINISTRADOR') {
            this.loadVigilantes();
            this.loadUnidades();
        }
    }
}
</script>

<style>

</style>