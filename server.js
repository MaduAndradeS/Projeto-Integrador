const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;
const SECRET_KEY = "chave_secreta"; // Substitua por uma chave mais segura!

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

db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_month TEXT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)`);

// Registro de usuários
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

// Login de usuários
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

        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
            expiresIn: "1h",
        });

        res.status(200).json({ message: "Login realizado com sucesso", token });
    });
});

// Middleware de autenticação
function authenticateToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        console.error("Token não fornecido.");
        return res.status(401).json({ message: "Token não fornecido" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error("Token inválido:", err.message);
            return res.status(403).json({ message: "Token inválido" });
        }
        req.user = user;
        next();
    });
}

// Rota protegida de teste
app.get("/protected", authenticateToken, (req, res) => {
    res.status(200).json({ message: `Bem-vindo, ${req.user.username}!` });
});

// Adicionar comentários
app.post("/comments", authenticateToken, (req, res) => {
    const { book_month, comment } = req.body;
    const user_id = req.user.id;

    if (!book_month || !comment) {
        return res.status(400).json({ message: "Campos obrigatórios não preenchidos" });
    }

    const query = `INSERT INTO comments (user_id, book_month, comment) VALUES (?, ?, ?)`;
    db.run(query, [user_id, book_month, comment], function (err) {
        if (err) {
            console.error("Erro ao adicionar comentário no banco:", err.message);
            return res.status(500).json({ message: "Erro ao adicionar comentário" });
        }
        res.status(201).json({ message: "Comentário adicionado com sucesso!", id: this.lastID });
    });
});

// Buscar comentários
app.get("/comments/:book_month", (req, res) => {
    const { book_month } = req.params;

    const query = `
        SELECT u.username, c.comment, c.created_at
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.book_month = ?
        ORDER BY c.created_at DESC
    `;

    db.all(query, [book_month], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar comentários:", err.message);
            return res.status(500).json({ message: "Erro ao buscar comentários" });
        }
        res.json(rows);
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
const path = require("path");

const path = require("path");

// Serve arquivos estáticos diretamente da pasta atual (onde está o server.js)
app.use(express.static(__dirname));

// Rota para servir o arquivo index.html na URL raiz "/"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
