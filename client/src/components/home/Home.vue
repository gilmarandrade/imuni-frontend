<template>
    <div class="home">
        <Breadcrumb :path="[{text: 'Dashboard'}]"/>
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
import Breadcrumb from '@/components/includes/Breadcrumb';
import { mapState } from 'vuex';

export default {
    name: 'Home',
    components: { PageTitle, Breadcrumb },
    data: function() {
        return {
        }
    },
    methods: {
    },
    computed: mapState(['user']),
    mounted() {

    }
}
</script>

<style>

</style>