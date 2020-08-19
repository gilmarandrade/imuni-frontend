 
const ObjectId = require('mongodb').ObjectID;
const atendimentoService = require('../service/atendimentoService');
const vigilanteService = require('../service/vigilanteService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {

    const atendimentosByIdoso = async (req, res) => {
        //TODO futuramente deverá ser pelo id
        const collectionPrefix = req.params.unidadeId.replace(/[^a-zA-Z0-9]/g,'_');
        const nomeLower = req.params.idosoId;

        try {
            const result = await atendimentoService.findAllByIdoso(collectionPrefix, nomeLower);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    const atendimento = async (req, res) => {
        const collectionPrefix = req.params.unidadeId.replace(/[^a-zA-Z0-9]/g,'_')
        const id = req.params.id;

        try {
            const result = await atendimentoService.findById(collectionPrefix, id);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }




    return { atendimentosByIdoso, atendimento };
};