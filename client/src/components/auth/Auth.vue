<template>
    <div class="auth-content">
        <div class="auth-modal">
            <div class="auth-title">Login</div>
            <input v-model="user.email" name="email" placeholder="E-mail" type="email">
            <input v-model="user.password" name="password" placeholder="Senha" type="password">
            <button @click="login">Entrar</button>
            <router-link to="/forgot">Esqueceu a senha?</router-link>
        </div>
    </div>
</template>

<script>
import { baseApiUrl, showError, userKey } from '@/global';
import axios from 'axios';
//TODO quando o usuario esta logado ele está conseguindo acessar a tela de login e fazer login novamente
export default {
    name: 'Auth',
    data: function() {
        return {
            user: {}
        }
    },
    methods: {
        login() {
            axios.post(`${baseApiUrl}/v2/login`, this.user)
                .then(res => {
                    this.$store.commit('setUser', res.data);
                    localStorage.setItem(userKey, JSON.stringify(res.data));
                    this.$router.push({ path: '/'});
                    // //TODO esse é o local de redirecionar dependendo do role?
                    // if(res.data.role === 'VIGILANTE') {
                    //     this.$router.push({ name: 'vigilanteHome', params: { vigilanteId: res.data.id, vigilanteNome: res.data.name } });
                    // } else {
                    //     this.$router.push({ path: '/'});
                    // }
                })
                .catch(showError);
        } 
    }
}
</script>

<style>
    .auth-content {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .auth-modal {
        width: 350px;
        padding: 35px;
        box-shadow: 0 1px 5px rgba(0,0,0,0.15);

        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .auth-title {
        font-size: 1.2rem;
        margin-bottom: 15px;
    }

    .auth-modal input {
        border: 1px solid #bbb;
        width: 100%;
        margin-bottom: 15px;
        padding: 3px 8px;
    }

    .auth-modal button {
        align-self: flex-end;
        background-color: #2460ae;
        color: white;
        padding: 5px 15px;
        border: none;
    }
</style>