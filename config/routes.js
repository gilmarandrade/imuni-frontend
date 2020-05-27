module.exports = app => {
    //  A ordem das urls tem que ser da mais especifica para a mais genérica
    app.route('/users')
        .post(app.api.user.save)
        .get(app.api.user.get);

    app.route('/users/:id')
        .put(app.api.user.save)
        .get(app.api.user.getById);

    app.route('/categories')
        .post(app.api.category.save)
        .get(app.api.category.get);

    app.route('/categories/tree')
        .get(app.api.category.getTree);

    app.route('/categories/:id')
        .put(app.api.category.save)
        .get(app.api.category.getById)
        .delete(app.api.category.remove);

    app.route('/articles')
        .get(app.api.article.get)
        .post(app.api.article.save);

    app.route('/articles/:id')
        .get(app.api.article.getById)
        .put(app.api.article.save)
        .delete(app.api.article.remove);

    app.route('/categories/:id/articles')
        .get(app.api.article.getByCategory);
};
