<template>
  <div class="progressBar" :class="{ 'isLoading':  syncStatus.status === 'LOADING', 'indeterminated':  syncStatus.mode === 'INDETERMINATED' }">
    <div class="bar" :style="{ width : syncStatus.progress+'%' }"></div>
    <!-- {{ syncStatus.progress }} -->
    <!--v-show="syncStatus.isSyncing"-->
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
  @keyframes indeterminated1 {
    0% {left: -30%; width: 30%;}
    30% {left: -30%; width: 30%;}
    40% { width: 30%; }
    80% {left: 100%; width: 80%;}
    100% {left: 100%; width: 80%;}
  }
  @keyframes indeterminated2 {
    0% {left: -50%;}
    30% {left: -50%; width: 50%;}
    80% {left: 100%;}
    100% {left: 100%; width: 30%;}
  }

  .progressBar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 6px;
    background: rgba(0, 0, 0, 0.21);
    overflow: hidden;
    /* opacity: 0; */
  }

  /* .progressBar.indeterminated,
  .progressBar.isLoading {
    opacity: 1;
  } */

  .progressBar .bar {
    background: rgb(98, 0, 255);
    width: 0%;
    height: 100%;
    /* transition: none; */
  }

  .progressBar {
    opacity: 0;
  }

  .progressBar.isLoading {
    opacity: 1;
  }

  .progressBar.isLoading .bar {
    /* width: 10%; */
    /* background: blue; */
    /* transition: 10s width ease-out; */
  } 

  .progressBar.indeterminated {
    background:rgba(98, 0, 255, 0.21);
  }

  .progressBar.indeterminated::before {
    background: rgb(98, 0, 255);
    /* background: #29B6F6; */
    width: 30%;
    height: 100%;
    content: '';
    /* display: block; */
    position: absolute;
    top:0;
    left: -30%;
    animation-name: indeterminated1;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    /* animation-direction: alternate; */
    animation-timing-function: ease-in;
  }

  .progressBar.indeterminated::after {
    background:rgb(98, 0, 255);
    /* background: #29B6F6; */
    width: 50%;
    height: 100%;
    content: '';
    /* display: block; */
    position: absolute;
    top:0;
    left: -50%;
    animation-name: indeterminated2;
    animation-duration: 4s;
    animation-iteration-count: infinite;
    /* animation-direction: alternate; */
    animation-timing-function: ease-in;
    /* animation-delay: 3s; */
  }
</style>