
module.exports = app => {

    const save = async (req, res) => {

        const atendimento = req.body;

        console.log('ATENDIMENTO RECEBIDO:');
        console.log(atendimento);
        atendimento.forEach(element => {
            console.log(element);
        });
        return res.status(200).json(atendimento);
    }

    return { save };
};