const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;
const SECRET_KEY = "chave_secreta"; // Substituir por uma chave mais segura

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Banco de dados
const db = new sqlite3.Database("./users.db");

// Criar tabelas (executa apenas uma vez)
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT,
    password TEXT
)`);
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // Verificar se todos os campos estão preenchidos
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir no banco de dados
    const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(query, [username, email, hashedPassword], (err) => {
        if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
                return res.status(400).json({ message: "Nome de usuário já existe" });
            }
            return res.status(500).json({ message: "Erro ao registrar usuário" });
        }
        res.status(201).json({ message: "Usuário registrado com sucesso" });
    });
});
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios" });
    }

    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Erro ao buscar usuário" });
        }
        if (!user) {
            return res.status(400).json({ message: "Usuário ou senha incorretos" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: "Usuário ou senha incorretos" });
        }

        // Gerar um token JWT
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
            expiresIn: "1h",
        });

        res.status(200).json({ message: "Login realizado com sucesso", token });
    });
});
function authenticateToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Token não fornecido" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.user = user; // Adiciona o usuário à requisição
        next();
    });
}
app.get("/protected", authenticateToken, (req, res) => {
    res.status(200).json({ message: `Bem-vindo, ${req.user.username}!` });
});
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
