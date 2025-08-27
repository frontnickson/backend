const express = require('express');
const router = express.Router();

// TODO: Реализовать контроллеры досок
router.get('/', (req, res) => {
  res.json({ message: 'Boards routes - в разработке' });
});

module.exports = router;
