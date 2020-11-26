import Vue from 'vue';

export const userKey = '__frente_prevencao_covid_rn';
export const baseApiUrl = process.env.VUE_APP_API;

export function showError(e) {
    if(e && e.response && e.response.data) {
        console.error(e.response.data)
        Vue.toasted.global.defaultError({ msg: e.response.data});
    } else if(typeof e === 'string' || typeof e === 'object') {
        console.error(e)
        Vue.toasted.global.defaultError({ msg: e});
    } else {
        Vue.toasted.global.defaultError();
    }
}

export default { baseApiUrl, showError, userKey }