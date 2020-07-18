<template>
  <div class="progressBar" :class="{ 'isLoading':  syncStatus.isSyncing, 'indeterminated':  syncStatus.isSyncing && syncStatus.progress == null }">
    <div class="bar" :style="{ width : syncStatus.progress+'%' }"></div> {{ syncStatus.progress }}
    {{ syncStatus }}
   </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'ProgressBar',
    computed: mapState(['syncStatus']),
}
</script>

<style>
  .progressBar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 10px;
    background: rgba(0, 0, 0, 0.452);
    /* opacity: 0; */
  }

  /* .progressBar.indeterminated,
  .progressBar.isLoading {
    opacity: 1;
  } */

  .progressBar.indeterminated {

    background: yellow;
  }

  .progressBar .bar {
    background: rgb(98, 0, 255);
    width: 0%;
    height: 100%;
    transition: none;
  }
  .progressBar.isLoading .bar {
    width: 10%;
    background: blue;
    transition: 10s width ease-out;
  } 
</style>