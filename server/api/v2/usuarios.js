const crypto = require('crypto');

module.exports = app => {
    const { existsOrError, notExistsOrError, equalsOrError } = app.server.api.validation;

    const getByUnidadeId = async (req, res) => {
        try {
            const result = await app.server.service.v2.usuarioService.findByUnidade(req.params.unidadeId);
            console.log(result)
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    const sendInvitation = async (req, res) => {

        const user = { ...req.body };

        // validações
        try {
            existsOrError(user.name, 'Nome não informado');
            existsOrError(user.email, 'E-mail não informado');
            // existsOrError(user.password, 'Senha não informada');
            // existsOrError(user.confirmPassword, 'Confirmação de senha não informada');
            // equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem');
            existsOrError(user.role, 'Permissão não informada');

            if(user.role === 'VIGILANTE' || user.role === 'PRECEPTOR') {//TODO deveria permitir o cadastro de usuarios de outros tipos: preceptor, tutor?
                existsOrError(user.unidadeId, 'Unidade de Saúde não informada');
                // const unidade = await app.server.service.v2.unidadeService.getById(user.unidadeId);
                // TODO deprecated
                // user.collectionPrefix = unidade.collectionPrefix;
                // user.nomeUnidade = unidade.nome;
                //TODO deveria verificar se a unidade existe?
            }
            //verifica se já existe um usuario com esse email
            const userByEmail = await app.server.service.v2.usuarioService.findByEmail(user.email);
            notExistsOrError(userByEmail, 'Já existe um usuário cadastrado com o email informado');
        } catch(msg) {
            console.log(msg)
            return res.status(400).send(msg.toString());
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.invitationToken = token;
        user.invitationExpires = Date.now() + 3600000 * 48; // 48 hour

        try {
            user._id = await app.server.service.v2.usuarioService.insertOne(user);
            app.server.config.mail.send(
                `
                <div>
                  <header style="text-align: center;">
                    <h1 style="padding:34px 65px; font-family: 'Open Sans', verdana, sans-serif; font-size: 2.1875rem; font-weight:normal; line-height: 2.9rem;background-color:#BED1D2; color:#206164; text-align: center;">Valide seu acesso</h1>
                  </header>
                  <section style="padding:34px 65px;font-family: Open Sans, verdana, sans-serif; font-size: 1rem;line-height: 1.375rem; color: rgba(0, 0, 0, 0.87);">
                    <p>Prezado(a) ${user.name},</p>
                    <p>
                    Para acessar o Sistema de Monitoramento de Idosos, conclua seu cadastro:
                    <a href="${process.env.CLIENT_URL}/acceptInvitation/${user._id}/${user.invitationToken}">${process.env.CLIENT_URL}/acceptInvitation/${user._id}/${user.invitationToken}</a>
                    </p>
                  </section>
                </div>
                `,
                "Monitoramento de Idosos",
                user.email
              ).catch(console.error);
            return res.status(200).send('Convite enviado');
        } catch(err) {
            return res.status(500).send(err);
        }

    }

    const resendInvitation = async (req, res) => {

        const user = await app.server.service.v2.usuarioService.findById(req.params.userId);
        
        // validações
        try {
            //checar se o status do usuario está convite enviado
            existsOrError(user.invitationToken, 'Este usuário não tem convite pendente');
        } catch(msg) {
            return res.status(400).send(msg);
        }
        
        const token = crypto.randomBytes(20).toString('hex');
        user.invitationToken = token;
        user.invitationExpires = Date.now() + 3600000 * 48; // 48 hour

        try {
            await app.server.service.v2.usuarioService.replaceOne(user);
            app.server.config.mail.send(
                `
                <div>
                  <header style="text-align: center;">
                    <h1 style="padding:34px 65px; font-family: 'Open Sans', verdana, sans-serif; font-size: 2.1875rem; font-weight:normal; line-height: 2.9rem;background-color:#BED1D2; color:#206164; text-align: center;">Valide seu acesso</h1>
                  </header>
                  <section style="padding:34px 65px;font-family: Open Sans, verdana, sans-serif; font-size: 1rem;line-height: 1.375rem; color: rgba(0, 0, 0, 0.87);">
                    <p>Prezado(a) ${user.name},</p>
                    <p>
                    Para acessar o Sistema de Monitoramento de Idosos, conclua seu cadastro:
                    <a href="${process.env.CLIENT_URL}/acceptInvitation/${user._id}/${user.invitationToken}">${process.env.CLIENT_URL}/acceptInvitation/${user._id}/${user.invitationToken}</a>
                    </p>
                  </section>
                </div>
                `,
                "Monitoramento de Idosos",
                user.email
              ).catch(console.error);
            return res.status(200).send('Convite reenviado');
        } catch(err) {
            console.log(err)
            return res.status(500).send(err.toString());
        }

    }

    
    const getAdministradores = async (req, res) => {
        try {
            const result = await app.server.service.v2.usuarioService.findAdministradores();
            console.log(result)
            return res.json(result);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    const remove = async (req, res) => {
        try {
            const result = await app.server.service.v2.usuarioService.softDeleteOne(req.params.usuarioId);
            return res.json(result);
        } catch(err) {
            console.log(err);
            return res.status(500).send(err.toString());
        }
    }

    const updateStatus = async (req, res) => {
        try {
            const result = await app.server.service.v2.usuarioService.updateStatus(req.params.usuarioId, req.params.status);
            console.log(result)
            return res.json(`Usuário ${(req.params.status == 'ATIVO') ? 'ativado' : 'desativado'} com sucesso`);
        } catch(err) {
            return res.status(500).send(err);
        }
    }

    const completarCadastro = async (req, res) => {

        const usuario = { ...req.body };
        console.log(usuario)

        // validações
        try {
            existsOrError(usuario.email, 'E-mail não informado');

            //verifica se já existe um usuario com esse email
            const userByEmail = await app.server.service.v2.usuarioService.findByEmail(usuario.email);
            notExistsOrError(userByEmail, 'Já existe um usuário cadastrado com o email informado');
        } catch(msg) {
            console.log(msg)
            return res.status(400).send(msg.toString());
        }

        //atualiza email
        try {
            const result = await app.server.service.v2.usuarioService.updateEmail(req.params.usuarioId, usuario.email);
            console.log(result)
            // return res.json('Email atualizado com sucesso');
        } catch(err) {
            return res.status(500).send(err);
        }
        
        //envia convite
        try {
            const user = await app.server.service.v2.usuarioService.findById(req.params.usuarioId);
            
            const token = crypto.randomBytes(20).toString('hex');
            user.invitationToken = token;
            user.invitationExpires = Date.now() + 3600000 * 48; // 48 hour

            await app.server.service.v2.usuarioService.replaceOne(user);
            app.server.config.mail.send(
                `
                <div>
                  <header style="text-align: center;">
                    <h1 style="padding:34px 65px; font-family: 'Open Sans', verdana, sans-serif; font-size: 2.1875rem; font-weight:normal; line-height: 2.9rem;background-color:#BED1D2; color:#206164; text-align: center;">Valide seu acesso</h1>
                  </header>
                  <section style="padding:34px 65px;font-family: Open Sans, verdana, sans-serif; font-size: 1rem;line-height: 1.375rem; color: rgba(0, 0, 0, 0.87);">
                    <p>Prezado(a) ${user.name},</p>
                    <p>
                    Para acessar o Sistema de Monitoramento de Idosos, conclua seu cadastro:
                    <a href="${process.env.CLIENT_URL}/acceptInvitation/${user._id}/${user.invitationToken}">${process.env.CLIENT_URL}/acceptInvitation/${user._id}/${user.invitationToken}</a>
                    </p>
                  </section>
                </div>
                `,
                "Monitoramento de Idosos",
                user.email
              ).catch(console.error);

            await app.server.service.v2.usuarioService.updateStatus(req.params.usuarioId, 'CONVIDADO');

            return res.status(200).send('Convite enviado');
        } catch(err) {
            console.log(err)
            return res.status(500).send(err.toString());
        }
    }

    return { getByUnidadeId, sendInvitation, resendInvitation, getAdministradores, remove, updateStatus, completarCadastro }
}
