<template>
  <div class="loading">
      <i class="fas fa-spinner fa-pulse fa-5x"></i>
  </div>
</template>

<script>
export default {
    name: 'Loading',
}
</script>

<style>
    .loading {
        grid-area: content;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>