
module.exports = app => {
    class Instrumento {
        constructor(origin, responseId, timestamp, authsecret, raw) {
            this.origin = origin;
            this.authsecret = authsecret;
            this.timestamp = new Date(timestamp);
            this.responseId = responseId;
            this._isDeleted = false;

            this.raw = raw;

            this.criterios = {};
            this.escalas = {};
            // console.log('Hello World ' + this.responseId);
        }

        extractResponse = (session, question) => {
            if(this.raw && session && question) {
                if(this.raw[session]) {
                    if(this.raw[session][question] && this.raw[session][question].response !== null && this.raw[session][question].response !== undefined && this.raw[session][question].response !== '') {
                        return this.raw[session][question].response;
                    }
                }
            }
            return null;
        }
        
        extractPontos = (session, question) => {
            const response = this.extractResponse(session, question);
            return response ? +(response.substring(2,3)) : 0;
        }

        calcularCriterios = () => {
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
            const array = Object.values(this.criterios);
            let total = 0;
            array.forEach(element => {
                total += element;
            });
        
            let risco = null;
        
            if(total >= 41) {
                risco = this.riscoQueda.BAIXO;
            } else if(total >= 21) {
                risco = this.riscoQueda.MEDIO;
            } else {
                risco = this.riscoQueda.ELEVADO;
            }
        
            // console.log(total)
            this.escalas = { score: risco };
        }
        
        riscoQueda = Object.freeze({
            BAIXO: 'Baixo',
            MEDIO: 'Médio',
            ELEVADO: 'Elevado',
        });

        toJsonObject = () => {
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

    }

    return { Instrumento }
}
// module.exports.Instrumento = Instrumento; 


