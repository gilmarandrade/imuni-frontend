
module.exports = app => {

    const get = async (req, res) => {
        try {
            const result = await app.server.service.v2.unidadeService.findAtivos();
            return res.json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    const getById = async (req, res) => {
        try {
            const result = await app.server.service.v2.unidadeService.getById(req.params.unidadeId);
            return res.json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    //TODO não permitir o cadastro duplicado de unidades?
    const save = async (req, res) => {
        const unidade = req.body;

        try {
            //TODO a unidade não pode ter um nome que já existe
            app.server.api.validation.existsOrError(unidade.nome, 'Nome: campo obrigatório')
            app.server.api.validation.existsOrError(unidade.distrito, 'Distrito: campo obrigatório')
        } catch(err) {
            console.log(err);
            return res.status(400).send(err.toString());
        }

        console.log(unidade);
        try {
            const result = await app.server.service.v2.unidadeService.upsertOne(unidade);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    //TODO migrar unidade a partir de planilha
    const migrate = async (req, res) => {
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

        } catch(err) {
            console.log(err);
            return res.status(400).send(err.toString());
        }

        unidade.collectionPrefix = unidade.nome.replace(/[^a-zA-Z0-9]/g,'_');
        // unidade.ativo = true;
        // unidade.autoSync = false;
        // unidade.lastSyncDate = null;
        // unidade.vigilantes = [];

        console.log(unidade);
        try {
            const result = await app.server.service.v2.unidadeService.upsertOne(unidade);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    /**
     * Migração das unidades cadastradas no banco antigo para o formato compatível com a versão 2
     * @param {*} req 
     * @param {*} res 
     */
    const adequarUnidades = async (req, res) => {
        try {
            const unidades = await app.server.service.v2.unidadeService.findAll();
            
            unidades.forEach(unidade => {
                unidade._isDeleted = false;
                unidade.planilhaIdosos = `https://docs.google.com/spreadsheets/d/${unidade.idPlanilhaIdosos}/edit?usp=sharing`;
                unidade.planilhaGerenciamento = `https://docs.google.com/spreadsheets/d/${unidade.idPlanilhaGerenciamento}/edit?usp=sharing`;
                unidade.fichaVigilancia = `https://docs.google.com/forms/d/${unidade.idFichaVigilancia}/edit?usp=sharing`;
            });
            
            const result = await app.server.service.v2.unidadeService.bulkUpdateOne(unidades);
            return res.status(200).json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    const remove = async (req, res) => {
        try {
            const result = await app.server.service.v2.unidadeService.softDeleteOne(req.params.unidadeId);
            return res.json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    return { get, save, adequarUnidades, getById, remove };
};