module.exports = app => {
    const { existsOrError } = app.api.validation;

    const save = (req, res) => {
        const article = { ...req.body };
        if(req.params.id) article.id = req.params.id;

        try {
            existsOrError(article.name, 'Nome não informado');
            existsOrError(article.description, 'Descrição não informado');
            existsOrError(article.categoryId, 'Categoria não informado');
            existsOrError(article.userId, 'Usuario não informado');
            existsOrError(article.content, 'Conteúdo não informado');
        } catch(msg) {
            return res.status(400).send(msg);
        }

        if(article.id) {
            //TODO update no banco
            try {
                return res.status(204).send();
            } catch(msg) {
                return res.status(500).send(msg);
            }
        } else {
            //TODO insert no banco
            try {
                return res.status(204).send();
            } catch(msg) {
                return res.status(500).send(msg);
            }        
        }
    };

    const remove = async (req, res) => {
        //TODO delete no banco
        try {
            return res.status(204).send();
        } catch(msg) {
            return res.status(400).send(msg);
        }
    };

    const limit = 10; // usado para paginação de consulta

    const get = async (req, res) => {
        const page = req.query.page || 1;

        // TODO buscar resultados no banco
        /**
         * considerar:
         * count -> quantidade de resultados encontrados
         * limit -> quanitdade de resultados por página
         * page -> indica a página a ser retornada
         * offset = page * limit - limit
         */
        const articles = [
            {
                id: 1,
                name: 'Como instalar MongoDB',
                description: 'Do básico ao avançado',
            },
            {
                id: 2,
                name: 'Melhores frameworks',
                description: 'comparação de cada framework no mercado',
            },
        ];
        const count = 34;
        try {
            return res.json({ data: articles, count, limit});
        } catch(msg) {
            return res.status(500).send(msg);
        }

    };

    const getById = async (req, res) => {

        const article = {
                id: req.params.id,
                name: 'Como instalar MongoDB',
                description: 'Do básico ao avançado',
                categoryId: 1,
                userId: 1,
                content: 'lorem ipsum dolor',
            };

        try {
            article.content.toString();
            return res.json(article);
        } catch(msg) {
            return res.status(500).send(msg);
        }

    };

    return { save, remove, get, getById };
};