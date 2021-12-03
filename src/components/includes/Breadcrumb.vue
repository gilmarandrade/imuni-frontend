<template>
  <div class="breadcrumb">
    <ul>
        <li v-for="(item, index) in path" :key="item.text">
            <font-awesome-icon v-if="index > 0" :icon="['fas', 'angle-right']" class="mx-2" />
            <router-link v-if="item.url" :to="item.url" :title="item.text">{{ item.text }}</router-link>
            <span v-else>{{ item.text }}</span>
        </li>
    </ul>
  </div>
</template>

<script>

export default {
    name: 'Breadcrumb',
    props: ['path'],
}
</script>

<style>
    .breadcrumb {
        background-color: transparent !important;
        color: black;
        font-size: 12px;
        padding: 0 !important;
        margin: 0;
        opacity: .6;
    }

    .breadcrumb ul {
        padding: 0;
        margin: 0;
        list-style: none;
    }

    .breadcrumb li {
        display: inline;
    }

    .breadcrumb a {
        color: black;
    }
</style>