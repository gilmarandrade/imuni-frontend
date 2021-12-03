<template>
  <span class="banner">
    <h1 class="mb-4">Seja bem vindo!</h1>
    
    <p>Este é o <strong>Sistema IMUNI</strong> (Inteligência de Monitoramento Unificado), o novo sistema de televigilância de idosos para prevenção do COVID-19 em Natal/RN.</p>
    <p>Seu usuário e senha permanecem os mesmos do sistema antigo (se você já tiver cadastro). Se ainda não tiver cadastro, solicite a um administrador do projeto.</p>
    <p>Leia a <a target="_blank" href="https://www.notion.so/gilmarandrade/Wiki-IMUNI-v2-7-11987949af694849be026da8caaa2fac">Seção de Ajuda</a> para saber das novidades.</p>
  </span>
</template>

<script>


export default {
    name: 'Banner',
}
</script>

<style scopped>
    .banner {
            max-width: 1000px;
            margin: 50px auto;
            padding: 30px;
            background: rgb(198 232 242);
            border-radius: 6px;
            border: 3px solid #1e469a;
            color: #1e469a;
    }
    
</style>