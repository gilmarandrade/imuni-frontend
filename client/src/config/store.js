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
            mode: 'INDETERMINATED', //INDETERMINATED, DETERMINATED
            status: null, //null, LOADING, SUCCESS, ERROR
            progress: null,
            total: null,
            current: 0,
            msg: '',
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

            if(state.syncStatus.status === 'SUCCESS' || state.syncStatus.status === 'ERROR' ) {
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