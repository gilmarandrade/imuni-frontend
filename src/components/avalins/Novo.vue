<template>
    <div>
         <iframe id="iframe-formulario" src="https://docs.google.com/forms/d/e/1FAIpQLSdDuf8lm8n4_coFF08dAFc6QeY84AJpDFGpohaympZq7KGDKA/viewform?embedded=true" width="100%" height="100%" frameborder="0" marginheight="0" marginwidth="0">Carregando…</iframe>
    </div>
</template>

<script>
    export default {
        name: 'Novo',
    }
</script>

<style>

    #iframe-formulario {
        position: absolute;
        width: 100%;
        height: calc(100% - 50px);
        left: 0;

        /* border: 1px solid red; */
        /* background: rgba(255, 0, 0, 0.281); */
    }
</style>