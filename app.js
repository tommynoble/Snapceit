const express = require('express');
const firebaseMiddleware = require('./middleware/firebaseMiddleware');

const app = express();
const port = process.env.PORT || 3000;

// ...existing code...

app.use('/your-endpoint', firebaseMiddleware, (req, res) => {
  res.json(req.firebaseData);
});

// ...existing code...

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
