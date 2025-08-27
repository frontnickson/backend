const express = require('express');
const router = express.Router();

// TODO: Реализовать контроллеры задач
router.get('/', (req, res) => {
  res.json({ message: 'Tasks routes - в разработке' });
});

module.exports = router;
