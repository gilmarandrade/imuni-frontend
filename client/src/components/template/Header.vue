<template>
  <header class="header">
        <a href="#" class="toggle" @click="toggleMenu" v-show="!hideToggle && isMenuVisible">
            <i class="fa fa-lg fa-angle-left"></i>
        </a>
        <a href="#" class="toggle" @click="toggleMenu" v-show="!hideToggle && !isMenuVisible">
            <i class="fa fa-lg fa-angle-down" ></i>
        </a>
        <h1 class="title">
            <router-link to="/"> {{ title }}</router-link>
        </h1>
        <button class="btnSync" title="Sincronizar com planilhas" @click="sync">
            <span v-show="syncState == 'error'">
                <i class="fas fa-exclamation-circle"></i>
                <span>erro de sincronização</span>
            </span>
            <span v-show="syncState == 'synced'">
                <i class="fas fa-sync"></i>
                <span>{{ formatDate(lastSync) }}</span>
            </span>
            <span v-show="syncState == 'syncing'">
                <i class="fas fa-sync fa-spin"></i>
                <span>sincronizando</span>
            </span>
        </button>
        <UserDropdown v-if="!hideUserDropdown" />
  </header>
</template>

<script>
import UserDropdown from './UserDropdown';
import { baseApiUrl, showError } from '@/global';
import axios from 'axios';

export default {
    name: 'Header',
    components: { UserDropdown },
    data: function() {
        return {
            syncState: 'synced',
            lastSync: '00/00/0000 00:00',
        }
    },
    props: {
        title: String,
        hideToggle: Boolean,
        hideUserDropdown: Boolean,
    },
    computed: {
        isMenuVisible() {
            return this.$store.state.isMenuVisible;
        }
    },
    methods: {
        toggleMenu() {
            this.$store.commit('toggleMenu');
        },
        sync() {
            this.syncState = 'syncing';
            const url = `${baseApiUrl}/sync/100`;
            console.log(url, this.syncState);
            axios.get(url).then(res => {
                console.log(res.data)
                this.syncState = 'synced';
                this.lastSync = res.data.time;
                //TODO em caso de sucesso recarregar a página
            }).catch((err) => {
                console.log(err);
                this.syncState = 'error';
                showError(err);
            })
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
    }
}
</script>

<style>
    .header {
        grid-area: header;
        background: linear-gradient(to right, #1e469a, #49a7c1);

        display: flex;
        justify-content: center;
        align-items: center;
    }

    .title {
        font-size: 1.2rem;
        color: white;
        font-weight: 100;
        flex-grow: 1;
        text-align: center;
    }

    .title a {
        color: #fff;
        text-decoration: none;
    }
    .title a:hover {
        color: #fff;
        text-decoration: none;
    }

    header.header > a.toggle {
        width: 60px;
        height: 100%;
        color:#fff;
        justify-self: flex-start;
        text-decoration: none;

        display: flex;
        justify-content: center;
        align-items: center;

    }

    header.header > a.toggle:hover {
        background-color: rgba(0,0,0,0.4);   
    }

    .btnSync {
        border: none;
        position: relative;
        height: 100%;
        padding: 0 20px;
        align-items: center;
        color: white;
        font-weight: 100;
        background-color: transparent;
    }

    .btnSync span {
        margin: 0 5px;
    }

    .btnSync:hover {
        background-color: rgba(0,0,0,0.2);
    }
</style>