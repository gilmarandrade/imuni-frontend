module.exports = app => {
    const { existsOrError } = app.api.validation;

    const save = (req, res) => {
        const category = { ...req.body };
        if(req.params.id) category.id = req.params.id;

        try {
            existsOrError(category.name, 'Nome não informado');
        } catch(msg) {
            return res.status(400).send(msg);
        }

        if(category.id) {
            //TODO update req.body.id
            try {
                return res.status(204).send();
            } catch(msg) {
                return res.status(500).send(msg);
            }
        } else {
           // TODO insert
           try {
                return res.status(204).send();
            } catch(msg) {
                return res.status(500).send(msg);
            } 
        }
    };

    const remove = async (req, res) => {
        //TODO remover
        try {
            existsOrError(req.params.id, 'Código da categoria não informado');
            return res.status(204).send();

        } catch(msg) {
            return res.status(400).send(msg);
        }
    };

    const get = (req, res) => {
        try {
            const categories = [
                {
                    id: 1,
                    name: 'notebook',
                    path: 'eletronico > notebook',
                    parentId: null,
                },
                {
                    id: 2,
                    name: 'carro',
                    path: 'veiculos > terrestre > carro',
                    parentId: 1,
                },
            ];
            return res.json(categories);

        } catch(msg) {
            return res.status(500).send(msg);
        }
    };

    const getById = (req, res) => {
        try {
            const categorie = {
                    id: 1,
                    name: 'notebook',
                    path: 'eletronico > notebook',
                    parentId: null,
                };
            return res.json(categorie);

        } catch(msg) {
            return res.status(500).send(msg);
        }
    };

    return { save, remove, get, getById };
};