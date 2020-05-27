const schedule = require('node-schedule');

module.exports = app => {
    schedule.scheduleJob('*/1 * * * *', async function() {
        //TODO  conta quantidade de elementos no banco relacional
        const usersCount = 2;
        const categoriresCount = 5;
        const articlesCount = 10;

        const { Stat } = app.api.stat;

        const lastStat = await Stat.findOne({}, {}, { sort: { 'createdAt': -1 } });

        const stat = new Stat({
            users: usersCount,
            categories: categoriresCount,
            articles: articlesCount,
            createdAt: new Date(),
        });

        //compara para ver se as estatisticas mudaram, se sim, insere a nova estatistica no mongo
        const changeUsers = !lastStat || stat.users !== lastStat.users;
        const changeCategories = !lastStat || stat.categories !== lastStat.categories;
        const changeArticles = !lastStat || stat.articles !== lastStat.articles;

        if(changeUsers || changeCategories || changeArticles) {
            stat.save().then(() => console.log('[Stats] Estatísticas atualizadas!'));
        }

    });

};