const express = require('express');
const router = express.Router();

// TODO: Реализовать контроллеры команд
router.get('/', (req, res) => {
  res.json({ message: 'Teams routes - в разработке' });
});

module.exports = router;
