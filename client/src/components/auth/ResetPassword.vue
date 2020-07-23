<template>
    <div class="auth-content">
        <div class="auth-modal">
            <div class="auth-title">Alterar Senha</div>
            <input v-model="user.password" name="password" placeholder="Nova Senha" type="password" required="true">
            <input v-model="user.confirmPassword" name="confirmPassword" placeholder="Repetir Senha" type="password" required="true">
            <button @click="salvar">Salvar</button>
        </div>
    </div>
</template>

<script>
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';
export default {
    name: 'ResetPassword',
    data: function() {
        return {
            user: {
                _id: this.$route.params.id,
                resetPasswordToken: this.$route.params.token,
            }
        }
    },
    methods: {
        async validateResetToken() {
            const res = await axios.post(`${baseApiUrl}/validateResetToken`, { _id: this.$route.params.id, token: this.$route.params.token } );
            if(res.data === false) {
                showError('token expirado')
                // window.location.href = window.location.origin;
            }
        },
        salvar() {
            axios.post(`${baseApiUrl}/resetPassword`, this.user)
                .then(res => {
                    console.log(res.data)
                    // this.$toasted.global.defaultSuccess({msg: res.data});
                    window.location.href = window.location.origin;
                })
                .catch(showError);
        } 
    },
    mounted() {
        this.validateResetToken();
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