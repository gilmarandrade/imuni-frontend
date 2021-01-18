<template>
    <div class="auth-content">
        <div class="auth-modal">
            <div class="auth-title">Aceitar convite</div>
            <p>crie uma senha</p>
            <input v-model="user.password" name="password" placeholder="Senha" type="password" required="true">
            <input v-model="user.confirmPassword" name="confirmPassword" placeholder="Repetir Senha" type="password" required="true">
            <button @click="salvar">Salvar</button>
        </div>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
export default {
    name: 'AcceptInvitation',
    data: function() {
        return {
            user: {
                _id: this.$route.params.id,
                invitationToken: this.$route.params.token,
            }
        }
    },
    methods: {
        salvar() {
            axios.post(`${baseApiUrl}/v2/acceptInvite`, this.user)
                .then(res => {
                    console.log(res.data)
                    // this.$toasted.global.defaultSuccess({msg: res.data});
                    //TODO mensagem de cadastro realizado com sucesso não está aparecendo...
                    window.location.href = window.location.origin;
                })
                .catch(showError);
        } 
    },
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