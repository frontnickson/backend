const express = require('express');
const router = express.Router();

// TODO: Реализовать контроллеры уведомлений
router.get('/', (req, res) => {
  res.json({ message: 'Notifications routes - в разработке' });
});

module.exports = router;
