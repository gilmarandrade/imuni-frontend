const bcrypt = require('bcrypt-nodejs');
const userService = require('../service/userService');
const unidadeService = require('../service/unidadeService');

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.server.api.validation;

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    };
    
    const insert = async (req, res) => {
        //TODO é preciso atualizar a lista de vigilantes e ids na collection unidade?

        const user = { ...req.body };

        // validações
        try {
            existsOrError(user.name, 'Nome não informado');
            existsOrError(user.email, 'E-mail não informado');
            existsOrError(user.password, 'Senha não informada');
            existsOrError(user.confirmPassword, 'Confirmação de senha não informada');
            equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem');
            existsOrError(user.role, 'Permissão não informada');

            if(user.role === 'VIGILANTE') {//TODO deveria permitir o cadastro de usuarios de outros tipos: progenitor, tutor?
                existsOrError(user.unidadeId, 'Unidade de Saúde não informada');
                const unidade = await unidadeService.findById(user.unidadeId);
                user.collectionPrefix = unidade.collectionPrefix;
                user.nomeUnidade = unidade.nome;
                //TODO deveria verificar se a unidade existe?
            }
            //verifica se já existe um usuario com esse email
            const userByEmail = await userService.findByEmail(user.email);
            notExistsOrError(userByEmail, 'Usuário já cadastrado com o email informado');
        } catch(msg) {
            console.log(msg)
            return res.status(400).send(msg);//TODO é preciso converter as mensagens para string, caso elas sejam objetos?
        }

        user.password = encryptPassword(user.password);
        
        delete user.confirmPassword;

        try {
            const result = await userService.insertOne(user);
            app.server.config.mail.send(
                `
                <div>
                  <header style="text-align: center;">
                    <h1 style="padding:34px 65px; font-family: 'Open Sans', verdana, sans-serif; font-size: 2.1875rem; font-weight:normal; line-height: 2.9rem;background-color:#BED1D2; color:#206164; text-align: center;">convite</h1>
                  </header>
                  <section style="padding:34px 65px;font-family: Open Sans, verdana, sans-serif; font-size: 1rem;line-height: 1.375rem; color: rgba(0, 0, 0, 0.87);">
                    <p>Prezado(a) ${user.name},</p>
                    <p>
                    Você recebeu um convite para gerenciar o Sistema de Monitoramento de Idosos...
                    </p>
                  </section>
                </div>
                `,
                "Convite",
                user.email
              ).catch(console.error);
            return res.status(204).send();
        } catch(err) {
            return res.status(500).send(err);
        }

    }

    // const get = async (req, res) => {
    //     try {
    //         const result = await userService.findAll();
    //         return res.json(result);
    //     } catch(err) {
    //         return res.status(500).send(err);
    //     }
    // }

    const getByUnidadeId = async (req, res) => {
        try {
            const result = await userService.findByUnidade(req.params.unidadeId);
            console.log(result)
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    return { insert, getByUnidadeId }
}
