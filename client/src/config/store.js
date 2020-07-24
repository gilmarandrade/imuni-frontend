import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        isMenuVisible: false,
        user: null,
        isLoadingApp: true,
        syncStatus: { 
            isSyncing: false,
            progress: 0,
        },
    },
    mutations: {
        toggleMenu(state, isVisible) {
            if(!state.user) {
                state.isMenuVisible = false;
                return;
            }

            if(isVisible === undefined) {
                state.isMenuVisible = !state.isMenuVisible;
            } else {
                state.isMenuVisible = isVisible;
            }
        },
        setUser(state, user){
            state.user = user;
            if(user) {
                axios.defaults.headers.common['Authorization'] = `bearer ${user.token}`;
                // state.isMenuVisible = true;
            } else {
                delete axios.defaults.headers.common['Authorization'];
                // state.isMenuVisible = false;
            }
        },
        setIsLoadingApp(state, isLoading){
            state.isLoadingApp = isLoading;
        },
        SOCKET_syncStatusEvent(state, data){
            // console.log( 'syncStatusEvent', data);
            state.syncStatus = data;

            if(state.syncStatus.isSyncing === false && state.syncStatus.progress === 100) {
                location.reload();
                // this.$router.go()
                // this.$toasted.global.defaultSuccess();
            }
        }
    },
    // actions: {
    //     SOCKET_syncStatusEvent: function (data) {
    //         console.log( 'syncStatusEvent', data)
    //     }
    // }
})