<template>
  <div class="loading">
      <font-awesome-icon :icon="['fas', 'spinner']" size="5x" pulse />
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