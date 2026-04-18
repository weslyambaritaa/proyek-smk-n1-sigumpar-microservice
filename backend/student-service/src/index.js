const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const studentRoutes = require('./routes/studentRoutes');
const extractIdentity = require('./middleware/extractIdentity');

require('./models');

const app = express();
const PORT = process.env.PORT || 3008;

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'student-service', timestamp: new Date().toISOString() });
});

app.use('/api/student', extractIdentity, studentRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan' });
});

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log('Student Service running on port ' + PORT);
});
