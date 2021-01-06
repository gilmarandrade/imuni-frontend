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

export function novoAtendimentoURL(idoso, user) {
    return `/unidades/${idoso.unidadeId}/cadastrarAtendimento?idIdoso=${idoso._id}&idVigilante=${user.id}&idUnidade=${idoso.unidadeId}&nomeIdoso=${idoso.nome}&tipoAtendimento=${idoso.estatisticas && idoso.estatisticas.count.qtdAtendimentosEfetuados > 0 ? 'Acompanhamento' : 'Primeiro atendimento'}`;
}

export function googleFormIframeURL(idIdoso, idVigilante, idUnidade, tipoAtendimento) {
    return `https://docs.google.com/forms/d/e/1FAIpQLSfLfnC9b5dKX2cZKyYec_HNTWoiK24VcUTnAePbKyxqxmK77A/viewform?entry.1400965172=${idIdoso}&entry.107358182=${idVigilante}&entry.1292516784=${idUnidade}&entry.2065609378=${tipoAtendimento}&embedded=true`;
}

export function formatDate(date) {
    return new Date(date).toLocaleString();
}

export default { baseApiUrl, showError, userKey, novoAtendimentoURL, formatDate }