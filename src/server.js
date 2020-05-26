const port = 3000;

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/produtos', (req, res, next) => {
    res.send({ nome: 'Notebook', preco: 123.45 });
});

app.get('/produtos/:id', (req, res, next) => {
    res.send({ id: req.params.id });
});

app.post('/produtos', (req, res, next) => {
    res.send({ nome: req.body.nome, preco: req.body.preco });
});

app.put('/produtos/:id', (req, res, next) => {
    res.send({ nome: req.body.nome, preco: req.body.preco });
});

app.delete('/produtos/:id', (req, res, next) => {
    res.send({ id: req.params.id });
});

app.listen(port, () => {
    console.log(`servidor executando na porta ${port}`);
});
