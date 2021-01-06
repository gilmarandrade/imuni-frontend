<template>
    <div class="atendimento" >
        <h6>//TODO BREADCRUMB / {{ $route.query.nomeIdoso }}</h6>
        <iframe id="iframe-ficha-vigilancia" 
            :src="iframeURL" 
            width="100%" height="100%" frameborder="0" marginheight="0" marginwidth="0">Carregando…</iframe>
    </div>
</template>

<script>
import { googleFormIframeURL } from '@/global';
// import axios from 'axios';
// import Badge from '@/components/template/Badge';
import { mapState } from 'vuex';

export default {
    name: 'CadastrarAtendimento',
    computed: mapState(['user']),
    data: function() {
        return {
            loading: false,
            iframeURL: googleFormIframeURL(this.$route.query.idIdoso, this.$route.query.idVigilante, this.$route.query.idUnidade, this.$route.query.tipoAtendimento),
        }
    },
    methods: {
        googleFormIframeURL,
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