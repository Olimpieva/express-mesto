require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { celebrate, Joi } = require('celebrate');

const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-determinant');
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
const { createUser, login } = require('./controllers/users');
const NotFoundError = require('./errors/not-found-error');
const { urlServer } = require('./utils/constants');

const { PORT = 3000 } = process.env;

const app = express();
mongoose.connect(urlServer);

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.get('/', (req, res) => res.send('Its working!'));

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8)
        .pattern(/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{8,}$/),
      name: Joi.string().default('Жак-Ив Кусто').min(2).max(30),
      about: Joi.string().default('Исследователь').min(2).max(30),
      avatar: Joi.string()
        .default('https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png')
        .regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/),
    }),
  }),
  createUser,
);

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  login,
);

app.use(auth);
app.use('/', routerUsers);
app.use('/', routerCards);
app.use('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемая страница не найдена'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
