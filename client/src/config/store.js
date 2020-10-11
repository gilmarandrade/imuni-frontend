import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'
import { showError } from '@/global';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        packageVersion: process.env.PACKAGE_VERSION || '0.0.0',
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
        pageParamsMap: new Map(),
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

            if(state.syncStatus.status === 'SUCCESS') {
                location.reload();
                // this.$router.go()
            } else if (state.syncStatus.status === 'ERROR' ) {
                showError(state.syncStatus.msg);

            }
        },
        setPageParamsMap(state, params){
            const userParams = state.pageParamsMap.get(params.userId)
            // console.log(userParams)
            if(userParams) {
                const tableParams = userParams.find(element => element.filter == params.filter);

                if(tableParams) {
                    tableParams.filter = params.filter;
                    tableParams.order = params.order;
                    tableParams.page = params.page;
                    tableParams.rowsPerPage = params.rowsPerPage;
                } else {
                    userParams.push({filter: params.filter, order: params.order, page: params.page, rowsPerPage: params.rowsPerPage})
                }
            } else {
                state.pageParamsMap.set(params.userId, [{filter: params.filter, order: params.order, page: params.page, rowsPerPage: params.rowsPerPage}]);
            }
        },
    },
    getters: {
        appVersion: (state) => {
            return state.packageVersion;
        },
        getPageParamsMap: (state) => {
            return state.pageParamsMap;
        },
    },
    // actions: {
    //     SOCKET_syncStatusEvent: function (data) {
    //         console.log( 'syncStatusEvent', data)
    //     }
    // }
})