import Vue from 'vue';

export const userKey = '__frente_prevencao_covid_rn';
export const environment = require('../environment');
export const baseApiUrl = require('../environment').api;
export const node_env = require('../environment').node_env;
// export const baseApiUrl = process.env.baseApiUrl ? process.env.baseApiUrl : 'http://localhost:3000';
console.log('environment: ', environment);
export function showError(e) {
    if(e && e.response && e.response.data) {
        Vue.toasted.global.defaultError({ msg: e.response.data});
    } else if(typeof e === 'string') {
        Vue.toasted.global.defaultError({ msg: e});
    } else {
        Vue.toasted.global.defaultError();
    }
}

export default { baseApiUrl, showError, userKey }