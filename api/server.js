const express = require('express');
const cors = require('cors');

const { connectDB } = require('./api/db');

const motoristasRoutes =
require('./routes/motoristas');

const responsaveisRoutes =
require('./routes/responsaveis');

const authRoutes =
require('./routes/auth');

const motoristaDashboardRoutes =
require('./routes/motoristaDashboard');

const responsavelDashboardRoutes =
require('./routes/responsaveisDashboard');

const escolasRoutes =
require('./routes/escolas');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// =========================
// ROTAS
// =========================

app.use('/motoristas', motoristasRoutes);

app.use('/responsaveis', responsaveisRoutes);

app.use('/auth', authRoutes);

app.use('/escolas', escolasRoutes);


// DASHBOARDS

app.use(
    '/motoristas',
    motoristaDashboardRoutes
);

app.use('/responsaveis', responsavelDashboardRoutes);


// =========================

app.listen(3000, () => {

    console.log('API rodando na porta 3000');
});
