 
const ObjectId = require('mongodb').ObjectID;
const atendimentoService = require('../service/atendimentoService');
const vigilanteService = require('../service/vigilanteService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {

    const idososByUser = async (req, res) => {
        console.log('idosos by user' + req.params.usuarioId)
        //TODO futuramente deverá ser pelo id
        const usuarioId = req.params.usuarioId;
        const collectionPrefix = req.params.unidadeId;

        try {
            const result = await idosoService.findAllByUser(collectionPrefix, usuarioId, req.query.filter, req.query.sort, +req.query.page, +req.query.rowsPerPage);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err.toString());
        }
    }

    const idososByVigilante = async (req, res) => {

        //TODO futuramente deverá ser pelo id
        const nomeVigilante = req.params.vigilanteId;
        const collectionPrefix = req.params.unidadeId;

        try {
            const result = await idosoService.findAllByVigilante(collectionPrefix, nomeVigilante, req.query.filter, req.query.sort, +req.query.page, +req.query.rowsPerPage);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err.toString());//FIXIT todo catch da api deveria converte o erro para string
        }
    }

    const idoso = async (req, res) => {
        const collectionPrefix = req.params.unidadeId.replace(/[^a-zA-Z0-9]/g,'_');
        const checkValidObjectId = new RegExp("^[0-9a-fA-F]{24}$");

        const id = req.params.idosoId;

        try {
            let result;
            if(checkValidObjectId.test(id)) {
                result = await idosoService.findById(collectionPrefix, id);
            } else {
                result = await idosoService.findByNome(collectionPrefix, id);
            }
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    return { idososByUser, idososByVigilante, idoso };
};