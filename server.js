const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DB_FILE = 'users.json';

app.use(cors()); // Permite que o Front fale com o Back
app.use(bodyParser.json());

// Função auxiliar para ler usuários
const getUsers = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Função auxiliar para salvar usuários
const saveUsers = (users) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
};

// ROTA DE LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, message: "Login realizado com sucesso!" });
    } else {
        res.status(401).json({ success: false, message: "Usuário ou senha incorretos." });
    }
});

// ROTA DE CADASTRO (Para testarmos o CRUD de usuários também)
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: "Usuário já existe." });
    }

    users.push({ username, password });
    saveUsers(users);

    res.json({ success: true, message: "Usuário cadastrado com sucesso!" });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});