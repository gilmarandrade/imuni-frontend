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
                    name: 'Web Moderno',
                    path: 'Web Moderno',
                    parentId: null,
                },
                {
                    id: 2,
                    name: 'CSS',
                    path: 'Web Moderno > CSS',
                    parentId: 1,
                },
                {
                    id: 3,
                    name: 'Font-size',
                    path: 'Web Moderno > CSS > Font-size',
                    parentId: 2,
                },
                {
                    id: 4,
                    name: 'Flexbox',
                    path: 'Web Moderno > CSS > Flexbox',
                    parentId: 2,
                },
            ];
            return res.json(categories);

        } catch(msg) {
            return res.status(500).send(msg);
        }
    };

    const getById = (req, res) => {
        try {
            const categorie =  {
                id: req.params.id,
                name: 'Flexbox',
                path: 'Web Moderno > CSS > Flexbox',
                parentId: 2,
            };
            return res.json(categorie);

        } catch(msg) {
            return res.status(500).send(msg);
        }
    };

    const toTree = (categories, tree) => {
        if(!tree) tree = categories.filter(c => !c.parentId);
        tree = tree.map(parentNode => {
            const isChild = node => node.parentId == parentNode.id;
            parentNode.children = toTree(categories, categories.filter(isChild));
            return parentNode;
        });

        return tree;
    }; 

    const getTree = (req, res) => {
        // TODO buscar as categorias no banco
        try {
            const categories = [
                {
                    id: 1,
                    name: 'Web Moderno',
                    path: 'Web Moderno',
                    parentId: null,
                },
                {
                    id: 2,
                    name: 'CSS',
                    path: 'Web Moderno > CSS',
                    parentId: 1,
                },
                {
                    id: 3,
                    name: 'Font-size',
                    path: 'Web Moderno > CSS > Font-size',
                    parentId: 2,
                },
                {
                    id: 4,
                    name: 'Flexbox',
                    path: 'Web Moderno > CSS > Flexbox',
                    parentId: 2,
                },
            ];
            return res.json(toTree(categories));

        } catch(msg) {
            return res.status(500).send(msg);
        }

    };

    return { save, remove, get, getById, getTree };
};