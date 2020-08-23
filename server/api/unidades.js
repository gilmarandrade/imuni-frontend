 
const ObjectId = require('mongodb').ObjectID;
const atendimentoService = require('../service/atendimentoService');
const vigilanteService = require('../service/vigilanteService');
const idosoService = require('../service/idosoService');
const unidadeService = require('../service/unidadeService');
const sheetsApi = require('../config/sheetsApi');


module.exports = app => {
    const get = async (req, res) => {
        // console.log('unidadeId: ', req.params.unidadeId)
        try {
            const result = await unidadeService.findAll();
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    const getById = async (req, res) => {
        try {
            const result = await unidadeService.findById(req.params.unidadeId);
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    const toggleAutoSync = async (req, res) => {
        try {
            const status = req.params.status === 'true' ? true : false;
            const result = await unidadeService.setAutoSync(req.params.unidadeId, status);
            if(status) {
                //TODO sincronizar imediatamente caso o autosync seja ativado
                // const resultSync = await app.sync.runSyncUnidade(req.params.unidadeId);//TODO totalmente errado, a sincronização agora é executada através do socket!
                // console.log(resultSync);
                // return res.json(resultSync);
            }
            return res.status(204).json();
        } catch(err) {
            console.error(err);
            return res.status(500).send(err.toString());
        }
    }

    const save = async (req, res) => {
        const getSpreadsheetId = (url) => {
            const myRegexp = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/g;
            const match = myRegexp.exec(url);
            return match ? match[1] : null;
        }

        const getFormId = (url) => {
            const myRegexp = /\/forms\/d\/([a-zA-Z0-9-_]+)/g;
            const match = myRegexp.exec(url);
            return match ? match[1] : null;
        }

        const unidade = req.body;

        try {
            //TODO a unidade não pode ter um nome que já existe
            //TODO o que acontece com a sincronização se o links das planilhas for cadastrado errado?
            app.server.api.validation.existsOrError(unidade.nome, 'Nome: campo obrigatório')
            app.server.api.validation.existsOrError(unidade.distrito, 'Distrito: campo obrigatório')
            app.server.api.validation.existsOrError(unidade.planilhaIdosos, 'Planilha de idosos: campo obrigatório')
            app.server.api.validation.existsOrError(unidade.planilhaGerenciamento, 'Planilha de gerenciamento: campo obrigatório')
            app.server.api.validation.existsOrError(unidade.fichaVigilancia, 'Ficha de vigilância: campo obrigatório')
            
            unidade.idPlanilhaIdosos = getSpreadsheetId(unidade.planilhaIdosos);
            unidade.idPlanilhaGerenciamento = getSpreadsheetId(unidade.planilhaGerenciamento);
            unidade.idFichaVigilancia = getFormId(unidade.fichaVigilancia);

            app.server.api.validation.existsOrError(unidade.idPlanilhaIdosos, 'Planilha de idosos: preencha com uma URL válida')
            app.server.api.validation.existsOrError(unidade.idPlanilhaGerenciamento, 'Planilha de gerenciamento: preencha com uma URL válida')
            app.server.api.validation.existsOrError(unidade.idFichaVigilancia, 'Ficha de vigilância: preencha com uma URL válida')

            delete unidade.planilhaIdosos;
            delete unidade.planilhaGerenciamento;
            delete unidade.fichaVigilancia;
        } catch(msg) {
            //TODO retornar o msg.toString() em todos os catchs da api
            return res.status(400).send(msg.toString());
        }

        unidade.collectionPrefix = unidade.nome.replace(/[^a-zA-Z0-9]/g,'_');
        unidade.ativo = true;
        unidade.autoSync = false;
        unidade.lastSyncDate = null;
        // unidade.log = [];
        // unidade.qtdVigilantes = 0;
        // unidade.indexIdosos = [];
        // unidade.indexRespostas = 1;
        unidade.vigilantes = [];

        const sheetsToSync = [];
        sheetsToSync.push({
            indexed: 0,//não utilizado por enquanto
            size: 1000,//não utilizado...
            sheetName: "Respostas",
        });
        try {
            const spreadSheetProperties = await sheetsApi.getProperties(unidade.idPlanilhaGerenciamento);

            for(let i = 0; i < spreadSheetProperties.sheets.length; i++) {
                const sheetName = spreadSheetProperties.sheets[i].properties.title;
                if(sheetName.startsWith("Vigilante ")){
                    sheetsToSync.push({
                        indexed: 0,//não utilizado por enquanto
                        size: 1000,//não utilizado...
                        sheetName,
                    })
                }
            }

            unidade.sync = sheetsToSync;
        } catch(err) {
            return console.log(err);
        }

        console.log(unidade);
        try {
            const result = await unidadeService.insertOne(unidade);
            return res.status(200).json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    return { get, getById, save, toggleAutoSync };
};