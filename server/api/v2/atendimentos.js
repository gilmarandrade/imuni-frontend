
module.exports = app => {

    const save = async (req, res) => {

        const atendimento = req.body;

        console.log('Atendimento recebido', atendimento);
        return res.status(200).json(atendimento);
    }

    return { save };
};