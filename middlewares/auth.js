const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    let payload;
    try {
      payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret', { expiresIn: '7d' });
    } catch (err) {
      res.status(401).send({ message: 'Переданы некорректные данные при авторизации пользователя.' });
    }
    req.user = payload;
    next();
  }
};
