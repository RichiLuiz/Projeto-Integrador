const express = require('express');
const cors = require('cors');

const { connectDB } = require('./api/db');

const motoristasRoutes =
    require('./api/routes/motoristas');

const responsaveisRoutes =
    require('./api/routes/responsaveis');

const authRoutes =
    require('./api/routes/auth');

const motoristaDashboardRoutes =
    require('./api/routes/motoristaDashboard');

const responsavelDashboardRoutes =
    require('./api/routes/responsaveisDashboard');

const escolasRoutes =
    require('./api/routes/escolas');

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

app.use(
    '/responsaveis',
    responsavelDashboardRoutes
);

// =========================

app.listen(3000, () => {
    console.log('API rodando na porta 3000');
});