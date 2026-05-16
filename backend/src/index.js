require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', require('./routes/users'));
app.use('/listings', require('./routes/listings'));
app.use('/investments', require('./routes/investments'));

app.get('/health', (_, res) => res.json({ ok: true }));

// Must be 4-argument signature for Express to treat as error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
