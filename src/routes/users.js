const express = require('express');
const router = express.Router();

// TODO: Реализовать контроллеры пользователей
router.get('/', (req, res) => {
  res.json({ message: 'Users routes - в разработке' });
});

module.exports = router;
