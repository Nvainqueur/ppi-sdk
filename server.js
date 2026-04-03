const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Serve static files with correct CORS headers for SDK embedding
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
});

app.use(express.static(path.join(__dirname)));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Publisher SDK server running on port ${PORT}`));
