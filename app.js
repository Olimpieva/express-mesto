require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const auth = require('./middlewares/auth');
const routerUsers = require('./routes/users');
const routerCards = require('./routes/cards');
const { createUser, login } = require('./controllers/users');

const { PORT = 3000 } = process.env;

const app = express();
mongoose.connect('mongodb://localhost:27017/mestodb');

console.log(process.env.NODE_ENV);
// 4a2d71cee63dd7c565a4857c8b786e37

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

// app.use((req, res, next) => {
//   req.user = {
//     _id: '618ec39466569be6af15a61f',
//   };

//   next();
// });

app.get('/', (req, res) => res.send('Its working!'));
app.post('/signup', createUser);
app.post('/signin', login);
app.use(auth);
app.use('/', routerUsers);
app.use('/', routerCards);
app.use('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемая страница не найдена' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
