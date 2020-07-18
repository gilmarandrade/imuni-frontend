<template>
  <div class="badge" :class="color">
      {{ value }}
  </div>
</template>

<script>
export default {
    name: 'Badge',
    props: ['value'],
    computed: {
        color() {
            switch(this.value) {
                case 'baixo':
                case 'Baixo':
                    return 'green';
                case 'médio':
                case 'Médio':
                    return 'yellow';
                case 'alto':
                case 'Alto':
                    return 'red';

                case '0 - Sem vulnerabilidades':
                case 'O - Sem Vulnerabilidade':
                    return 'blue';
                case 'A - vulnerabilidade financeira':
                case 'A - Vulnerabilidade Financeira':
                case 'B - vulnerabilidade alimentar':
                case 'B - Vulnerabilidade Alimentar':
                    return 'yellow';
                case 'C - Situação de violência':
                case 'C - situação de violência':
                    return 'red';

                case 'Ia - Assintomático, mora com assintomáticos':
                case 'Ib - Assintomático, mas vive sozinho':
                    return 'blue';
                case 'IIa - Assintomático, mas sai de casa':
                case 'IIb - Assintomático, mas recebe visitas ou domiciliares saem':
                case 'IIIa - Assintomático, mas com comorbidades':
                    return 'green';
                case 'IIIb - Assintomático, mas tem contato com sintomáticos ou confirmados':
                case 'IVa - Assintomático, mas sem medicações':
                    return 'yellow';
                case 'IVb - Idoso sintomático':
                    return 'red';

                case '0 - Não atendeu à ligação':
                default:
                    return 'gray'; 
            }
        }
    }
}
</script>

<style>
    .badge {
        background-color: darkgray;
        color: white;
    }

    .badge.red {
        background-color: rgb(235, 87, 87);
    }

    .badge.green {
        background-color: rgb(39, 174, 96);
    }

    .badge.blue {
        background-color: rgb(45, 156, 219);
    }

    .badge.yellow {
        background-color: rgb(242, 201, 76);
    }

    .badge.gray {
        background-color: rgb(96, 96, 96);
    }
</style>