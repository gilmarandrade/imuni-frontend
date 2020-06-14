const schedule = require('node-schedule');
const { runSync } = require('../api/sync');

module.exports = app => {
    schedule.scheduleJob('*/5 * * * *', async function() {
        console.log('schedule ' + new Date().toLocaleString());
        const result = await app.api.sync.runSync();
        console.log(result);
    });

};