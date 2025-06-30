require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT2 || 5000;

const dbConfig = {
  user: process.env.DB_USER2,
  password: process.env.DB_PASSWORD2,
  server: process.env.DB_HOST2,
  database: process.env.DB_NAME2,
  port: parseInt(process.env.DB_PORT2, 10),
  pool: {
    max: parseInt(process.env.DB_CONNECTION_LIMIT2, 10),
  },
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

app.use(express.json());
const allowedOrigins = [
  'https://www.mercotech.com.br',
  'https://mercotech.com.br'
];
app.set('trust proxy', 1);

app.use(session({
    secret: process.env.SESSION_SECRET2,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 8 * 60 * 60 * 1000 // 8 horas
    }
}));
app.use(session({
    secret: process.env.SESSION_SECRET2,
    resave: false,                      
    saveUninitialized: false,           
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,                               
        maxAge: 8 * 60 * 60 * 1000                    
    }
}));

app.post('/api/logistica/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.DB_LOGIN2 && password === process.env.DB_SENHA2) {
        req.session.user = {
            username: username,
            loggedIn: true
        };
        res.json({ success: true, message: 'Login bem-sucedido.' });
    } else {
        res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
    }
});

app.post('/api/logistica/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Não foi possível fazer logout.' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logout realizado com sucesso.' });
    });
});

const isAuthenticated = (req, res, next) => {
    if (req.session.user && req.session.user.loggedIn) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Acesso não autorizado. Por favor, faça o login.' });
    }
};

app.get('/api/logistica/dados-view', isAuthenticated, async (req, res) => {
  const viewName = process.env.DB_VIEW2;
  try {
    await sql.connect(dbConfig);
    const query = `SELECT * FROM ${viewName}`;
    const result = await sql.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error(`Erro ao buscar a view '${viewName}':`, error);
    res.status(500).json({
      error: 'Erro ao consultar o banco de dados',
      details: error.message
    });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
