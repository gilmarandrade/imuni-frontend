<template>
    <div class="atendimento" >
        <h6>//TODO BREADCRUMB / {{ $route.query.nomeIdoso }}</h6>
        <iframe id="iframe-ficha-vigilancia" 
            :src="iframeURL" 
            width="100%" height="100%" frameborder="0" marginheight="0" marginwidth="0">Carregando…</iframe>
    </div>
</template>

<script>
// import { baseApiUrl, showError } from '@/global';
// import axios from 'axios';
// import Badge from '@/components/template/Badge';
import { mapState } from 'vuex';

export default {
    name: 'CadastrarAtendimento',
    computed: mapState(['user']),
    data: function() {
        return {
            loading: false,
            iframeURL: `https://docs.google.com/forms/d/e/1FAIpQLSfLfnC9b5dKX2cZKyYec_HNTWoiK24VcUTnAePbKyxqxmK77A/viewform?entry.1400965172=${this.$route.query.idIdoso}&entry.107358182=${this.$route.query.idVigilante}&entry.1292516784=${this.$route.query.idUnidade}&entry.2065609378=${this.$route.query.tipoAtendimento}&embedded=true`
        }
    },
    methods: {
    },
    mounted() {
    }
}
</script>

<style>

    #iframe-ficha-vigilancia {
        position: absolute;
        width: 100%;
        height: calc(100% - 50px);
        left: 0;

        /* border: 1px solid red; */
        /* background: rgba(255, 0, 0, 0.281); */
    }

    #iframe-ficha-vigilancia .freebirdFormviewerViewItemsItemItem {
        background: red;
    }
</style>