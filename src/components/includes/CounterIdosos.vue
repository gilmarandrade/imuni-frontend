<template>
  <span class="counterIdosos">
    {{ qtdIdosos }} idosos
  </span>
</template>

<script>
import { baseApiUrl } from '@/global';
import axios from 'axios';
import { mapState } from 'vuex';

export default {
    name: 'CounterIdosos',
    props: ['idUnidade', 'idVigilante'],
    computed: mapState(['user']),
    data: function() {
        return {
            qtdIdosos: 0,
        };
    },
    methods: {
        async countIdosos() {
            const url = `${baseApiUrl}/v2/unidades/${this.idUnidade}/vigilantes/${this.idVigilante}/idosos/count`;
            console.log(url);

            try {
                const response = await axios.get(url);
                this.qtdIdosos = response.data ? response.data.total : 0;
            } catch (error) {
                this.qtdIdosos = '?'
                console.error(error);
            }
        },
    },
    mounted() {
    //   this.getUsuarioName();
      this.countIdosos();
    }
}
</script>

<style>
    .counterIdosos {
        /* display: block; */
        /* background-color: darkgray; */
    }
</style>