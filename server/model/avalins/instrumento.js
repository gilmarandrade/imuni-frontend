
module.exports = app => {
    class Instrumento {
        constructor(nome) {
            this.nome = nome;
            console.log('Hello World ' + this.nome);
        }

    }

    return { Instrumento }
}
// module.exports.Instrumento = Instrumento; 


