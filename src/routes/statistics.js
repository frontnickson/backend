const express = require('express');
const router = express.Router();

// TODO: Реализовать контроллеры статистики
router.get('/', (req, res) => {
  res.json({ message: 'Statistics routes - в разработке' });
});

module.exports = router;
