<template>
  <div class="form-response">
    <b>{{ item.question.substring(9)  }}</b>
    <small class="text-muted">
    {{ item.question.substring(0, 8)  }}
    </small>
    <div v-if="Array.isArray(item.response)">
        <ul>
            <li v-for="elem in item.response" :key="elem">
                {{ elem }}
            </li>
        </ul>
    </div>
    <div v-else-if="item.response">
        {{ item.response }}
    </div>
    <div v-else>
        -
    </div>
  </div>
</template>

<script>
export default {
    name: 'FormResponse',
    props: ['item']
}
</script>

<style scopped>
    .form-response {
        /* border: 1px solid red; */
        margin-bottom: 15px;
    }

    .form-response ul {
        margin: 0;
    }

</style>