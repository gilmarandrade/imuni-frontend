<template>
  <footer class="footer">
      <span>Monitoramento de Idosos | Frente de Prevenção ao COVID-19 no RN | {{appVersion}} </span>
  </footer>
</template>

<script>
export default {
    name: 'Footer',
    computed: {
        appVersion() {
            return this.$store.getters.appVersion;
        }
    }
}
</script>

<style>
    .footer {
        grid-area: footer;
        background-color: #ddd;
        color: #333;

        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 10px;
    }
</style>