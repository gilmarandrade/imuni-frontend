/**
 * @deprecated
 */
const schedule = require('node-schedule');
const unidadeService = require('../service/unidadeService');
const syncService = require('../service/syncService');

module.exports = app => {
    // '42 * * * * *' no segundo 42
    // '0 22 * * *' 22:00
    // '0 * * * *' a cada hora (no minuto 0)
    schedule.scheduleJob('0 22 * * *', async function () {
        const startDate = new Date();
        console.log('[autoSyncShedule] JOB STARTED ', startDate.toLocaleString());
        try {
            const result = await unidadeService.findAll();
            const unidadesToSync = result.filter(unidade => unidade.autoSync === true);
            for(let i = 0; i < unidadesToSync.length; i++) {
                console.log(`[autoSyncShedule] ${i+1}/${unidadesToSync.length} -------------------------`);
                try {
                    await syncService.resetUnidade(unidadesToSync[i]._id);
                    await syncService.importFromPlanilhaUnidade(unidadesToSync[i]._id);
                        
                } catch(err) {
                    console.error(`[autoSyncShedule] ${unidade.nome}: ${err.toString()}`);
                }
            }
        } catch(err) {
            console.error(err);
        } finally {
            const endDate = new Date();
            console.log('[autoSyncShedule] JOB ENDED ', endDate.toLocaleString());
            console.log('[autoSyncShedule] runtime ', (endDate - startDate) / 1000 / 60, 'min');
        }
    });
};