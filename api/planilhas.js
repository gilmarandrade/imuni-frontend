const sheetsApi = require('../config/sheetsApi');

/**
 * Ler dados de um determinado range de uma planilha
 * 
 * Precisa do spreadsheetid (encontrado na url do arquivo no Drive)
 * E do range Ex: 'SheetName'!A1:Z10
 * 
 * Retorna um array de strings para cada linha encontrada no range. E string vazia para as células vazias.
 */
module.exports = app => {

    /**
     * Método genérico para ler qualquer aba de uma planilha
     */
    const get = async (req, res) => {
        const rows = await sheetsApi.read(req.params.id, `'${req.params.sheetName}'!${req.params.range}`);
        return res.json(rows);
    };

    return { get };
};
