const notFound = (req, res, next) => {
  const error = new Error(`Маршрут не найден: ${req.originalUrl}`);
  error.status = 404;
  error.type = 'NOT_FOUND';
  
  // Логируем попытку доступа к несуществующему маршруту
  console.warn('⚠️ Попытка доступа к несуществующему маршруту:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  next(error);
};

module.exports = notFound;
