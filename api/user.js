const bcrypt = require('bcrypt-nodejs');

module.exports = app => {

    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation;

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    };

    // cria um novo registro ou atualiza um registro com id passado como param
    const save = async (req, res) => {
        const user = { ...req.body };
        if(req.params.id) user.id = req.params.id;

        // validações
        try {
            existsOrError(user.name, 'Nome não informado');
            existsOrError(user.email, 'E-mail não informado');
            existsOrError(user.password, 'Senha não informada');
            existsOrError(user.confirmPassword, 'Confirmação de senha não informada');
            equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem');

            // TODO verificar no banco se já existe um usuário com o email cadastrado 
            // if(!user.id) {
            //     notExistsOrError(userFromBD, 'Usuário já cadastrado');
            // }
        } catch(msg) {
            return res.status(400).send(msg);
        }

        user.password = encryptPassword(user.password);
        delete user.confirmPassword;

        //update
        if(user.id) {
            try {
                // TODO realizar update no banco
                return res.status(204).send();
            } catch (err) {
                res.status(500).send(err);
            }
        } else {
            try {
                //TODO inserção
                return res.status(204).send();
            } catch(err) {
                return res.status(500).send(err);
            }
        }
    };

    //listar todos os usuários (sem paginação)
    const get = (req, res) => {
        // TODO consultar banco
        try {
            const users = [
                {
                    id: 1,
                    name: 'Alison',
                    email: 'alison@email.com',
                    admin: true, 
                },
                {
                    id: 2,
                    name: 'Bruno',
                    email: 'bruno@email.com',
                    admin: false, 
                },
            ];
            return res.json(users);
        } catch(err) {
            return res.status(500).send(err);
        }
    };

    //retorna um usuário pelo id
    const getById = (req, res) => {
        // TODO consultar banco
        try {
            const user = {
                    id: req.params.id,
                    name: 'Alison',
                    email: 'alison@email.com',
                    admin: true, 
                };
            return res.json(user);
        } catch(err) {
            return res.status(500).send(err);
        }
    };

    return { save, get, getById };
};
