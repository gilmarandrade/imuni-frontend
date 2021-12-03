<template>
  <div class="content">
      <ProgressBar></ProgressBar>
      <router-view></router-view>
  </div>
</template>

<script>
import ProgressBar from '@/components/template/ProgressBar';

export default {
    name: 'Content',
    components: {
        ProgressBar
    },
}
</script>

<style>
    .content {
        position: relative;
        grid-area: content;
        /* background-color: #efefef; */
        background-color: white;
        padding: 20px;
    }
</style>