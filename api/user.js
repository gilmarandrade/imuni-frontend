const bcrypt = require('bcrypt-nodejs');
const userService = require('../service/userService');

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation;

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    };
    
    const insert = async (req, res) => {

        const user = { ...req.body };

        // validações
        try {
            existsOrError(user.name, 'Nome não informado');
            existsOrError(user.email, 'E-mail não informado');
            existsOrError(user.password, 'Senha não informada');
            existsOrError(user.confirmPassword, 'Confirmação de senha não informada');
            equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem');
            //verifica se já existe um usuario com esse email
            const userByEmail = await userService.findByEmail(user.email);
            notExistsOrError(userByEmail, 'Usuário já cadastrado com o email informado');
        } catch(msg) {
            return res.status(400).send(msg);
        }

        user.password = encryptPassword(user.password);
        delete user.confirmPassword;

        try {
            const result = await userService.insertOne(user);
            return res.status(204).send();
        } catch(err) {
            return res.status(500).send(err);
        }

    }

    return { insert }
}