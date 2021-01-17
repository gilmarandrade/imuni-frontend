<template>
  <header class="header">
        <h1 class="title"> {{ title }} 
            <span v-if="appMode == 'TEST'" class="badge bg-danger">MODO TESTE</span>
        </h1>
        <UserDropdown v-if="!hideUserDropdown" />
  </header>
</template>

<script>
import UserDropdown from './UserDropdown';
import { appMode } from '@/global';
// import axios from 'axios';

export default {
    name: 'Header',
    components: { UserDropdown },
    data: function() {
        return {
            appMode: appMode,
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
</style>