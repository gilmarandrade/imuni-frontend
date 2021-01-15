
module.exports = app => {
    class Instrumento {
        constructor(origin, responseId, timestamp, authsecret, raw) {
            if (new.target === Instrumento) {
                throw new TypeError("Cannot construct " + new.target.name + " instances directly");
            }

            this.origin = origin;
            this.authsecret = authsecret;
            this.timestamp = new Date(timestamp);
            this.responseId = responseId;
            this._isDeleted = false;

            this.raw = raw;

            this.criterios = {};
            this.escalas = {};
            console.log('[Instrumento] ' + this.responseId);
        }

        /**
         * Extrai uma resposta bruta do array de respostas
         * @param {*} session identificador da seção no form. Ex: 'S03'
         * @param {*} question identificador da questão na seção. Ex: 'Q06'
         * @returns null ou String
         */
        extractResponse = (session, question) => {
            if(this.raw && session && question) {
                if(this.raw[session]) {
                    if(this.raw[session][question] && this.raw[session][question].response !== null && this.raw[session][question].response !== undefined && this.raw[session][question].response !== '') {
                        return this.raw[session][question].response;
                    }
                }
            }
            return null;
        };

        /**
         * Extrai uma resposta e converte para Number
         * @param {*} session 
         * @param {*} question 
         * @returns Number ou null
         */
        extractNumber = (session, question) => {
            const response = this.extractResponse(session, question);
            return response ? +response : null;
        }

        // /**
        //  * Retorna um booleano se o valor recebido é equivalente a trueValue.
        //  * 
        //  * Se falseValue também for informado:
        //  * retorna false caso o valor recebido seja equivalente a falseValue, e retorna null se o valor recebido for diferente de ambos 
        //  * @param {*} session 
        //  * @param {*} question 
        //  * @param {*} trueValue 
        //  * @param {*} falseValue 
        //  * @return Boolean ou null
        //  */
        // extractBoolean = (session, question, trueValue, falseValue) => {
        //     if(falseValue !== undefined) {
        //         const response = this.extractResponse(session, question);
        //         if(response == trueValue) {
        //             return true;
        //         } else if(response == falseValue){
        //             return false;
        //         } else {
        //             return null;
        //         }
        //     }
        //     return this.isEquals(session, question);
        // }

        /**
         * Retorna true se a resposta for igual a trueValue
         * @param {*} session 
         * @param {*} question 
         * @param {*} trueValue 
         * @return Boolean
         */
        isEquals = (session, question, trueValue) => {
            return this.extractResponse(session, question) == trueValue;
        }

        /**
         * Retorna false caso a resposta seja igual ao falseValue
         * @param {*} session 
         * @param {*} question 
         * @param {*} falseValue 
         * @return Boolean
         */
        isNotEquals = (session, question, falseValue) => {
            return !this.isEquals(session, question, falseValue);
        }

        // /**
        //  * Extrai uma resposta de multipla escolha
        //  * Retorna um array vazio se o primeiro item da lista for igual a 'Não'
        //  * @param {*} session 
        //  * @param {*} question 
        //  * @return Array
        //  */
        // extractRequiredList = (session, question) => {
        //     const response = this.extractResponse(session, question);

        //     if(Array.isArray(response)) {
        //         if(response.length > 0 && response[0] == 'Não') {
        //             return [];
        //         }
        //         return response;
        //     }

        //     return [];
        // }


        calcularCriterios = () => {
            console.log('[Instrumento] calcular criterios');
            throw new TypeError("Must override method calcularCriterios");
        }

        calcularEscalas = () => {
            console.log('[Instrumento] calcular escalas');
            throw new TypeError("Must override method calcularEscalas");
        }

        get toObject() {
            return {
                origin: this.origin,
                authsecret: this.authsecret,
                timestamp: this.timestamp,
                responseId: this.responseId,
                _isDeleted: this._isDeleted,
                raw: this.raw,
                criterios: this.criterios,
                escalas: this.escalas,
            }
        }

        calcular = () => {
            console.log('[Instrumento] calcular');
            this.calcularCriterios();
            this.calcularEscalas();
        }

    }

    class EscalaEquilibrioBerg extends Instrumento {
        constructor(origin, responseId, timestamp, authsecret, raw) {
            super(origin, responseId, timestamp, authsecret, raw);
            this.name = 'EscalaEquilibrioBerg';
 
            console.log('[' + this.name + '] ' + this.responseId);
        }
        
        extractPontos = (session, question) => {
            const response = this.extractResponse(session, question);
            return response ? +(response.substring(2,3)) : 0;
        }

        calcularCriterios = () => {
            console.log('[' + this.name + '] ' + ' calcular criterios');
            this.criterios = {
                c1: this.extractPontos('S02','Q01'),
                c2: this.extractPontos('S02','Q02'),
                c3: this.extractPontos('S02','Q03'),
                c4: this.extractPontos('S02','Q04'),
                c5: this.extractPontos('S02','Q05'),
                c6: this.extractPontos('S02','Q06'),
                c7: this.extractPontos('S02','Q07'),
                c8: this.extractPontos('S02','Q08'),
                c9: this.extractPontos('S02','Q09'),
                c10: this.extractPontos('S02','Q10'),
                c11: this.extractPontos('S02','Q11'),
                c12: this.extractPontos('S02','Q12'),
                c13: this.extractPontos('S02','Q13'),
                c14: this.extractPontos('S02','Q14'),
            };
        }
        
        calcularEscalas = () => {
            console.log('[' + this.name + '] ' + ' calcular escalas');
            const array = Object.values(this.criterios);
            let total = 0;
            array.forEach(element => {
                total += element;
            });
        
            let risco = null;
        
            if (total >= 41) {
                risco = EscalaEquilibrioBerg.riscoQueda.BAIXO;
            } else if (total >= 21) {
                risco = EscalaEquilibrioBerg.riscoQueda.MEDIO;
            } else {
                risco = EscalaEquilibrioBerg.riscoQueda.ELEVADO;
            }
        
            // console.log(total)
            this.escalas = { score: risco };
        }
        
        static riscoQueda = Object.freeze({
            BAIXO: 'Baixo',
            MEDIO: 'Médio',
            ELEVADO: 'Elevado',
        });

    }

    return { Instrumento, EscalaEquilibrioBerg }
}


