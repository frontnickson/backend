const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0); // Успех
  } else {
    process.exit(1); // Ошибка
  }
});

request.on('error', () => {
  process.exit(1); // Ошибка
});

request.on('timeout', () => {
  request.destroy();
  process.exit(1); // Таймаут
});

request.end();
