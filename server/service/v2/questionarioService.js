/**
 * Extração de valores das respostas do google form
 */

module.exports = app => {

    /**
     * Extrai uma resposta do array de respostas
     * @param {*} session identificador da seção no form. Ex: 'S03'
     * @param {*} question identificador da questão na seção. Ex: 'Q06'
     * @param {*} fichaVigilancia array com respostas do questionário
     * @returns null ou String
     */
    const extractResponse = (session, question, fichaVigilancia) => {
        if(fichaVigilancia && session && question) {
            if(fichaVigilancia[session]) {
                if(fichaVigilancia[session][question] && fichaVigilancia[session][question].response !== null && fichaVigilancia[session][question].response !== undefined && fichaVigilancia[session][question].response !== '') {
                    return fichaVigilancia[session][question].response;
                }
            }
        }
        return null;
    };

    /**
     * Extrai uma resposta e converte para Number
     * @param {*} session 
     * @param {*} question 
     * @param {*} fichaVigilancia 
     * @returns Number ou null
     */
    const extractNumber = (session, question, fichaVigilancia) => {
        const response = extractResponse(session, question, fichaVigilancia);
        return response ? +response : null;
    }

    /**
     * Retorna um booleano se o valor recebido é equivalente a trueValue.
     * 
     * Se falseValue também for informado:
     * retorna false caso o valor recebido seja equivalente a falseValue, e retorna null se o valor recebido for diferente de ambos 
     * @param {*} session 
     * @param {*} question 
     * @param {*} fichaVigilancia 
     * @param {*} trueValue 
     * @param {*} falseValue 
     * @return Boolean ou null
     */
    const extractBoolean = (session, question, fichaVigilancia, trueValue, falseValue) => {
        if(falseValue !== undefined) {
            const response = extractResponse(session, question, fichaVigilancia);
            if(response == trueValue) {
                return true;
            } else if(response == falseValue){
                return false;
            } else {
                return null;
            }
        }
        return isEquals(session, question, fichaVigilancia);
    }

    /**
     * Retorna true se a resposta for igual a trueValue
     * @param {*} session 
     * @param {*} question 
     * @param {*} fichaVigilancia 
     * @param {*} trueValue 
     * @return Boolean
     */
    const isEquals = (session, question, fichaVigilancia, trueValue) => {
        return extractResponse(session, question, fichaVigilancia) == trueValue;
    }


    /**
     * Retorna false caso a resposta seja igual ao falseValue
     * @param {*} session 
     * @param {*} question 
     * @param {*} fichaVigilancia 
     * @param {*} falseValue 
     * @return Boolean
     */
    const isNotEquals = (session, question, fichaVigilancia, falseValue) => {
        return !isEquals(session, question, fichaVigilancia, falseValue);
    }

    /**
     * Extrai uma resposta de multipla escolha
     * Retorna um array vazio se o primeiro item da lista for igual a 'Não'
     * @param {*} session 
     * @param {*} question 
     * @param {*} fichaVigilancia 
     * @return Array
     */
    const extractRequiredList = (session, question, fichaVigilancia) => {
        const response = extractResponse(session, question, fichaVigilancia);

        if(Array.isArray(response)) {
            if(response.length > 0 && response[0] == 'Não') {
                return [];
            }
            return response;
        }

        return [];
    }

    

    return { extractResponse, extractNumber, extractBoolean, isEquals, isNotEquals, extractRequiredList }
};